import type { LucideIcon } from "lucide-react";
import {
  CalendarHeart,
  ClipboardList,
  Compass,
  Flower2,
  MessagesSquare,
  Sparkles,
} from "lucide-react";

export type NavTab = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
};

export const NAV_TABS: NavTab[] = [
  { href: "/", label: "Accueil", shortLabel: "1", Icon: CalendarHeart },
  { href: "/logistique", label: "Ops", shortLabel: "2", Icon: ClipboardList },
  { href: "/bien-etre", label: "Oracle", shortLabel: "3", Icon: Flower2 },
  { href: "/rayonner", label: "Rayonner", shortLabel: "4", Icon: MessagesSquare },
  { href: "/oracle-ludique", label: "Jeux", shortLabel: "5", Icon: Sparkles },
  { href: "/tresor", label: "Trésor", shortLabel: "6", Icon: Compass },
];
