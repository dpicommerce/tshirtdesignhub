export type PersonRow = {
  id: string;
  name: string;
  phone: string;
  number: string;
  size: string;
  qty: number;
};

export type LayerKey = "name" | "number" | "size" | "phone";

export const LAYER_KEYS: LayerKey[] = ["name", "number", "size", "phone"];

export const LAYER_LABELS: Record<LayerKey, string> = {
  name: "Name",
  number: "Number",
  size: "Size",
  phone: "Phone",
};

export type FillMode = "solid" | "gradient";
export type TextEffect = "none" | "shadow" | "glow" | "extrude" | "emboss";

export type LayerStyle = {
  enabled: boolean;
  fontFamily: string;
  weight: number;
  uppercase: boolean;
  /** font size as % of image width */
  sizePct: number;
  xPct: number;
  yPct: number;
  rotation: number;
  /** total arc sweep in degrees; 0 = flat */
  curve: number;
  letterSpacingPct: number;
  fill: FillMode;
  colorHex: string;
  gradFrom: string;
  gradTo: string;
  gradAngle: number;
  outlineHex: string;
  outlineWidth: number;
  effect: TextEffect;
  effectHex: string;
  effectStrength: number;
  opacity: number;
};

export type DesignStyle = Record<LayerKey, LayerStyle>;

export type SizeSpec = { size: string; w: number; h: number };

/** Print sheet chart (inches). Default artwork sheet is 22 x 32" at 200 DPI. */
export const DEFAULT_SIZE_CHART: SizeSpec[] = [
  { size: "18", w: 12, h: 17 },
  { size: "20", w: 12, h: 18 },
  { size: "22", w: 13, h: 19 },
  { size: "24", w: 14, h: 21 },
  { size: "26", w: 15, h: 22 },
  { size: "28", w: 16, h: 24 },
  { size: "30", w: 17, h: 25 },
  { size: "32", w: 18, h: 26 },
  { size: "34", w: 19, h: 29 },
  { size: "(S)36", w: 20, h: 31 },
  { size: "(M)38", w: 21, h: 31 },
  { size: "(L)40", w: 22, h: 32 },
  { size: "(XL)42", w: 23, h: 32 },
  { size: "(XXL)44", w: 24, h: 32 },
  { size: "(XXXL)46", w: 25, h: 32 },
  { size: "(XXXXL)48", w: 26, h: 32 },
  { size: "50", w: 27, h: 32 },
  { size: "52", w: 28, h: 32 },
  { size: "54", w: 29, h: 32 },
  { size: "56", w: 30, h: 32 },
];

export const BASE_SIZE: SizeSpec = { size: "(L)40", w: 22, h: 32 };
export const BASE_DPI = 200;
export const MAX_DPI = 300;

export const SIZES = DEFAULT_SIZE_CHART.map((s) => s.size);

export const findSize = (chart: SizeSpec[], size: string): SizeSpec =>
  chart.find((s) => s.size === size) ?? BASE_SIZE;

export const sizeLabel = (s: string, chart: SizeSpec[] = DEFAULT_SIZE_CHART) => {
  const spec = chart.find((x) => x.size === s);
  return spec ? `${spec.size} — ${spec.w}×${spec.h}"` : s;
};


export type FontOption = { label: string; value: string; custom?: boolean };

export const FONT_OPTIONS: FontOption[] = [
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
  { label: "Bungee", value: "Bungee" },
  { label: "Monoton", value: "Monoton" },
  { label: "Righteous", value: "Righteous" },
  { label: "Alfa Slab One", value: "'Alfa Slab One'" },
  { label: "Black Ops One", value: "'Black Ops One'" },
  { label: "Press Start 2P", value: "'Press Start 2P'" },
  { label: "Lobster", value: "Lobster" },
  { label: "Great Vibes", value: "'Great Vibes'" },
  { label: "Permanent Marker", value: "'Permanent Marker'" },
  { label: "Staatliches", value: "Staatliches" },
  { label: "Russo One", value: "'Russo One'" },
  { label: "Orbitron", value: "Orbitron" },
  { label: "Faster One", value: "'Faster One'" },
  { label: "Creepster", value: "Creepster" },
];

