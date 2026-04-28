import { Suspense } from "react";
import { TwofaAuthPageClient } from "@/components/security/twofa-auth-page-client";

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-padma-night/70 dark:text-padma-cream/80">Chargement 2FA...</div>}>
      <TwofaAuthPageClient />
    </Suspense>
  );
}
