"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Commande vocale — Web Speech API (navigator expérimental). */
export function VoiceHint() {
  const startListening = () => {
    if (typeof window === "undefined") return;
    type RecognitionInstance = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      onresult: ((ev: unknown) => void) | null;
      onerror: ((ev: unknown) => void) | null;
    };
    type RecognitionCtor = new () => RecognitionInstance;
    const W = window as Window & {
      SpeechRecognition?: RecognitionCtor;
      webkitSpeechRecognition?: RecognitionCtor;
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) {
      alert("La reconnaissance vocale n'est pas disponible ici — essaie Chrome.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = () => {};
    recognition.onerror = () => {};
    recognition.start();
  };

  return (
    <Button type="button" variant="ghost" size="sm" className="gap-2 text-oasis-night/70" onClick={startListening}>
      <Mic className="h-4 w-4 text-oasis-reiki" aria-hidden />
      Commander à voix haute (beta)
    </Button>
  );
}
