import type { MarketingQueueItem, MarketingPrefs } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import { listUpcomingRetreats } from "@/lib/reservation/catalog";

const PREFS_ID = "global";

export function defaultMarketingPrefs(): MarketingPrefs {
  return {
    id: PREFS_ID,
    lastFormat: "feed_post",
    lastScenario: "before_retreat",
    updatedAt: Date.now(),
  };
}

export async function loadMarketingPrefs(): Promise<MarketingPrefs> {
  const dexie = db;
  if (!dexie) return defaultMarketingPrefs();
  let row = await dexie.marketingPrefs.get(PREFS_ID);
  if (!row) {
    row = defaultMarketingPrefs();
    await dexie.marketingPrefs.put(row);
  }
  return row;
}

export async function saveMarketingPrefs(patch: Partial<Pick<MarketingPrefs, "lastFormat" | "lastScenario">>) {
  const dexie = db;
  if (!dexie) return;
  const prev = await loadMarketingPrefs();
  await dexie.marketingPrefs.put({
    ...prev,
    ...patch,
    id: PREFS_ID,
    updatedAt: Date.now(),
  });
}

function uid(): string {
  return `mq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function seedMarketingQueueIfEmpty(): Promise<void> {
  const dexie = db;
  if (!dexie) return;
  const n = await dexie.marketingQueue.count();
  if (n > 0) return;

  const upcoming = listUpcomingRetreats();
  const rows: MarketingQueueItem[] = [];
  let order = 0;

  if (upcoming[0]) {
    const r = upcoming[0];
    rows.push({
      id: uid(),
      label: `Teaser avant · ${r.title}`,
      formatHint: "reel_60",
      scenarioTag: "before_retreat",
      suggestedDate: r.startDate,
      done: false,
      sortOrder: order++,
      updatedAt: Date.now(),
    });
    rows.push({
      id: uid(),
      label: `Story · énergie ${r.energyLabel}`,
      formatHint: "story",
      scenarioTag: "announcement",
      suggestedDate: r.startDate,
      done: false,
      sortOrder: order++,
      updatedAt: Date.now(),
    });
  }

  rows.push(
    {
      id: uid(),
      label: "Carrousel · tirage du jour (3 slides)",
      formatHint: "carousel",
      scenarioTag: "daily_draw",
      done: false,
      sortOrder: order++,
      updatedAt: Date.now(),
    },
    {
      id: uid(),
      label: "Post feed · parrainage doux",
      formatHint: "feed_post",
      scenarioTag: "referral",
      done: false,
      sortOrder: order++,
      updatedAt: Date.now(),
    },
    {
      id: uid(),
      label: "Email · retour des participantes",
      formatHint: "email",
      scenarioTag: "after_retreat",
      done: false,
      sortOrder: order++,
      updatedAt: Date.now(),
    }
  );

  await dexie.marketingQueue.bulkAdd(rows);
}

export async function loadMarketingQueue(): Promise<MarketingQueueItem[]> {
  const dexie = db;
  if (!dexie) return [];
  await seedMarketingQueueIfEmpty();
  const rows = await dexie.marketingQueue.orderBy("sortOrder").toArray();
  return rows;
}

export async function toggleQueueItemDone(id: string, done: boolean): Promise<void> {
  const dexie = db;
  if (!dexie) return;
  const row = await dexie.marketingQueue.get(id);
  if (!row) return;
  await dexie.marketingQueue.put({ ...row, done, updatedAt: Date.now() });
}
