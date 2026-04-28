import type { OasisProfile } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import { LOCAL_PROFILE_ID } from "@/lib/oracle/session-persist";

export async function loadLocalProfile(): Promise<OasisProfile | null> {
  if (!db) return null;
  return (await db.profiles.get(LOCAL_PROFILE_ID)) ?? null;
}

export async function saveLocalProfile(patch: Partial<Omit<OasisProfile, "id">>) {
  if (!db) return;
  const prev = (await db.profiles.get(LOCAL_PROFILE_ID)) ?? { id: LOCAL_PROFILE_ID, updatedAt: 0 };
  await db.profiles.put({
    ...prev,
    ...patch,
    id: LOCAL_PROFILE_ID,
    updatedAt: Date.now(),
  });
}
