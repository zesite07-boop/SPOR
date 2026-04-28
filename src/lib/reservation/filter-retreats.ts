import type { PackageDays, RetreatDefinition, RetreatDestinationId, RetreatEnergyId } from "./catalog";

export type RetreatFilters = {
  duration: PackageDays | "all";
  destination: RetreatDestinationId | "all";
  energy: RetreatEnergyId | "all";
};

export function filterRetreats(list: RetreatDefinition[], f: RetreatFilters): RetreatDefinition[] {
  return list.filter((r) => {
    if (f.destination !== "all" && r.destination !== f.destination) return false;
    if (f.energy !== "all" && r.energy !== f.energy) return false;
    if (f.duration !== "all") {
      const has = r.packages.some((p) => p.days === f.duration);
      if (!has) return false;
    }
    return true;
  });
}
