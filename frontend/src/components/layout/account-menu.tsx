"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { SignOutButton } from "@/components/auth/sign-out-button";

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function AccountMenu({ email }: { email: string }) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label="Account menu"
        className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-accent-strong text-[13px] font-bold text-foreground outline-none transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {initialsFromEmail(email)}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={8} align="end">
          <PopoverPrimitive.Popup className="z-50 min-w-[200px] rounded-lg border border-border bg-card p-2 text-card-foreground shadow-[0_16px_34px_-18px_rgba(0,0,0,0.25)] outline-none transition-all duration-100 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <p className="truncate px-2.5 pt-1 pb-2 text-sm font-medium text-foreground">
              {email}
            </p>
            <div className="mb-1.5 h-px bg-border" />
            <SignOutButton />
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