const baseLayer: LayerStyle = {
  enabled: true,
  fontFamily: "Anton",
  weight: 400,
  uppercase: true,
  sizePct: 9,
  xPct: 50,
  yPct: 62,
  rotation: 0,
  curve: 0,
  letterSpacingPct: 2,
  fill: "solid",
  colorHex: "#ffffff",
  gradFrom: "#fbbf24",
  gradTo: "#ef4444",
  gradAngle: 90,
  outlineHex: "#111111",
  outlineWidth: 0,
  effect: "none",
  effectHex: "#000000",
  effectStrength: 3,
  opacity: 100,
};

export const defaultStyle: DesignStyle = {
  name: { ...baseLayer },
  number: { ...baseLayer, enabled: false, sizePct: 14, yPct: 40 },
  size: { ...baseLayer, sizePct: 4.5, yPct: 71 },
  phone: { ...baseLayer, enabled: false, sizePct: 3.5, yPct: 78, uppercase: false },
};

/** Presets for quick advanced looks. */
export const TEXT_PRESETS: { label: string; patch: Partial<LayerStyle> }[] = [
  {
    label: "Clean white",
    patch: { fill: "solid", colorHex: "#ffffff", outlineWidth: 0, effect: "none" },
  },
  {
    label: "Sunset gradient",
    patch: {
      fill: "gradient",
      gradFrom: "#fde047",
      gradTo: "#f43f5e",
      gradAngle: 90,
      outlineWidth: 0,
      effect: "none",
    },
  },
  {
    label: "Chrome",
    patch: {
      fill: "gradient",
      gradFrom: "#f8fafc",
      gradTo: "#64748b",
      gradAngle: 90,
      outlineHex: "#0f172a",
      outlineWidth: 1.5,
      effect: "emboss",
      effectHex: "#ffffff",
      effectStrength: 2,
    },
  },
  {
    label: "Varsity outline",
    patch: {
      fill: "solid",
      colorHex: "#111111",
      outlineHex: "#ffffff",
      outlineWidth: 3,
      effect: "extrude",
      effectHex: "#ef4444",
      effectStrength: 4,
    },
  },
  {
    label: "Neon glow",
    patch: {
      fill: "solid",
      colorHex: "#f0fdfa",
      outlineWidth: 0,
      effect: "glow",
      effectHex: "#22d3ee",
      effectStrength: 8,
    },
  },
  {
    label: "3D pop",
    patch: {
      fill: "gradient",
      gradFrom: "#ffffff",
      gradTo: "#cbd5e1",
      gradAngle: 90,
      outlineHex: "#0f172a",
      outlineWidth: 2,
      effect: "extrude",
      effectHex: "#0f172a",
      effectStrength: 6,
    },
  },
  {
    label: "Arched team",
    patch: { curve: 40, letterSpacingPct: 4, outlineWidth: 2, outlineHex: "#000000" },
  },
];

export function layerText(key: LayerKey, row: PersonRow, l: LayerStyle): string {
  const raw =
    key === "name"
      ? row.name
      : key === "number"
        ? row.number
        : key === "size"
          ? sizeLabel(row.size)
          : row.phone;
  const t = (raw ?? "").trim();
  return l.uppercase ? t.toUpperCase() : t;
}

function measureTracked(ctx: CanvasRenderingContext2D, text: string, tracking: number) {
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + tracking;
  return total - tracking;
}

function paintChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
  total: number,
  curveDeg: number,
  fontPx: number,
  stroke: boolean,
) {
  if (Math.abs(curveDeg) < 0.5) {
    let x = -total / 2;
    for (const ch of text) {
      const cw = ctx.measureText(ch).width;
      if (stroke) ctx.strokeText(ch, x, 0);
      ctx.fillText(ch, x, 0);
      x += cw + tracking;
    }
    return;
  }
  const sweep = (Math.abs(curveDeg) * Math.PI) / 180;
  const radius = total / sweep;
  const up = curveDeg > 0; // arch upward
  let angle = -sweep / 2;
  for (const ch of text) {
    const cw = ctx.measureText(ch).width;
    const step = (cw + tracking) / radius;
    ctx.save();
    if (up) {
      ctx.translate(0, radius);
      ctx.rotate(angle + step / 2);
      ctx.translate(0, -radius);
    } else {
      ctx.translate(0, -radius);
      ctx.rotate(-(angle + step / 2));
      ctx.translate(0, radius);
    }
    if (stroke) ctx.strokeText(ch, -cw / 2, 0);
    ctx.fillText(ch, -cw / 2, 0);
    ctx.restore();
    angle += step;
  }
  void fontPx;
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  text: string,
  l: LayerStyle,
  w: number,
  h: number,
  ox: number,
  oy: number,
  scale: number,
) {
  if (!text) return;
  const fontPx = (l.sizePct / 100) * w * scale;
  const font = `${l.weight} ${fontPx}px ${l.fontFamily}, sans-serif`;
  ctx.save();
  ctx.font = font;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.globalAlpha = Math.max(0, Math.min(1, l.opacity / 100));

  const tracking = (l.letterSpacingPct / 100) * fontPx;
  const total = measureTracked(ctx, text, tracking);

  ctx.translate(ox + (l.xPct / 100) * w, oy + (l.yPct / 100) * h);
  if (l.rotation) ctx.rotate((l.rotation * Math.PI) / 180);

  const strokeW = (l.outlineWidth / 100) * fontPx * 2;
  ctx.lineWidth = strokeW;
  ctx.strokeStyle = l.outlineHex;

  const unit = fontPx / 100;

  // --- effects painted behind the main glyphs ---
  if (l.effect === "extrude") {
    const depth = Math.max(1, Math.round(l.effectStrength * 3));
    ctx.fillStyle = l.effectHex;
    for (let i = depth; i >= 1; i--) {
      ctx.save();
      ctx.translate(i * unit, i * unit);
      paintChars(ctx, text, tracking, total, l.curve, fontPx, false);
      ctx.restore();
    }
  } else if (l.effect === "emboss") {
    ctx.fillStyle = l.effectHex;
    ctx.save();
    ctx.translate(-l.effectStrength * unit, -l.effectStrength * unit);
    paintChars(ctx, text, tracking, total, l.curve, fontPx, false);
    ctx.restore();
  }

  if (l.effect === "shadow") {
    ctx.shadowColor = l.effectHex;
    ctx.shadowBlur = l.effectStrength * unit * 2;
    ctx.shadowOffsetX = l.effectStrength * unit;
    ctx.shadowOffsetY = l.effectStrength * unit;
  } else if (l.effect === "glow") {
    ctx.shadowColor = l.effectHex;
    ctx.shadowBlur = l.effectStrength * unit * 4;
  }

  if (l.fill === "gradient") {
    const a = (l.gradAngle * Math.PI) / 180;
    const rx = (Math.cos(a) * total) / 2;
    const ry = (Math.sin(a) * fontPx) / 2;
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, l.gradFrom);
    g.addColorStop(1, l.gradTo);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = l.colorHex;
  }

  paintChars(ctx, text, tracking, total, l.curve, fontPx, strokeW > 0);
  ctx.restore();
}

/**
 * Renders the artwork + all personalised text layers at the given output size.
 * Text is positioned and scaled relative to the printed artwork area (not the
 * raw canvas), so every shirt size keeps identical text placement.
 */
export function renderShirt(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  row: PersonRow,
  style: DesignStyle,
  outputWidth: number,
  outputHeight?: number,
  textScale = 1,
) {
  const ratio = img.naturalHeight / img.naturalWidth;
  const w = Math.max(1, Math.round(outputWidth));
  const h = Math.max(1, Math.round(outputHeight ?? outputWidth * ratio));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, w, h);

  // fit artwork inside the sheet, preserving its aspect ratio
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  const ts = Math.max(0.2, Math.min(3, textScale));
  for (const key of LAYER_KEYS) {
    const l = style[key];
    if (!l.enabled) continue;
    drawLayer(ctx, layerText(key, row, l), l, dw, dh, dx, dy, ts);
  }
}


/** Pixel dimensions of a print sheet for a given size + DPI (capped at MAX_DPI). */
export function sheetPixels(spec: SizeSpec, dpi: number) {
  const d = Math.min(MAX_DPI, Math.max(72, Math.round(dpi)));
  return { w: Math.round(spec.w * d), h: Math.round(spec.h * d), dpi: d };
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
