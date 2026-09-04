export type PersonRow = {
  id: string;
  name: string;
  phone: string;
  number: string;
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
  showPhone: boolean;
  showNumber: boolean;
};

// Size label → chest measurement shown in the size pickers
export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export const SIZE_VALUES: Record<(typeof SIZES)[number], string> = {
  XS: '32–34"',
  S: '34–36"',
  M: '38–40"',
  L: '40–42"',
  XL: '42–44"',
  "2XL": '46–48"',
  "3XL": '50–52"',
};

export const sizeLabel = (s: string) =>
  s in SIZE_VALUES
    ? `${s} (${SIZE_VALUES[s as keyof typeof SIZE_VALUES]})`
    : s;

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
  showPhone: false,
  showNumber: false,
};

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  stroke: boolean,
) {
  const { width } = ctx.measureText(text);
  const totalWidth = width + Math.max(0, text.length - 1) * tracking;
  let curX = x - totalWidth / 2;
  for (const ch of text) {
    const chWidth = ctx.measureText(ch).width;
    if (stroke) ctx.strokeText(ch, curX, y);
    ctx.fillText(ch, curX, y);
    curX += chWidth + tracking;
  }
}

/** Renders the artwork + personalised name onto a canvas at the given output width. */
export function renderShirt(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  row: { name: string; size: string; phone?: string; number?: string },
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

  const applyCase = (v: string) => (s.uppercase ? v.toUpperCase() : v);
  const name = applyCase(row.name);

  const fontPx = (s.sizePct / 100) * w;
  const cx = (s.xPct / 100) * w;
  const cy = (s.yPct / 100) * h;
  const tracking = (s.letterSpacingPct / 100) * fontPx;

  // Extra lines under the name, in order: number, size, phone
  const extras: string[] = [];
  if (s.showNumber && row.number?.trim()) extras.push(applyCase(row.number.trim()));
  if (s.showSize && row.size) extras.push(sizeLabel(row.size));
  if (s.showPhone && row.phone?.trim()) extras.push(row.phone.trim());

  if (!name.trim() && !extras.length) return;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = s.colorHex;
  ctx.strokeStyle = s.outlineHex;
  ctx.lineJoin = "round";

  ctx.font = `${s.weight} ${fontPx}px ${s.fontFamily}, sans-serif`;
  ctx.lineWidth = (s.outlineWidth / 100) * fontPx * 2;
  drawTracked(ctx, name, cx, cy, tracking, s.outlineWidth > 0);

  let y = cy + fontPx / 2;
  for (const line of extras) {
    const sizePx = fontPx * s.sizeScale;
    ctx.font = `${s.weight} ${sizePx}px ${s.fontFamily}, sans-serif`;
    ctx.lineWidth = (s.outlineWidth / 100) * sizePx * 2;
    y += sizePx / 2 + (s.sizeGapPct / 100) * fontPx;
    drawTracked(ctx, line, cx, y, (s.letterSpacingPct / 100) * sizePx, s.outlineWidth > 0);
    y += sizePx / 2;
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
