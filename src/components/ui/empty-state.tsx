import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

/** État vide harmonisé — poétique, sans culpabiliser. */
export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "padma-card-quiet flex flex-col items-center gap-4 px-6 py-10 text-center transition-all duration-300 hover:border-padma-champagne/30",
        className
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-padma-champagne/18 text-padma-pearl dark:bg-padma-lavender/18 dark:text-padma-lavender">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <div className="max-w-sm space-y-2">
        <p className="font-cinzel text-lg tracking-wide text-padma-night dark:text-padma-cream">{title}</p>
        <p className="text-sm leading-relaxed text-padma-night/72 dark:text-padma-cream/75">{description}</p>
      </div>
      {children}
    </div>
  );
}
