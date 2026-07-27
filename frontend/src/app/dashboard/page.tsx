import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/topbar";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Topbar email={user.email ?? "Account"} />
      <DashboardView />
    </div>
  );
}
