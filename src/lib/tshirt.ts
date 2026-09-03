export type PersonRow = {
  id: string;
  name: string;
  size: string;
  qty: number;
};

export type NameStyle = {
  fontFamily: string;
  weight: number;
  colorHex: string;
  outlineHex: string;
  outlineWidth: number;
  sizePct: number; // % of image width
  xPct: number;
  yPct: number;
  letterSpacingPct: number;
  uppercase: boolean;
  showSize: boolean;
  sizeScale: number; // size text relative to name
  sizeGapPct: number;
};

export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export const FONT_OPTIONS = [
  { label: "Anton", value: "Anton" },
  { label: "Bebas Neue", value: "'Bebas Neue'" },
  { label: "Oswald", value: "Oswald" },
  { label: "Archivo Black", value: "'Archivo Black'" },
  { label: "Teko", value: "Teko" },
  { label: "Rubik Mono One", value: "'Rubik Mono One'" },
  { label: "Playfair Display", value: "'Playfair Display'" },
  { label: "Pacifico", value: "Pacifico" },
  { label: "Caveat", value: "Caveat" },
  { label: "Barlow Condensed", value: "'Barlow Condensed'" },
];

export const defaultStyle: NameStyle = {
  fontFamily: "Anton",
  weight: 400,
  colorHex: "#ffffff",
  outlineHex: "#111111",
  outlineWidth: 0,
  sizePct: 9,
  xPct: 50,
  yPct: 62,
  letterSpacingPct: 2,
  uppercase: true,
  showSize: true,
  sizeScale: 0.55,
  sizeGapPct: 3,
};

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
  stroke: boolean,
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((c, i) => {
    if (stroke) ctx.strokeText(c, x, y);
    ctx.fillText(c, x, y);
    x += widths[i] + tracking;
  });
}

/** Renders the artwork + personalised name onto a canvas at the given output width. */
export function renderShirt(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  row: { name: string; size: string },
  s: NameStyle,
  outputWidth: number,
) {
  const ratio = img.naturalHeight / img.naturalWidth;
  const w = Math.round(outputWidth);
  const h = Math.round(outputWidth * ratio);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const name = s.uppercase ? row.name.toUpperCase() : row.name;
  if (!name.trim() && !s.showSize) return;

  const fontPx = (s.sizePct / 100) * w;
  const cx = (s.xPct / 100) * w;
  const cy = (s.yPct / 100) * h;
  const tracking = (s.letterSpacingPct / 100) * fontPx;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = s.colorHex;
  ctx.strokeStyle = s.outlineHex;
  ctx.lineJoin = "round";

  ctx.font = `${s.weight} ${fontPx}px ${s.fontFamily}, sans-serif`;
  ctx.lineWidth = (s.outlineWidth / 100) * fontPx * 2;
  drawTracked(ctx, name, cx, cy, tracking, s.outlineWidth > 0);

  if (s.showSize && row.size) {
    const sizePx = fontPx * s.sizeScale;
    ctx.font = `${s.weight} ${sizePx}px ${s.fontFamily}, sans-serif`;
    ctx.lineWidth = (s.outlineWidth / 100) * sizePx * 2;
    const y = cy + fontPx / 2 + sizePx / 2 + (s.sizeGapPct / 100) * fontPx;
    drawTracked(ctx, row.size, cx, y, (s.letterSpacingPct / 100) * sizePx, s.outlineWidth > 0);
  }
}

export function slug(v: string) {
  return (
    v
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "name"
  );
}
