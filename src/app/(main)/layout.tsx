import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthChrome } from "@/components/layout/auth-chrome";
import { MainShell } from "@/components/layout/main-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  let sessionEmail: string | null = null;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    sessionEmail = user?.email ?? null;
  }

  return (
    <>
      <div className="oasis-mandala-bg min-h-dvh">
        <AuthChrome cloudAuthAvailable={!!supabase} sessionEmail={sessionEmail} />
        <MainShell>{children}</MainShell>
      </div>
      <BottomNav />
    </>
  );
}
