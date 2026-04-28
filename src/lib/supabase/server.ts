import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Client Supabase **serveur** (Server Components, Server Actions, Route Handlers).
 * `null` si les variables d’environnement sont absentes → mode **100 % local / Dexie / PWA** sans cloud.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) cookieStore.set(name, value, options);
            else cookieStore.set(name, value);
          });
        } catch {
          /* Server Component en lecture seule — pas de mutation cookies */
        }
      },
    },
  });
}
