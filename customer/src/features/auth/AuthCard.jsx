import { Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/Header";

/** Centered card shell shared by every auth screen. */
export function AuthCard({ title, description, children, footer, wide = false }) {
  return (
    <div className="flex justify-center py-6 sm:py-12">
      <div className={wide ? "w-full max-w-xl" : "w-full max-w-md"}>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 shadow-md sm:p-8">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </Card>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
