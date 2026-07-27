import { Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

export function ResizeHandle({ className }: { className?: string }) {
  return (
    <Separator
      className={cn(
        "w-px shrink-0 cursor-col-resize bg-border outline-none transition-colors hover:bg-ink-faint focus-visible:bg-accent-strong data-[disabled]:pointer-events-none",
        className
      )}
    />
  );
}
