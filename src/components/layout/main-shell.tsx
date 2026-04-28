"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { CelebrationPulse } from "@/components/layout/celebration-pulse";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { TwoFactorRouteGuard } from "@/components/security/twofa-route-guard";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hyperfocus = useUiStore((s) => s.hyperfocus);

  return (
    <>
      <KeyboardShortcuts />
      <CelebrationPulse />
      <TwoFactorRouteGuard />
      <div
        className={cn(
          "min-h-dvh pb-[max(80px,env(safe-area-inset-bottom))] transition-[padding,box-shadow,filter] duration-400 ease-out md:pb-24",
          hyperfocus &&
            "pb-[max(80px,env(safe-area-inset-bottom))] ring-2 ring-padma-champagne/35 ring-inset saturate-[1.04]"
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-2xl px-4 pt-6 transition-[padding,max-width,gap] duration-300 ease-out md:px-5",
            hyperfocus && "max-w-xl px-4 pt-3 [&_*]:motion-reduce:transition-none"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, scale: 0.998 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
