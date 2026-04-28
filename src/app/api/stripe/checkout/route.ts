import { NextResponse } from "next/server";
import Stripe from "stripe";
import type { PackageDays } from "@/lib/reservation/catalog";
import { getRetreatById } from "@/lib/reservation/catalog";
import { computeQuote, euroToCents } from "@/lib/reservation/pricing";
import type { PaymentMode } from "@/lib/db/schema";

export const runtime = "nodejs";

type Body = {
  bookingId: string;
  retreatId: string;
  packageDays: PackageDays;
  participants: number;
  soloRoom: boolean;
  airportTransfer: boolean;
  paymentMode: PaymentMode;
  email: string;
  allergies?: string;
  intentions?: string;
  birthDate?: string;
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "stripe_unconfigured", offline: true }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const retreat = getRetreatById(body.retreatId);
  if (!retreat || !body.bookingId || !body.email) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const participants = Math.min(8, Math.max(1, Math.floor(Number(body.participants)) || 1));
  const pkgDays = body.packageDays;
  if (![3, 5, 7].includes(pkgDays)) {
    return NextResponse.json({ error: "invalid_package" }, { status: 400 });
  }

  const quote = computeQuote({
    retreat,
    packageDays: pkgDays,
    participants,
    soloRoom: !!body.soloRoom,
    airportTransfer: !!body.airportTransfer,
    mode: body.paymentMode === "full" ? "full" : "deposit",
  });

  const dueCents = euroToCents(quote.dueNowEuro);
  if (dueCents < 50) {
    return NextResponse.json({ error: "amount_too_low" }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (request.headers.get("x-forwarded-proto") && request.headers.get("host")
      ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
      : new URL(request.url).origin);

  const stripe = new Stripe(secret, {
    apiVersion: "2026-04-22.dahlia",
  });

  const title = `${retreat.title} · ${pkgDays}j · ${participants} pers.`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: dueCents,
          product_data: {
            name: body.paymentMode === "deposit" ? `Acompte — ${title}` : `Réservation — ${title}`,
            description: `Serey Padma · ${retreat.destinationLabel}. Total séjour ${quote.subtotalEuro} € TTC.`,
          },
        },
      },
    ],
    metadata: {
      bookingId: body.bookingId,
      retreatId: body.retreatId,
      packageDays: String(pkgDays),
      participants: String(participants),
      paymentMode: body.paymentMode,
      allergies: body.allergies ?? "",
      intentions: body.intentions ?? "",
      birthDate: body.birthDate ?? "",
    },
    success_url: `${origin}/reservation/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reservation/${body.retreatId}?cancelled=1`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "no_checkout_url" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
