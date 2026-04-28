import type { MarketingFormat, MarketingScenario } from "@/lib/db/schema";
import type { MarketingContext } from "@/lib/marketing/context";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { drawSeededForDate } from "@/lib/oracle/daily-oracle";

export type GeneratedMarketing = {
  title: string;
  body: string;
  hashtags: string[];
  /** Pour carrousel : lignes par slide. */
  slides?: string[];
  meta: string;
};

function brandLine(): string {
  return "Serey Padma — retraites Reiki & oracle";
}

function hashPick<T>(seed: string, items: readonly T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length]!;
}

export function generateMarketingCopy(
  format: MarketingFormat,
  scenario: MarketingScenario,
  ctx: MarketingContext
): GeneratedMarketing {
  const seed = `${ctx.dateIso}|${format}|${scenario}`;
  const retreat = ctx.nextRetreat;
  const retreatLine = retreat
    ? `${retreat.title} · ${retreat.destinationLabel} · énergie ${retreat.energyLabel}`
    : "prochaine retraite à annoncer — place ton intention dans le calendrier.";

  const oracleLine = ctx.oracle
    ? `Énergie du tirage : ${ctx.oracle.energyCardName} — ${ctx.oracle.energyKeyword}.`
    : (() => {
        const [a, b] = drawSeededForDate(new Date(ctx.dateIso));
        const A = getMajorById(a);
        const B = getMajorById(b);
        return `Ligne du jour (offline) : ${A.name} & ${B.name} — ${A.gentle}`;
      })();

  const moon = `Lune : ${ctx.moonPhase}.`;
  const astro = `${ctx.sunSign} · jour personnel ${ctx.personalDayNumber} (${ctx.personalDayTheme}).`;

  const hooks = [
    "Ce n'est pas du luxe : c'est une forme d'ecoute de soi.",
    "Quand le bruit baisse, ton intuition retrouve sa voix.",
    "Moins d'effort, plus de presence - bienvenue dans le rythme Padma.",
    "Ton souffle connait deja le chemin du calme.",
  ] as const;

  const ctas = [
    "Reserve ta place ou offre-toi une conversation douce.",
    "Lien en bio · places limitées.",
    "DM 'retraite' pour recevoir le guide du sejour.",
    "Inscris-toi avant la prochaine lune - les chambres partent en silence.",
  ] as const;

  const hook = hashPick(seed + "h", hooks);
  const cta = hashPick(seed + "c", ctas);

  let title = "";
  let body = "";
  const hashtags: string[] = [
    "#SereyPadma",
    "#Reiki",
    "#Oracle",
    retreat ? `#${retreat.destination.replace(/\s/g, "")}` : "#bienetre",
    "#retraite",
  ];

  switch (scenario) {
    case "before_retreat":
      title = retreat ? `Dans ${daysUntil(retreat)} jours · ${retreat.title}` : "Avant la retraite — préparer son nid";
      body = `${hook}\n\n${retreatLine}\n${oracleLine}\n${moon}\n${astro}\n\n${cta}\n\n${brandLine()}`;
      break;
    case "during_retreat":
      title = retreat ? `Pendant le cercle · ${retreat.energyLabel}` : "Pendant la retraite — présence";
      body = `Ici, on ralentit sans abandonner ce qui compte.\n\n${oracleLine}\n${moon}\n\n${cta}\n\n${brandLine()}`;
      break;
    case "after_retreat":
      title = "Après la retraite — intégration douce";
      body = `Ramène une chose : une sensation, un mot, une couleur.\n\n${oracleLine}\n\n${cta}\n\n${brandLine()}`;
      break;
    case "daily_draw":
      title = `Tirage du jour · ${ctx.dateLabelFr}`;
      body = `${oracleLine}\n${moon}\n${astro}\n\n${hook}\n\n${cta}`;
      hashtags.push("#tiragedujour", "#oracle");
      break;
    case "referral":
      title = "Parrainer une âme sœur";
      body = `Tu connais quelqu’un qui murmure « j’ai besoin de pause » ?\nEnvoie-lui cette bulle.\n\n${oracleLine}\n\n${cta}\n\n${brandLine()}`;
      hashtags.push("#parrainage");
      break;
    case "announcement":
    default:
      title = retreat ? `Annonce · ${retreat.title}` : "Annonce padma";
      body = `${hook}\n\n${retreatLine}\n${moon}\n${astro}\n\n${cta}\n\n${brandLine()}`;
      break;
  }

  let slides: string[] | undefined;
  let meta = `Généré hors ligne · ${ctx.dateIso}`;

  switch (format) {
    case "reel_60":
      body = formatReel(body, hook, cta);
      meta = `${meta} · format Reel 60s`;
      break;
    case "story":
      body = body
        .split("\n")
        .filter(Boolean)
        .slice(0, 5)
        .join("\n");
      meta = `${meta} · Story`;
      break;
    case "carousel":
      slides = buildCarouselSlides(title, body, ctx, hook);
      body = slides.map((s, i) => `— Slide ${i + 1} —\n${s}`).join("\n\n");
      meta = `${meta} · Carrousel ${slides.length} slides`;
      break;
    case "feed_post":
      meta = `${meta} · Post feed`;
      break;
    case "email":
      title = `[Padma] ${title}`;
      body = `Objet suggere : ${title}\n\nBonjour belle ame,\n\n${body.replace(/\n\n+/g, "\n\n")}\n\nAvec douceur,\nSerey Padma`;
      meta = `${meta} · Email`;
      break;
  }

  return {
    title,
    body: body.trim(),
    hashtags: [...new Set(hashtags)].slice(0, 10),
    slides,
    meta,
  };
}

function daysUntil(retreat: { startDate: string }): string {
  const t = new Date(retreat.startDate + "T12:00:00").getTime();
  const now = Date.now();
  const d = Math.ceil((t - now) / 86400000);
  if (d <= 0) return "quelques";
  return String(d);
}

function formatReel(core: string, hook: string, cta: string): string {
  return [
    "━━ 0–3s · accroche ━━",
    hook,
    "",
    "━━ 3–25s · corps ━━",
    core.split("\n").slice(0, 6).join("\n"),
    "",
    "━━ 25–50s · preuve / ressenti ━━",
    "Un geste simple : main sur le cœur, souffle plus long.",
    "",
    "━━ 50–60s · CTA ━━",
    cta,
  ].join("\n");
}

function buildCarouselSlides(
  title: string,
  body: string,
  ctx: MarketingContext,
  hook: string
): string[] {
  const s1 = title;
  const s2 = hook;
  const s3 = ctx.oracle?.energyCardName
    ? `Oracle : ${ctx.oracle.energyCardName}`
    : "Une carte · une respiration · un oui doux.";
  const s4 = ctx.nextRetreat
    ? `${ctx.nextRetreat.title}\n${ctx.nextRetreat.subtitle}`
    : body.split("\n").find((l) => l.length > 12) ?? "Ton rythme compte.";
  const s5 = `${ctx.moonPhase} · ${ctx.sunSign}`;
  const s6 = body.split("\n").pop() ?? "Serey Padma";
  return [s1, s2, s3, s4, s5, s6].map((t) => t.trim());
}
