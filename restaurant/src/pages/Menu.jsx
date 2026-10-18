import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Download, ImagePlus, Loader2, Search, Upload, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FoodTypeMark } from "../components/FoodTypeMark";
import { getMenuItems, uploadMenu, uploadMenuItemImage } from "../api/menu";
import { optimizedImage } from "../lib/images";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-veg" },
  { value: "EGG", label: "Egg" },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CSV_TEMPLATE =
  "DishName,Description,Price,FoodType,Category,PreparationTime\n" +
  "Paneer Butter Masala,Creamy tomato gravy,220,VEG,Main Course,20\n" +
  "Chicken 65,Crispy fried and spiced,260,NON_VEG,Starters,15\n";

const rupees = (n) => `₹${Number(n).toFixed(0)}`;

export default function Menu() {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = async () => {
    try {
      setError("");
      setItems(await getMenuItems());
    } catch (err) {
      setError(err.message);
      setItems((prev) => prev ?? []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const replaceItem = (updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  const sections = useMemo(() => {
    const term = search.trim().toLowerCase();
    const groups = new Map();
    for (const item of items ?? []) {
      if (type !== "ALL" && item.foodType !== type) continue;
      if (term && !item.dishName.toLowerCase().includes(term) && !(item.category ?? "").toLowerCase().includes(term)) continue;
      const cat = item.category || "Other";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    return [...groups].map(([category, list]) => ({ category, items: list }));
  }, [items, search, type]);

  if (items === null) return <MenuSkeleton />;

  const total = items.length;
  const withoutPhoto = items.filter((i) => !i.imageUrl).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Menu</h1>
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "Add your dishes to start receiving orders."
              : `${total} ${total === 1 ? "dish" : "dishes"}${withoutPhoto ? ` · ${withoutPhoto} without a photo` : ""}`}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} variant={total === 0 ? "default" : "outline"}>
          <Upload /> {total === 0 ? "Upload menu (CSV)" : "Re-upload CSV"}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {total === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <UtensilsCrossed className="size-7" />
          </div>
          <h2 className="text-lg font-bold">Your menu is empty</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Upload a CSV with all your dishes in one go. You can add a photo to each dish afterwards.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => setUploadOpen(true)}>
              <Upload /> Upload menu (CSV)
            </Button>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download /> Sample file
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="sticky top-16 z-30 -mx-4 space-y-3 border-b bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes or categories"
                  aria-label="Search menu"
                  className="pr-9 pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Food type">
                {TYPE_FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    size="sm"
                    variant={type === f.value ? "default" : "outline"}
                    aria-pressed={type === f.value}
                    onClick={() => setType(f.value)}
                    className={cn("h-9 rounded-full px-4", type !== f.value && "bg-card")}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            {sections.length > 1 && (
              <nav aria-label="Categories" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
                {sections.map((s, i) => (
                  <Button
                    key={s.category}
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 rounded-full bg-card"
                    onClick={() => document.getElementById(`menu-cat-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    {s.category}
                  </Button>
                ))}
              </nav>
            )}
          </div>

          {sections.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No dishes match your search.</p>
          ) : (
            sections.map((s, i) => (
              <section key={s.category} id={`menu-cat-${i}`} className="scroll-mt-48">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  {s.category} <Badge variant="secondary">{s.items.length}</Badge>
                </h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {s.items.map((item) => (
                    <DishCard key={item.id} item={item} onChange={replaceItem} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}

      <CsvDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        hasExisting={total > 0}
        onUploaded={() => {
          setUploadOpen(false);
          load();
        }}
      />
    </div>
  );
}

function DishCard({ item, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const photo = optimizedImage(item.imageUrl, { width: 240, height: 240 });

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return toast.error("Please choose a JPEG, PNG or WEBP image.");
    if (file.size > MAX_IMAGE_BYTES) return toast.error("That photo is over 5 MB. Please pick a smaller one.");

    setUploading(true);
    try {
      onChange(await uploadMenuItemImage(item.id, file));
      toast.success(`Photo updated for ${item.dishName}`);
    } catch (err) {
      toast.error(err.message || "Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="flex gap-3 p-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={item.imageUrl ? `Change photo of ${item.dishName}` : `Add photo for ${item.dishName}`}
        className="group relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none sm:size-24"
      >
        {photo ? (
          <img src={photo} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <ImagePlus className="size-5" /> Add photo
          </span>
        )}
        {photo && !uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            Change
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </button>
      <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(",")} className="hidden" onChange={handleFile} />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start gap-2">
          <FoodTypeMark type={item.foodType} className="mt-1" />
          <h3 className="line-clamp-2 flex-1 leading-snug font-bold">{item.dishName}</h3>
        </div>
        <p className="text-sm font-semibold">{rupees(item.price)}</p>
        {item.description && <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
        {item.preparationTimeMinutes != null && <p className="text-[11px] text-muted-foreground/80">~{item.preparationTimeMinutes} min</p>}
      </div>
    </Card>
  );
}

function CsvDialog({ open, onOpenChange, hasExisting, onUploaded }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const close = (next) => {
    if (submitting) return;
    if (!next) {
      setFile(null);
      setError("");
    }
    onOpenChange(next);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await uploadMenu(file);
      toast.success(res.message);
      setFile(null);
      onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{hasExisting ? "Re-upload your menu" : "Upload your menu"}</DialogTitle>
            <DialogDescription>
              Choose a CSV with the columns <span className="font-mono text-xs">DishName, Description, Price, FoodType, Category, PreparationTime</span>.
              FoodType is VEG, NON_VEG or EGG.
            </DialogDescription>
          </DialogHeader>

          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
            <Download /> Download a sample file
          </Button>

          <input
            type="file"
            accept=".csv"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/70"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || submitting}>
              {submitting && <Loader2 className="animate-spin" />} Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "fatafat-menu-sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function MenuSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}