import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oasis: {
          cream: "#F8F4ED",
          sage: "#E8F0E8",
          champagne: "#D4AF88",
          reiki: "#4A7043",
          lavender: "#C8A2C8",
          rose: "#E8B4BC",
          night: "#2C3E50",
        },
        /** Serey Padma — or rose champagne, lavande, bleu nacré (complète oasis sans casser l’existant) */
        padma: {
          champagne: "#E8C4A8",
          lavender: "#C5B4D4",
          pearl: "#A8B4C8",
          cream: "#F8F4ED",
          night: "#2C3E50",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        cinzel: ["var(--font-cinzel)", "var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(44, 62, 80, 0.12)",
        glow: "0 0 40px -10px rgba(212, 175, 136, 0.35)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
