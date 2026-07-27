import Link from "next/link";

export function Nav() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <img src="/logo.svg" alt="Lore" className="h-6.5 w-6.5" />
        Lore
      </div>
      <div className="hidden items-center gap-7 text-[15px] sm:flex">
        <a
          href="#how-it-works"
          className="font-semibold text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4"
        >
          How it works
        </a>
        <a
          href="#features"
          className="font-semibold text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4"
        >
          Features
        </a>
      </div>
      <Link
        href="/dashboard"
        className="rounded-full bg-primary px-4.5 py-2.25 text-sm font-semibold text-primary-foreground hover:opacity-85"
      >
        Try it free
      </Link>
    </nav>
  );
}
