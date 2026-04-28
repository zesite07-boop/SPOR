"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConfirmationInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <p className="text-sm text-padma-night/65">Chargement…</p>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg text-center">
      <Sparkles className="mx-auto mb-4 h-10 w-10 text-padma-champagne" aria-hidden />
      <h1 className="font-cinzel text-2xl text-padma-night">Merci de ta confiance</h1>
      <p className="mt-4 text-sm leading-relaxed text-padma-night/78">
        Ton paiement Stripe est en cours de traitement. Tu recevras un e-mail de confirmation récapitulant ta réservation Serey Padma.
      </p>
      {sessionId && (
        <p className="mt-3 font-mono text-[0.65rem] text-padma-night/45">Réf. session : {sessionId}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="oracle" className="font-cinzel rounded-2xl">
          <Link href="/">Retour à l’accueil</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-2xl">
          <Link href="/oracle">Continuer avec l’oracle</Link>
        </Button>
      </div>
      <p className="mt-10 flex items-center justify-center gap-2 text-xs text-padma-night/50">
        <Heart className="h-4 w-4 text-padma-lavender" aria-hidden />
        Une question ? Réponds simplement à l’e-mail de confirmation ou reviens vers ton espace Ops.
      </p>
    </motion.div>
  );
}

export default function ReservationConfirmationPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-sm text-padma-night/60">Préparation…</p>}>
        <ConfirmationInner />
      </Suspense>
    </div>
  );
}
