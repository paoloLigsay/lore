"use client";

import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export function InlineRenameInput({
  initialValue,
  onCommit,
  onCancel,
  className,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  // Enter blurs the input as a side effect, which would otherwise fire
  // this twice (once from the key handler, once from the resulting blur).
  const resolvedRef = useRef(false);

  function resolve() {
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    const trimmed = value.trim();
    if (trimmed && trimmed !== initialValue) {
      onCommit(trimmed);
    } else {
      onCancel();
    }
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    event.target.select();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      resolve();
    } else if (event.key === "Escape") {
      event.preventDefault();
      resolvedRef.current = true;
      onCancel();
    }
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onFocus={handleFocus}
      onBlur={resolve}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
      className={cn(
        // No border/padding here on purpose — those add to the box's
        // rendered height, which would make swapping from the display
        // text to this input visibly jump. `ring` is box-shadow-based
        // and paints without taking layout space, so it can indicate
        // "editing" without changing the box size. Callers are
        // responsible for matching whatever padding their own display
        // element uses (often none), typically via a shared fixed-height
        // wrapper around both states.
        "w-full min-w-0 rounded-sm bg-transparent text-foreground outline-none ring-2 ring-ring/60",
        className
      )}
    />
  );
}
