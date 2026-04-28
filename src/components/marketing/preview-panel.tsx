"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GeneratedMarketing } from "@/lib/marketing/generate-local";
import { Button } from "@/components/ui/button";
import { Copy, Download, Instagram } from "lucide-react";
import { downloadMarketingImage } from "@/components/marketing/download-image";
import { cn } from "@/lib/utils";

export function PreviewPanel({
  generated,
  onCopy,
  hyperfocus,
}: {
  generated: GeneratedMarketing | null;
  onCopy: () => void;
  hyperfocus?: boolean;
}) {
  const handleDownloadImage = async () => {
    if (!generated) return;
    await downloadMarketingImage(generated.title, generated.body, "serey-padma-studio.png");
  };

  const fullText =
    generated &&
    `${generated.title}\n\n${generated.body}\n\n${generated.hashtags.join(" ")}`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-padma-champagne/22 bg-white/80 shadow-soft dark:border-padma-lavender/18 dark:bg-padma-night/50",
        hyperfocus && "rounded-xl"
      )}
    >
      <div className="border-b border-padma-champagne/15 px-4 py-3 dark:border-padma-lavender/12">
        <p className="font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">Prévisualisation</p>
        <p className="text-[0.65rem] text-padma-night/55 dark:text-padma-cream/58">Temps réel · texte uniquement sur l’image exportée</p>
      </div>

      <div className={cn("space-y-4 p-4", hyperfocus && "space-y-3")}>
        <AnimatePresence mode="wait">
          {generated ? (
            <motion.div
              key={generated.meta}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              <div>
                <p className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
                  Titre / objet
                </p>
                <p className="mt-1 font-cinzel text-lg text-padma-night dark:text-padma-cream">{generated.title}</p>
              </div>
              <div>
                <p className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl dark:text-padma-lavender/85">
                  Corps
                </p>
                <pre className="mt-1 max-h-[min(52vh,420px)] overflow-auto whitespace-pre-wrap rounded-xl bg-padma-cream/40 p-3 font-sans text-sm leading-relaxed text-padma-night dark:bg-padma-night/60 dark:text-padma-cream">
                  {generated.body}
                </pre>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {generated.hashtags.map((t) => (
                  <span
                    key={t}
                    className="max-w-full whitespace-normal break-words rounded-full bg-padma-lavender/15 px-2.5 py-1 text-xs leading-tight text-padma-night/85 dark:bg-padma-lavender/20 dark:text-padma-cream/88"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[0.65rem] text-padma-night/45 dark:text-padma-cream/50">{generated.meta}</p>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm italic leading-relaxed text-padma-night/58 dark:text-padma-cream/62"
            >
              Choisis un format et une intention — le studio tisse transits, prochaine retraite et souffle du tirage (tout vit dans
              Dexie sur ton appareil).
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="oracle"
            size="sm"
            className="gap-2 rounded-full"
            disabled={!fullText}
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copier · Instagram / TikTok
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2 rounded-full"
            disabled={!generated}
            onClick={() => void handleDownloadImage()}
          >
            <Download className="h-4 w-4" aria-hidden />
            Télécharger image
          </Button>
          <span className="inline-flex h-auto max-w-full items-center gap-1 whitespace-normal break-words rounded-full border border-padma-champagne/25 px-3 py-1 text-[0.65rem] leading-tight text-padma-night/55 dark:border-padma-lavender/20 dark:text-padma-cream/55">
            <Instagram className="h-3.5 w-3.5" aria-hidden />
            Coller dans l’app
          </span>
        </div>
      </div>
    </div>
  );
}
