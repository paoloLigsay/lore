import { AccountMenu } from "@/components/layout/account-menu";

export function Topbar({ email }: { email: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <img src="/logo.svg" alt="Lore" className="h-6.5 w-6.5" />
          Lore
        </div>
        <AccountMenu email={email} />
      </div>
    </header>
  );
}
