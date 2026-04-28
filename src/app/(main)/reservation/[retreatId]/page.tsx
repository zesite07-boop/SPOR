import { notFound } from "next/navigation";
import { getRetreatById } from "@/lib/reservation/catalog";
import { RetreatBookingClient } from "@/components/reservation/retreat-booking-client";

export default async function ReservationDetailPage({ params }: { params: Promise<{ retreatId: string }> }) {
  const { retreatId } = await params;
  const retreat = getRetreatById(retreatId);
  if (!retreat) notFound();
  return <RetreatBookingClient retreat={retreat} />;
}
