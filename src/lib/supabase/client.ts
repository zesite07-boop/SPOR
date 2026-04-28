import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase **navigateur** — cookies auth synchronisés avec le middleware.
 * Retourne `null` si les variables d’environnement ne sont pas définies (app 100 % locale / offline).
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
