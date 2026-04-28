import { notFound } from "next/navigation";
import { getRetreatById } from "@/lib/reservation/catalog";
import { LogisticsRetreatDetail } from "@/components/logistics/logistics-retreat-detail";

export default async function LogisticsRetreatPage({ params }: { params: Promise<{ retreatId: string }> }) {
  const { retreatId } = await params;
  const retreat = getRetreatById(retreatId);
  if (!retreat) notFound();
  return <LogisticsRetreatDetail retreat={retreat} />;
}
