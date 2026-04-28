/** Export PNG 1080×1350 — fond padma, texte lisible pour Stories / feed. */

export async function downloadMarketingImage(
  title: string,
  body: string,
  filename = "padma-studio.png"
): Promise<void> {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, "#F8F4ED");
  grd.addColorStop(0.45, "#E8D4C8");
  grd.addColorStop(1, "#C5B4D4");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(232, 196, 168, 0.35)";
  ctx.beginPath();
  ctx.arc(w * 0.85, h * 0.12, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2C3E50";
  ctx.font = "500 42px Georgia, serif";
  ctx.textAlign = "left";
  wrapText(ctx, title, 60, 140, w - 120, 52);

  ctx.font = "28px system-ui, sans-serif";
  const lines = body.split("\n").filter(Boolean);
  let y = 320;
  const maxW = w - 120;
  for (const para of lines) {
    y = wrapText(ctx, para, 60, y, maxW, 36);
    y += 12;
    if (y > h - 160) break;
  }

  ctx.font = "22px system-ui, sans-serif";
  ctx.fillStyle = "rgba(44, 62, 80, 0.75)";
  ctx.fillText("Serey Padma · studio hors ligne", 60, h - 80);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("toBlob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      },
      "image/png",
      0.92
    );
  });
}

function wrapText(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(/\s+/);
  let line = "";
  let cy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    const m = c.measureText(test);
    if (m.width > maxWidth && n > 0) {
      c.fillText(line.trim(), x, cy);
      line = words[n] + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  c.fillText(line.trim(), x, cy);
  return cy + lineHeight;
}
