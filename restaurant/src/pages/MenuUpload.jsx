import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadMenu, getMenuItems } from "../api/menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function MenuUpload() {
  const [phase, setPhase] = useState("checking");
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const refreshMenu = async () => {
    try {
      setApiError("");
      const data = await getMenuItems();
      if (!data || data.length === 0) {
        setItems([]);
        setPhase("form");
        return;
      }
      setItems(data);
      setPhase("items");
    } catch (err) {
      setApiError(err.message);
      setPhase("form");
    }
  };

  useEffect(() => {
    refreshMenu();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    try {
      const res = await uploadMenu(file);
      toast.success(res.message);
      setFile(null);
      e.target.reset();
      await refreshMenu();
    } catch (err) {
      toast.error(err.message);
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "checking") {
    return (
      <div className="flex items-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="font-mono text-sm">Loading menu…</p>
      </div>
    );
  }

  if (phase === "items") {
    // Group items by category, preserving first-seen order
    const groups = [];
    const groupIndex = {};
    for (const item of items) {
      const cat = item.category || "Other";
      if (!(cat in groupIndex)) {
        groupIndex[cat] = groups.length;
        groups.push({ category: cat, items: [] });
      }
      groups[groupIndex[cat]].items.push(item);
    }

    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-2 flex items-center justify-between">
          <div />
          <button
            onClick={() => setPhase("form")}
            className="text-xs font-medium text-primary hover:underline"
          >
            Re-upload CSV
          </button>
        </div>

        <Card className="px-8 py-10 sm:px-12">
          <div className="mb-10 text-center">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              Our Menu
            </p>
            <div className="mx-auto h-px w-10 bg-primary/40" />
          </div>

          {groups.map((group) => (
            <div key={group.category} className="mb-10 last:mb-0">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="whitespace-nowrap font-serif text-lg tracking-wide text-foreground">
                  {group.category}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-5">
                {group.items.map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex items-baseline gap-2">
                      <FoodTypeDot type={item.foodType} />
                      <span className="font-serif font-medium text-foreground">{item.dishName}</span>
                      <span className="-translate-y-0.75 flex-1 border-b border-dotted border-border" />
                      <span className="font-medium tabular-nums text-foreground">
                        ₹{Number(item.price).toFixed(0)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 pl-5">
                      {item.description && (
                        <p className="text-xs italic leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.preparationTimeMinutes && (
                        <span className="whitespace-nowrap text-[10px] text-muted-foreground/70">
                          {item.preparationTimeMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-bold text-foreground">Upload menu</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        CSV columns: DishName, Description, Price, FoodType (VEG / NON_VEG / EGG), Category, PreparationTime
      </p>
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/70"
            />
            <Button type="submit" disabled={!file || submitting} className="mt-4">
              {submitting ? "Uploading…" : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {apiError && <p className="mt-4 text-sm text-destructive">{apiError}</p>}
    </div>
  );
}

const FoodTypeDot = ({ type }) => {
  const color =
    type === "NON_VEG" ? "border-red-600" : type === "EGG" ? "border-yellow-600" : "border-green-600";
  const fill = type === "NON_VEG" ? "bg-red-600" : type === "EGG" ? "bg-yellow-600" : "bg-green-600";
  return (
    <span className={`flex w-3 h-3 shrink-0 items-center justify-center border ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${fill}`} />
    </span>
  );
};
