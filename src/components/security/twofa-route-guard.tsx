"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isTwoFactorEnabled, isTwoFactorSessionValid } from "@/lib/security/twofa";

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
      const enabled = await isTwoFactorEnabled();
      const valid = await isTwoFactorSessionValid();
      if (!cancelled && (!enabled || !valid)) {
        const reason = enabled ? "expired" : "required";
        router.replace(`/auth/2fa?next=${encodeURIComponent(pathname)}&reason=${reason}`);
        return;
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <div className="p-6 text-center text-sm text-padma-night/70 dark:text-padma-cream/80">Verification securisee 2FA...</div>;
  }

  return null;
}
