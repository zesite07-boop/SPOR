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
          cream: "#FFFFFF",
          sage: "#F8F7FF",
          champagne: "#C9847A",
          reiki: "#7C6FAF",
          lavender: "#7C6FAF",
          rose: "#C9847A",
          night: "#1A1625",
        },
        padma: {
          champagne: "#C9847A",
          lavender: "#7C6FAF",
          pearl: "#BFA882",
          cream: "#F8F7FF",
          night: "#1A1625",
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
