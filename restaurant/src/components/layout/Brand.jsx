export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-sm">
        F
      </span>
      <div className="hidden leading-tight sm:block">
        <div className="text-base font-extrabold tracking-tight">
          Fata<span className="text-primary">fat</span>
        </div>
        <div className="text-[11px] font-medium text-muted-foreground">Restaurant</div>
      </div>
    </div>
  );
}