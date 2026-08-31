import React from "react";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconClock = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconMail = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const IconCheck = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

export const IconCard = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </svg>
);

export const IconAlert = () => (
  <svg {...iconProps}>
    <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
    <path d="M12 10v4" />
    <path d="M12 17.2v.1" />
  </svg>
);

export const IconX = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);


const TONES = {
  neutral: { fg: "text-[#1C1B19]", bg: "bg-[#1C1B19]/5", border: "border-[#1C1B19]/15" },
  accent: { fg: "text-[#CD0000]", bg: "bg-[#CD0000]/5", border: "border-[#CD0000]/25" },
  success: { fg: "text-[#1C1B19]", bg: "bg-[#1C1B19]/5", border: "border-[#1C1B19]/15" },
  danger: { fg: "text-[#CD0000]", bg: "bg-[#CD0000]/5", border: "border-[#CD0000]/25" },
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
    <div className="bg-[#EFEDE6] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-md border border-[#1C1B19]/10">
        <div className="p-8">
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-md border ${t.border} ${t.bg} ${t.fg}`}
            >
              {icon}
            </div>

            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1C1B19]/45 mb-1">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-lg font-semibold text-[#1C1B19] leading-snug">
                {title}
              </h1>
            </div>
          </div>

          {message && (
            <p className="mt-4 text-sm leading-relaxed text-[#1C1B19]/70">
              {message}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 px-3 py-2 rounded-md bg-[#CD0000]/10 text-[#CD0000] text-sm"
            >
              {error}
            </div>
          )}

          {children && <div className="mt-6">{children}</div>}
        </div>

        {meta.length > 0 && (
          <div className="border-t border-[#1C1B19]/10 px-8 py-3 flex items-center justify-between gap-4 text-xs font-mono text-[#1C1B19]/55">
            {meta.map((item) => (
              <span key={item.label}>
                {item.label} <span className="text-[#1C1B19]/80">{item.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
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

          let color = "bg-[#1C1B19]/10";
          if (rejected && index <= currentIndex) color = "bg-[#CD0000]/40";
          else if (filled) color = "bg-[#CD0000]";

          return (
            <div key={stage.key} className={`h-1 flex-1 rounded-full ${color}`} />
          );
        })}
      </div>

      <div className="flex mt-2">
        {PIPELINE_STAGES.map((stage, index) => (
          <span
            key={stage.key}
            className={`flex-1 text-[10px] uppercase tracking-wide font-medium ${
              index === 0 ? "text-left" : index === PIPELINE_STAGES.length - 1 ? "text-right" : "text-center"
            } ${
              index === currentIndex
                ? rejected
                  ? "text-[#CD0000]"
                  : "text-[#1C1B19]"
                : "text-[#1C1B19]/35"
            }`}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  );
};