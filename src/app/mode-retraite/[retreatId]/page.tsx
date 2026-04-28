import { notFound } from "next/navigation";
import { getRetreatById } from "@/lib/reservation/catalog";
import { RetreatLiveMode } from "@/components/logistics/retreat-live-mode";

export default async function RetreatModePage({ params }: { params: Promise<{ retreatId: string }> }) {
  const { retreatId } = await params;
  const retreat = getRetreatById(retreatId);
  if (!retreat) notFound();
  return <RetreatLiveMode retreat={retreat} />;
}
