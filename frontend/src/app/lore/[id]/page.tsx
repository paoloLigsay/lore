import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LoreDetailView } from "@/components/lore/lore-detail-view";

export default async function LoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background text-foreground">
      <LoreDetailView loreId={id} email={user.email ?? "Account"} />
    </div>
  );
}
