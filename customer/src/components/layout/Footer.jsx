import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-secondary/50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
        <Logo />
        <p className="text-sm text-muted-foreground">Hot food, fast. Made by Fatafat © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
