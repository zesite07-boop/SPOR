"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAdminSessionValid } from "@/lib/security/twofa";

const PROTECTED = ["/rayonner", "/tresor"];

export function TwoFactorRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const need = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
      if (!need) {
        if (!cancelled) setChecking(false);
        return;
      }
      const valid = await isAdminSessionValid();
      if (!cancelled && !valid) {
        router.replace(`/connexion?next=${encodeURIComponent(pathname)}&admin=required`);
        return;
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <div className="p-6 text-center text-sm text-padma-night/70">Verification securisee 2FA...</div>;
  }

  return null;
}
