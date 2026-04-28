"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Plane, Shield, User } from "lucide-react";
import { jsPDF } from "jspdf";
import type { PackageDays, RetreatDefinition } from "@/lib/reservation/catalog";
import { computeQuote, euroToCents, SOLO_ROOM_SURCHARGE_EUR, AIRPORT_TRANSFER_EUR } from "@/lib/reservation/pricing";
import type { PaymentMode } from "@/lib/db/schema";
import { saveReservationDraft, updateReservation } from "@/lib/reservation/booking-local";
import { saveLocalProfile } from "@/lib/db/profile-local";
import { syncReminderSchedule } from "@/lib/notifications/reminders";
import { Button } from "@/components/ui/button";
import { PackageSelector } from "@/components/reservation/package-selector";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

function fmtRange(start: string, end: string) {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  return `${a.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${b.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function RetreatBookingClient({ retreat }: { retreat: RetreatDefinition }) {
  const celebrate = useUiStore((s) => s.celebrate);
  const defaultPkg = retreat.packages[1]?.days ?? retreat.packages[0]!.days;
  const [pkgDays, setPkgDays] = useState<PackageDays>(defaultPkg);
  const [participants, setParticipants] = useState(1);
  const [soloRoom, setSoloRoom] = useState(false);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("deposit");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [allergies, setAllergies] = useState("");
  const [intentions, setIntentions] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [contractReady, setContractReady] = useState(false);

  const quote = useMemo(
    () =>
      computeQuote({
        retreat,
        packageDays: pkgDays,
        participants,
        soloRoom,
        airportTransfer,
        mode: paymentMode,
      }),
    [retreat, pkgDays, participants, soloRoom, airportTransfer, paymentMode]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Merci d’indiquer un e-mail valide pour la confirmation.");
      return;
    }
    if (retreat.spotsLeft < participants) {
      setMessage("Il ne reste pas assez de places pour ce groupe — réduis le nombre de personnes ou contacte-nous.");
      return;
    }

    const id = crypto.randomUUID();
    const totalCents = euroToCents(quote.subtotalEuro);
    const dueNowCents = euroToCents(quote.dueNowEuro);

    setLoading(true);
    try {
      const now = Date.now();
      await saveReservationDraft({
        id,
        retreatId: retreat.id,
        packageDays: pkgDays,
        participants,
        soloRoom,
        airportTransfer,
        allergies: allergies.trim() || undefined,
        intentions: intentions.trim() || undefined,
        birthDate: birthDate || undefined,
        contactEmail: email.trim(),
        paymentMode,
        totalCents,
        dueNowCents,
        currency: "eur",
        status: "checkout_pending",
        createdAt: now,
        updatedAt: now,
      });
      await syncReminderSchedule();
      setContractReady(true);

      if (birthDate) {
        await saveLocalProfile({ birthDate });
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: id,
          retreatId: retreat.id,
          packageDays: pkgDays,
          participants,
          soloRoom,
          airportTransfer,
          paymentMode,
          email: email.trim(),
          allergies: allergies.trim() || undefined,
          intentions: intentions.trim() || undefined,
          birthDate: birthDate || undefined,
        }),
      });

      const data = (await res.json()) as {
        url?: string;
        sessionId?: string;
        error?: string;
        offline?: boolean;
      };

      if (res.ok && data.url) {
        await updateReservation(id, {
          stripeCheckoutSessionId: data.sessionId,
          status: "checkout_created",
        });
        celebrate("Ta reservation est prete, ouverture du paiement securise ✦");
        window.location.href = data.url;
        return;
      }

      await updateReservation(id, { status: "draft" });
      celebrate("Ta demande est bien sauvegardee localement ✦");
      setMessage(
        data.error === "stripe_unconfigured"
          ? "Paiement en ligne non configure : ta pre-reservation est enregistree sur cet appareil. Nous te recontactons tres vite avec douceur."
          : "Le paiement en ligne n'a pas pu demarrer - ta demande reste sauvegardee localement. Reessaie quand tu seras connecte ou ecris-nous."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateContractPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 14;
    const w = doc.internal.pageSize.getWidth();
    let y = 18;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/serey_padma_lotus.png";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image load failed"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const data = canvas.toDataURL("image/png");
        doc.addImage(data, "PNG", w - margin - 18, 13, 14, 14);
      }
    } catch {
      /* fallback texte uniquement */
    }

    doc.setFillColor(248, 244, 237);
    doc.roundedRect(margin, 10, w - margin * 2, 30, 2, 2, "F");
    doc.setDrawColor(212, 175, 136);
    doc.roundedRect(margin, 10, w - margin * 2, 30, 2, 2, "S");
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Serey Padma by Céline", margin + 3, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Reiki · Oracle · Retreats", margin + 3, 23);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text("Bon de reservation", margin + 3, 31);
    y = 48;

    const lines = [
      `Participante: ${email || "Non renseigne"}`,
      `Retraite: ${retreat.title}`,
      `Lieu: ${retreat.destinationLabel}`,
      `Dates: ${fmtRange(retreat.startDate, retreat.endDate)}`,
      `Montant total: ${quote.subtotalEuro} EUR`,
      `Acompte verse: ${quote.dueNowEuro} EUR`,
      `Solde restant: ${quote.balanceEuro} EUR`,
    ];
    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 62, 80);
    for (const line of lines) {
      doc.text(line, margin, y);
      y += 7;
    }
    y += 3;
    doc.setFont("times", "bold");
    doc.text("Conditions d'annulation", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const cond =
      "Annulation possible jusqu'a 30 jours avant le debut de la retraite avec retenue de frais administratifs. Passe ce delai, l'acompte reste acquis sauf cas exceptionnel documente.";
    const wrapped = doc.splitTextToSize(cond, w - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 8;

    doc.setFontSize(8);
    doc.setTextColor(212, 175, 136);
    doc.text(`Serey Padma by Céline · genere le ${new Date().toLocaleString("fr-FR")}`, margin, 288);
    doc.save(`contrat-${retreat.id}.pdf`);
  }

  return (
    <div className="pb-16">
      <Link
        href="/reservation"
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-padma-night/60 hover:text-padma-lavender"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Toutes les retraites
      </Link>

      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-padma-pearl">
          {retreat.destinationLabel}
        </p>
        <h1 className="font-cinzel text-3xl font-normal tracking-wide text-padma-night">{retreat.title}</h1>
        <p className="text-sm text-padma-night/75">{retreat.subtitle}</p>
        <p className="text-xs text-padma-night/55">{fmtRange(retreat.startDate, retreat.endDate)}</p>
      </motion.header>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-padma-pearl/35 bg-white/75 p-6">
            <h2 className="font-cinzel text-lg text-padma-night">Thème du voyage</h2>
            <p className="mt-3 text-sm italic leading-relaxed text-padma-night/82">{retreat.astroTheme}</p>
            <p className="mt-2 text-sm text-padma-night/70">{retreat.numeroTheme}</p>
          </section>

          <section>
            <h2 className="mb-4 font-cinzel text-lg text-padma-night">Choisis ton immersion</h2>
            <PackageSelector packages={retreat.packages} value={pkgDays} onChange={setPkgDays} />
          </section>

          <section className="rounded-2xl border border-padma-champagne/30 bg-padma-cream/40 p-6">
            <h2 className="font-cinzel text-lg text-padma-night">Inclus dans chaque formule</h2>
            <ul className="mt-4 space-y-2">
              {retreat.includedEverywhere.map((line) => (
                <li key={line} className="flex gap-2 text-sm text-padma-night/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-padma-champagne" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-padma-night/55">
              Programme Reiki &amp; oracle adapté à la durée : cercles, temps libre intérieur, marches et cuisine sacrée.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="rounded-[1.75rem] border border-padma-lavender/35 bg-gradient-to-b from-white/95 to-padma-lavender/10 p-6 shadow-soft"
          >
            <h2 className="font-cinzel text-lg text-padma-night">Réserver ta place avec sérénité</h2>

            <label className="mt-4 block text-xs uppercase tracking-wide text-padma-night/55">
              E-mail
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night"
              />
            </label>

            <label className="mt-3 block text-xs uppercase tracking-wide text-padma-night/55">
              Date de naissance (profil Oracle)
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night"
              />
            </label>

            <label className="mt-3 block text-xs uppercase tracking-wide text-padma-night/55">
              Nombre de personnes
              <select
                value={participants}
                onChange={(e) => setParticipants(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 space-y-3 rounded-xl border border-padma-pearl/30 bg-white/60 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-padma-night">
                <input type="checkbox" checked={soloRoom} onChange={(e) => setSoloRoom(e.target.checked)} className="rounded border-padma-champagne" />
                <User className="h-4 w-4 text-padma-lavender" aria-hidden />
                Chambre solo (+{SOLO_ROOM_SURCHARGE_EUR} € / réservation)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-padma-night">
                <input
                  type="checkbox"
                  checked={airportTransfer}
                  onChange={(e) => setAirportTransfer(e.target.checked)}
                  className="rounded border-padma-champagne"
                />
                <Plane className="h-4 w-4 text-padma-champagne" aria-hidden />
                Transfert aéroport / gare (+{AIRPORT_TRANSFER_EUR} €)
              </label>
            </div>

            <label className="mt-4 block text-xs uppercase tracking-wide text-padma-night/55">
              Allergies alimentaires
              <textarea
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night"
              />
            </label>

            <label className="mt-3 block text-xs uppercase tracking-wide text-padma-night/55">
              Intentions pour ce séjour
              <textarea
                rows={2}
                value={intentions}
                onChange={(e) => setIntentions(e.target.value)}
                className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night"
              />
            </label>

            <div className="mt-5 space-y-2">
              <p className="text-xs uppercase tracking-wide text-padma-night/55">Paiement</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode("deposit")}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-medium transition",
                    paymentMode === "deposit"
                      ? "bg-padma-champagne/35 text-padma-night"
                      : "bg-white/70 text-padma-night/70"
                  )}
                >
                  Acompte (solde avant le séjour)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("full")}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-medium transition",
                    paymentMode === "full"
                      ? "bg-padma-champagne/35 text-padma-night"
                      : "bg-white/70 text-padma-night/70"
                  )}
                >
                  Règlement intégral
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-padma-champagne/25 bg-padma-cream/50 p-4 text-sm">
              <p className="flex justify-between text-padma-night/75">
                <span>Total séjour estimé</span>
                <span className="font-medium">{quote.subtotalEuro} €</span>
              </p>
              {paymentMode === "deposit" && (
                <p className="mt-2 flex justify-between text-xs text-padma-night/65">
                  <span>Solde restant (hors ligne / lien ultérieur)</span>
                  <span>{quote.balanceEuro} €</span>
                </p>
              )}
              <p className="mt-3 flex justify-between font-cinzel text-base text-padma-night">
                <span>À payer maintenant</span>
                <span>{quote.dueNowEuro} €</span>
              </p>
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-padma-champagne/40 bg-white/90 p-3 text-xs leading-relaxed text-padma-night">
                {message}
              </p>
            )}

            <Button
              type="submit"
              variant="oracle"
              disabled={loading}
              className="font-cinzel mt-6 w-full rounded-2xl py-6 text-base tracking-wide"
            >
              {loading ? "Redirection securisee..." : "Continuer vers le paiement"}
            </Button>
            {contractReady && (
              <Button type="button" variant="secondary" className="mt-3 w-full rounded-2xl" onClick={() => void generateContractPdf()}>
                Generer le contrat PDF
              </Button>
            )}

            <p className="mt-4 flex items-start gap-2 text-[0.65rem] leading-relaxed text-padma-night/50">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Paiement traité par Stripe — TLS &amp; conformité PCI. Sans clé Stripe configurée, ta demande reste stockée localement (Dexie).
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
}
