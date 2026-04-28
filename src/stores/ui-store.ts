import { create } from "zustand";

let celebrationTimer: ReturnType<typeof setTimeout> | null = null;

type UiState = {
  hyperfocus: boolean;
  energyPoints: number;
  streakDays: number;
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
  celebration: null,
  toggleHyperfocus: () => set((s) => ({ hyperfocus: !s.hyperfocus })),
  addEnergy: (n) => set((s) => ({ energyPoints: s.energyPoints + n })),
  celebrate: (message: string) => {
    if (celebrationTimer) clearTimeout(celebrationTimer);
    set({ celebration: message });
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
