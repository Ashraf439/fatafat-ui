import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Crosshair, Loader2, MapPin, Search } from "lucide-react";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default marker icons under Vite (asset URLs are rewritten).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Default view: India. Users normally search or use "current location".
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;
const FOCUS_ZOOM = 16;

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Convert a Nominatim `address` object into our form fields. */
function parseNominatimAddress(addr = {}) {
  const streetParts = [addr.house_number, addr.road || addr.pedestrian || addr.footway].filter(Boolean);
  return {
    street: streetParts.join(", ") || addr.neighbourhood || addr.suburb || addr.hamlet || "",
    city: addr.city || addr.town || addr.village || addr.city_district || addr.county || addr.state_district || "",
    state: addr.state || "",
    pincode: addr.postcode || "",
  };
}

async function reverseGeocode(lat, lng) {
  const res = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`, {
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) throw new Error("Reverse geocoding failed");
  return res.json();
}

/** Keeps the map centered on the selected position (search / locate / drag). */
function RecenterOnPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], Math.max(map.getZoom(), FOCUS_ZOOM));
  }, [position, map]);
  return null;
}

/** Emits map clicks so the user can drop the pin anywhere. */
function ClickToPlace({ onPick }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

/**
 * OpenStreetMap-based address picker (Leaflet + Nominatim — fully open source, no API key).
 *
 * Props:
 *   onAddressSelect({ street, city, state, pincode, lat, lng, displayName })
 *     Called whenever a location is confirmed (search result, map click, pin drag, geolocation).
 *   initialCenter / initialZoom — optional starting view.
 *   className — optional wrapper classes.
 */
export function MapAddressPicker({ onAddressSelect, initialCenter = DEFAULT_CENTER, initialZoom = DEFAULT_ZOOM, className = "" }) {
  const [position, setPosition] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [resolvedQuery, setResolvedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState(null);
  const searchBoxRef = useRef(null);
  const abortRef = useRef(null);

  const debouncedQuery = useDebounced(query);
  // Derived: true while the debounced query hasn't been answered yet (avoids setState-in-effect).
  const searching = debouncedQuery.trim().length >= 3 && resolvedQuery !== debouncedQuery.trim();

  // Place search via Nominatim (debounced, abortable).
  useEffect(() => {
    const q = debouncedQuery.trim();
    abortRef.current?.abort();
    if (q.length < 3) return; // stale results stay hidden (see the render guard below)
    const controller = new AbortController();
    abortRef.current = controller;
    fetch(
      `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`,
      { signal: controller.signal, headers: { "Accept-Language": "en" } },
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setResults(data);
        setShowResults(true);
        setResolvedQuery(q);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setResolvedQuery(q);
          setHint("Search is unavailable right now — you can still tap the map or use your location.");
        }
      });
    return () => controller.abort();
  }, [debouncedQuery]);

  // Close the suggestion list when clicking outside the search box.
  useEffect(() => {
    const onDocClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const confirmPosition = async (latlng, fallback = {}) => {
    setPosition(latlng);
    setHint(null);
    try {
      const data = await reverseGeocode(latlng.lat, latlng.lng);
      const parsed = parseNominatimAddress(data.address);
      onAddressSelect?.({
        ...fallback,
        ...parsed,
        lat: latlng.lat,
        lng: latlng.lng,
        displayName: data.display_name || fallback.displayName || "",
      });
    } catch {
      setHint("Couldn't fetch address details — you can still fill the fields manually.");
      onAddressSelect?.({ ...fallback, lat: latlng.lat, lng: latlng.lng });
    }
  };

  const pickSearchResult = (item) => {
    const latlng = { lat: Number(item.lat), lng: Number(item.lon) };
    setQuery(item.display_name);
    setShowResults(false);
    setResults([]);
    confirmPosition(latlng, { ...parseNominatimAddress(item.address), displayName: item.display_name });
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setHint("Geolocation isn't supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        confirmPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setHint("Couldn't get your location. Please search or tap on the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const markerEvents = {
    dragend: (e) => {
      const ll = e.target.getLatLng();
      confirmPosition({ lat: ll.lat, lng: ll.lng });
    },
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      {/* Search box */}
      <div ref={searchBoxRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search your area, street or landmark…"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border py-2 pl-9 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        {showResults && debouncedQuery.trim().length >= 3 && results.length > 0 && (
          <ul className="bg-popover text-popover-foreground absolute left-0 right-0 top-full z-[1100] mt-1 max-h-60 overflow-auto rounded-md border shadow-md">
            {results.map((item) => (
              <li key={item.place_id}>
                <button
                  type="button"
                  onClick={() => pickSearchResult(item)}
                  className="hover:bg-accent flex w-full items-start gap-2 px-3 py-2 text-left text-sm"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">{item.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={[initialCenter.lat, initialCenter.lng]}
          zoom={initialZoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
          <ClickToPlace onPick={confirmPosition} />
          {position && <RecenterOnPosition position={position} />}
          {position && <Marker position={[position.lat, position.lng]} draggable eventHandlers={markerEvents} />}
        </MapContainer>

        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="bg-background hover:bg-accent absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-sm disabled:opacity-60"
        >
          {locating ? <Loader2 className="size-3.5 animate-spin" /> : <Crosshair className="size-3.5" />}
          Use my location
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {hint ?? "Search above, tap the map, or drag the pin — the address fields will be filled in automatically."}
      </p>
    </div>
  );
}
