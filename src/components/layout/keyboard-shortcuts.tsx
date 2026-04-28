"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { NAV_TABS } from "@/components/layout/nav-tabs";

function isEditableTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

/**
 * Raccourcis doux — ne capture pas dans les champs de saisie.
 * Ctrl+Shift+H : Hyperfocus · Échap : sortir du Hyperfocus.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const toggleHyperfocus = useUiStore((s) => s.toggleHyperfocus);
  const hyperfocus = useUiStore((s) => s.hyperfocus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      if (e.key === "Escape" && hyperfocus) {
        e.preventDefault();
        toggleHyperfocus();
        return;
      }

      if (e.ctrlKey && e.shiftKey && (e.key === "H" || e.key === "h")) {
        e.preventDefault();
        toggleHyperfocus();
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const n = Number(e.key);
        if (Number.isFinite(n) && n >= 1 && n <= NAV_TABS.length) {
          e.preventDefault();
          router.push(NAV_TABS[n - 1]!.href);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleHyperfocus, hyperfocus, router]);

  return null;
}
