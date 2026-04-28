import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes accessibles sans session (magic link, catalogue réservation, flux paiement). */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/landing") return true;
  if (pathname.startsWith("/r/")) return true;
  if (pathname.startsWith("/connexion")) return true;
  if (pathname.startsWith("/auth")) return true;
  /** Invité·e : parcourir les retraites et payer sans compte Padma. */
  if (pathname.startsWith("/reservation")) return true;
  return false;
}

/** Évite les redirections ouvertes vers des domaines externes. */
function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/** Recopie les cookies Set-Cookie issus du refresh Supabase vers une réponse `redirect`. */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

/**
 * Rafraîchit la session JWT + protège l’app : routes privées si Supabase est configuré.
 * Public : `/connexion`, `/auth/*`, `/reservation/*`, et `/api/*` (Stripe).
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  /** Handlers API (Stripe, webhooks…) — pas de garde auth ni cookies Supabase ici. */
  if (pathname.startsWith("/api")) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          if (options) supabaseResponse.cookies.set(name, value, options);
          else supabaseResponse.cookies.set(name, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/connexion";
    redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === "/connexion") {
    const next = safeInternalPath(request.nextUrl.searchParams.get("next"));
    const redirectResponse = NextResponse.redirect(new URL(next, request.url));
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
