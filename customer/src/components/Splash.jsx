import { Loader2 } from "lucide-react";

export function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center text-primary">
      <Loader2 className="size-8 animate-spin" />
    </div>
  );
}
