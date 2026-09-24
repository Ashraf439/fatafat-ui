import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DAYS, dayLabel, dayOfWeekName } from "@/lib/format";
import { hoursForDay } from "./hours";
import { cn } from "@/lib/utils";

export function HoursDialog({ timings }) {
  const today = dayOfWeekName();
  if (!timings || timings.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0">
          <CalendarClock /> All hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opening hours</DialogTitle>
        </DialogHeader>
        <ul className="divide-y text-sm">
          {DAYS.map((day) => {
            const hours = hoursForDay(timings, day);
            return (
              <li key={day} className={cn("flex items-start justify-between gap-4 py-2.5", day === today && "font-bold text-primary")}>
                <span>{dayLabel(day)}</span>
                <span className={cn("text-right", !hours && "text-muted-foreground")}>{hours ?? "Closed"}</span>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
