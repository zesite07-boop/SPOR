/**
 * Placeholder sync cloud — si Supabase est configuré, pousser la réservation (à brancher).
 * Toujours safe offline : ne throw pas.
 */
export async function pushReservationToSupabase(payload?: Record<string, unknown>): Promise<boolean> {
  void payload;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;
  /* TODO: insert dans table `reservations` via service role ou RLS utilisateur. */
  return false;
}
