import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

function safeRedirectPath(raw: string | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = safeRedirectPath(redirectParam);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <img src="/logo.svg" alt="Lore" className="h-9 w-9" />
          <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to continue to your Lores.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.15)]">
          <LoginForm redirectTo={redirectTo} />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="mailto:paolomartinligsay@gmail.com"
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
          >
            Contact Paolo Ligsay
          </a>
        </p>
      </div>
    </div>
  );
}
