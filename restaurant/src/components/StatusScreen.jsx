import { Clock, Mail, Check, CreditCard, AlertTriangle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const IconClock = () => <Clock className="h-5 w-5" strokeWidth={1.8} />;
export const IconMail = () => <Mail className="h-5 w-5" strokeWidth={1.8} />;
export const IconCheck = () => <Check className="h-5 w-5" strokeWidth={1.8} />;
export const IconCard = () => <CreditCard className="h-5 w-5" strokeWidth={1.8} />;
export const IconAlert = () => <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />;
export const IconX = () => <X className="h-5 w-5" strokeWidth={1.8} />;

const TONES = {
  neutral: { fg: "text-foreground", bg: "bg-foreground/5", border: "border-border" },
  accent: { fg: "text-primary", bg: "bg-primary/5", border: "border-primary/25" },
  success: { fg: "text-success", bg: "bg-success/10", border: "border-success/25" },
  danger: { fg: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/25" },
};

/*
 * ============================================================
 * STATUS SCREEN LAYOUT
 * ============================================================
 * A single consistent shell for every "you are waiting / you need
 * to act" screen: verification, review, payment, approval, rejection.
 */

export const StatusScreen = ({
  icon,
  tone = "neutral",
  eyebrow,
  title,
  message,
  meta = [],
  error,
  children,
}) => {
  const t = TONES[tone] || TONES.neutral;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${t.border} ${t.bg} ${t.fg}`}
            >
              {icon}
            </div>

            <div className="min-w-0">
              {eyebrow && (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-lg font-semibold leading-snug text-foreground">{title}</h1>
            </div>
          </div>

          {message && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{message}</p>}

          {error && (
            <div role="alert" className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {children && <div className="mt-6">{children}</div>}
        </CardContent>

        {meta.length > 0 && (
          <div className="flex items-center justify-between gap-4 border-t border-border px-8 py-3 font-mono text-xs text-muted-foreground">
            {meta.map((item) => (
              <span key={item.label}>
                {item.label} <span className="text-foreground/80">{item.value}</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const PIPELINE_STAGES = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Review" },
  { key: "APPROVED_PENDING_PAYMENT", label: "Approved" },
  { key: "LIVE", label: "Live" },
];

export const PipelineStepper = ({ currentStage, rejected = false }) => {
  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div>
      <div className="flex gap-1">
        {PIPELINE_STAGES.map((stage, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const filled = isPast || isCurrent;

          let color = "bg-muted";
          if (rejected && index <= currentIndex) color = "bg-destructive/40";
          else if (filled) color = "bg-primary";

          return <div key={stage.key} className={`h-1 flex-1 rounded-full ${color}`} />;
        })}
      </div>

      <div className="mt-2 flex">
        {PIPELINE_STAGES.map((stage, index) => (
          <span
            key={stage.key}
            className={`flex-1 text-[10px] font-medium uppercase tracking-wide ${
              index === 0 ? "text-left" : index === PIPELINE_STAGES.length - 1 ? "text-right" : "text-center"
            } ${
              index === currentIndex
                ? rejected
                  ? "text-destructive"
                  : "text-foreground"
                : "text-muted-foreground/60"
            }`}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  );
};
