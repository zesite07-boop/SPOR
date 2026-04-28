"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type OracleInterpretationBlockProps = {
  title?: string;
  text: string;
  className?: string;
};

export function OracleInterpretationBlock({ title = "Interprétation", text, className }: OracleInterpretationBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border border-padma-pearl/35 bg-white/75 p-5 shadow-inner",
        className
      )}
    >
      <p className="mb-3 flex items-center gap-2 font-cinzel text-sm tracking-wide text-padma-night">
        <Sparkles className="h-4 w-4 text-padma-champagne" aria-hidden />
        {title}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-[1.85] text-padma-night/88">{text}</p>
    </motion.div>
  );
}
