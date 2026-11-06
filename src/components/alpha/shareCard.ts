export type CardData = {
  percent: number;
  called: number;
  total: number;
  chancePercent: number;
  taps: number[]; // how many times each of the nine squares was tapped
};

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the share image on a canvas in the browser. Nothing is uploaded.
export async function drawShareCard(data: CardData): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const heading = getComputedStyle(document.documentElement).getPropertyValue("--font-heading").trim();
  const headingFont = heading ? `${heading}, system-ui, sans-serif` : "system-ui, sans-serif";

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#090b0f";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 430, 0, W / 2, 430, 620);
  glow.addColorStop(0, "rgba(34, 211, 238, 0.22)");
  glow.addColorStop(1, "rgba(34, 211, 238, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.font = `800 52px ${headingFont}`;
  ctx.textAlign = "left";
  const jargWidth = ctx.measureText("jarg").width;
  const logoStart = (W - jargWidth - ctx.measureText("AI").width) / 2;
  ctx.fillStyle = "#f4f4f5";
  ctx.fillText("jarg", logoStart, 124);
  ctx.fillStyle = "#22d3ee";
  ctx.fillText("AI", logoStart + jargWidth, 124);

  ctx.textAlign = "center";
  ctx.fillStyle = "#b3bac5";
  ctx.font = `600 40px ${headingFont}`;
  ctx.fillText("I WAS", W / 2, 260);

  ctx.fillStyle = "#f4f4f5";
  ctx.font = `800 300px ${headingFont}`;
  ctx.fillText(`${data.percent}%`, W / 2, 530);

  ctx.fillStyle = "#f59e0b";
  ctx.font = `800 84px ${headingFont}`;
  ctx.fillText("PREDICTABLE", W / 2, 640);

  ctx.fillStyle = "#b3bac5";
  ctx.font = `400 36px ${headingFont}`;
  ctx.fillText(`The Ghost called ${data.called} of ${data.total} taps.`, W / 2, 716);
  ctx.fillText(`Pure luck calls about ${data.chancePercent}%.`, W / 2, 764);

  const cell = 120;
  const gap = 12;
  const gridW = cell * 3 + gap * 2;
  const x0 = (W - gridW) / 2;
  const y0 = 794;
  const max = Math.max(1, ...data.taps);
  data.taps.forEach((count, i) => {
    const x = x0 + (i % 3) * (cell + gap);
    const y = y0 + Math.floor(i / 3) * (cell + gap);
    roundRect(ctx, x, y, cell, cell, 18);
    ctx.fillStyle = "#11151c";
    ctx.fill();
    if (count > 0) {
      roundRect(ctx, x, y, cell, cell, 18);
      ctx.fillStyle = `rgba(34, 211, 238, ${0.18 + 0.72 * (count / max)})`;
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, cell, cell, 18);
    ctx.stroke();
  });

  ctx.fillStyle = "#b3bac5";
  ctx.font = `400 30px ${headingFont}`;
  ctx.fillText("Where I tapped", W / 2, y0 + gridW + 50);

  ctx.fillStyle = "#f4f4f5";
  ctx.font = `700 42px ${headingFont}`;
  ctx.fillText("Think you can beat the Ghost? jarg.ai", W / 2, H - 52);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not make the image"))), "image/png");
  });
}
