import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "Something went wrong" }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <h3 className="text-lg font-bold text-red-900">{title}</h3>
      <p className="max-w-sm text-sm text-red-800/80">{error?.message ?? "Please try again."}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
