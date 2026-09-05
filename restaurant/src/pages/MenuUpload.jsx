import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { uploadMenu, getMenuItems } from "../api/menu";

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
      <div className="flex items-center gap-3 text-[#1C1B19]/60 p-6">
        <span className="w-4 h-4 border-2 border-[#CD0000] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono">Loading menu…</p>
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
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div />
          <button
            onClick={() => setPhase("form")}
            className="text-xs font-medium text-[#CD0000] hover:underline"
          >
            Re-upload CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 px-8 py-10 sm:px-12">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#CD0000] font-semibold mb-1">
              Our Menu
            </p>
            <div className="w-10 h-px bg-[#CD0000]/40 mx-auto" />
          </div>

          {groups.map((group) => (
            <div key={group.category} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-serif tracking-wide text-[#1C1B19] whitespace-nowrap">
                  {group.category}
                </h2>
                <div className="flex-1 h-px bg-[#1C1B19]/10" />
              </div>

              <div className="space-y-5">
                {group.items.map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex items-baseline gap-2">
                      <FoodTypeDot type={item.foodType} />
                      <span className="font-medium text-[#1C1B19] font-serif">
                        {item.dishName}
                      </span>
                      <span className="flex-1 border-b border-dotted border-[#1C1B19]/25 -translate-y-0.75" />
                      <span className="font-medium text-[#1C1B19] tabular-nums">
                        ₹{Number(item.price).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 pl-5">
                      {item.description && (
                        <p className="text-xs text-[#1C1B19]/50 italic leading-snug">
                          {item.description}
                        </p>
                      )}
                      {item.preparationTimeMinutes && (
                        <span className="text-[10px] text-[#1C1B19]/35 whitespace-nowrap">
                          {item.preparationTimeMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-[#1C1B19] mb-4">Upload menu</h1>
      <p className="text-sm text-[#1C1B19]/60 mb-6">
        CSV columns: DishName, Description, Price, FoodType (VEG / NON_VEG / EGG), Category, PreparationTime
      </p>
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-xl border border-black/5">
        <input
          type="file"
          accept=".csv"
          required
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={!file || submitting}
          className="mt-4 px-4 py-2.5 bg-[#CD0000] text-white rounded-lg hover:bg-[#A80000] disabled:opacity-50"
        >
          {submitting ? "Uploading…" : "Upload"}
        </button>
      </form>
      {apiError && <p className="mt-4 text-sm text-[#CD0000]">{apiError}</p>}
    </div>
  );
}

const FoodTypeDot = ({ type }) => {
  const color =
    type === "NON_VEG" ? "border-red-600" : type === "EGG" ? "border-yellow-600" : "border-green-600";
  const fill =
    type === "NON_VEG" ? "bg-red-600" : type === "EGG" ? "bg-yellow-600" : "bg-green-600";
  return (
    <span className={`w-3 h-3 border ${color} flex items-center justify-center shrink-0`}>
      <span className={`w-1.5 h-1.5 rounded-full ${fill}`} />
    </span>
  );
};