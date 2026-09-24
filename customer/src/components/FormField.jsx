import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Label + input + inline error, wired together for accessibility. */
export function FormField({ label, error, hint, id: idProp, ...inputProps }) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
