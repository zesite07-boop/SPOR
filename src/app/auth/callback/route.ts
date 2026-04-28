import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/**
 * Échange le `code` PKCE renvoyé dans le lien magique contre une session cookie (SSR).
 * À déclarer dans Supabase Dashboard → URL de redirection : `https://votredomaine/auth/callback`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (code && url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
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
            /* Server Component en lecture seule — rare en route handler */
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback]", error.message);
      return NextResponse.redirect(new URL(`/connexion?error=${encodeURIComponent("session")}`, origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
