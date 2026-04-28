import { create } from "zustand";

let celebrationTimer: ReturnType<typeof setTimeout> | null = null;

type UiState = {
  hyperfocus: boolean;
  energyPoints: number;
  streakDays: number;
  badges: string[];
  /** Micro-feedback éphémère (copie, sauvegarde, etc.). */
  celebration: string | null;
  toggleHyperfocus: () => void;
  addEnergy: (n: number) => void;
  celebrate: (message: string) => void;
  clearCelebration: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  hyperfocus: false,
  energyPoints: 0,
  streakDays: 1,
  badges: [],
  celebration: null,
  toggleHyperfocus: () => set((s) => ({ hyperfocus: !s.hyperfocus })),
  addEnergy: (n) =>
    set((s) => {
      const points = Math.max(0, s.energyPoints + n);
      const badges = [
        points >= 5 ? "Rituel ouvert" : null,
        points >= 12 ? "Flux aligné" : null,
        points >= 24 ? "Lotus rayonnant" : null,
      ].filter(Boolean) as string[];
      return { energyPoints: points, badges };
    }),
  celebrate: (message: string) => {
    if (celebrationTimer) clearTimeout(celebrationTimer);
    const points = get().energyPoints + 1;
    const badges = [
      points >= 5 ? "Rituel ouvert" : null,
      points >= 12 ? "Flux aligné" : null,
      points >= 24 ? "Lotus rayonnant" : null,
    ].filter(Boolean) as string[];
    set({ celebration: message, energyPoints: points, badges });
    celebrationTimer = setTimeout(() => {
      if (get().celebration === message) set({ celebration: null });
      celebrationTimer = null;
    }, 2600);
  },
  clearCelebration: () => {
    if (celebrationTimer) clearTimeout(celebrationTimer);
    celebrationTimer = null;
    set({ celebration: null });
  },
}));
