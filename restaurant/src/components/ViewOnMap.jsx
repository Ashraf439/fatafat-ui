import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function ViewOnMap({ lat, lng, name, className = "h-56 w-full overflow-hidden rounded-xl border" }) {
  if (lat == null || lng == null) return null;
  return (
    <div className={className}>
      <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} dragging={false} className="h-full w-full">
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}