import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cinzel } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const siteUrl =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? process.env.NEXT_PUBLIC_APP_URL
    : typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.length > 0
      ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Serey Padma by Céline — Reiki · Oracle · Retreats",
    template: "%s · Serey Padma by Céline",
  },
  description:
    "Serey Padma by Céline est un sanctuaire digital premium : Reiki, Oracle, Retreats et pilotage doux, avec mode hors ligne PWA.",
  keywords: [
    "Serey Padma by Céline",
    "retraite Reiki",
    "oracle",
    "bien-être",
    "astrologie",
    "numérologie",
    "France",
    "Portugal",
  ],
  authors: [{ name: "Serey Padma by Céline" }],
  creator: "Serey Padma by Céline",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.svg", type: "image/svg+xml" }, { url: "/icon-512.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon-512.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Serey Padma by Céline",
    startupImage: ["/apple-splash.svg"],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Serey Padma by Céline",
    title: "Serey Padma by Céline — Reiki · Oracle · Retreats",
    description:
      "Un sanctuaire numérique haut de gamme pour respirer avec la Lune, organiser tes retraites et rayonner avec cohérence, même sans réseau.",
    images: [
      {
        url: "/serey_padma_lotus.png",
        width: 1024,
        height: 1024,
        alt: "Serey Padma by Céline - lotus et énergie douce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serey Padma by Céline — Reiki · Oracle · Retreats",
    description: "Retraites, oracle et présence au quotidien avec un design premium, doux et professionnel.",
    images: ["/serey_padma_lotus.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F4ED" },
    { media: "(prefers-color-scheme: dark)", color: "#2C3E50" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${cinzel.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
