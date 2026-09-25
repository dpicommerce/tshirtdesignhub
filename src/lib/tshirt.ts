// src/lib/tshirt.ts

export type PersonRow = {
  id: string;
  name: string;
  phone: string;
  game: string;
  hand: HandType;
  size: string;
  qty: number;

  // Individual text scale for this design
  textScale?: number;
};

export type LayerKey =
  | "name"
  | "game"
  | "size"
  | "phone";

export const LAYER_KEYS: LayerKey[] = [
  "name",
  "game",
  "size",
  "phone",
];

export const LAYER_LABELS: Record<
  LayerKey,
  string
> = {
  name: "Name",
  game: "Game",
  size: "Size",
  phone: "Phone",
};

export type FillMode =
  | "solid"
  | "gradient";

export type TextEffect =
  | "none"
  | "shadow"
  | "glow"
  | "extrude"
  | "emboss";

export type LayerStyle = {
  enabled: boolean;
  fontFamily: string;
  weight: number;
  uppercase: boolean;

  /** Font size as % of artwork width */
  sizePct: number;

  /** Horizontal stretch */
  widthPct: number;

  /** Vertical stretch */
  heightPct: number;

  /** Position relative to artwork */
  xPct: number;
  yPct: number;

  rotation: number;

  /** Arc sweep in degrees */
  curve: number;

  /** Letter spacing */
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

export type DesignStyle =
  Record<LayerKey, LayerStyle>;

export type SizeSpec = {
  size: string;
  w: number;
  h: number;
};

/**
 * Default print size chart.
 *
 * All dimensions are inches.
 */
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
  { size: "36", w: 20, h: 31 },
  { size: "38", w: 21, h: 31 },
  { size: "40", w: 22, h: 32 },
  { size: "42", w: 23, h: 32 },
  { size: "44", w: 24, h: 32 },
  { size: "46", w: 25, h: 32 },
  { size: "48", w: 26, h: 32 },
  { size: "50", w: 27, h: 32 },
  { size: "52", w: 28, h: 32 },
  { size: "54", w: 29, h: 32 },
  { size: "56", w: 30, h: 32 },
];

export const BASE_SIZE: SizeSpec = {
  size: "(L)40",
  w: 22,
  h: 32,
};

export type HandType =
  | "half"
  | "full";

export const HAND_OPTIONS: {
  label: string;
  value: HandType;
}[] = [
  {
    label: "Half Hand",
    value: "half",
  },
  {
    label: "Full Hand",
    value: "full",
  },
];

/* ============================================================
 * EXPORT SETTINGS
 * ============================================================ */

/**
 * Minimum supported export DPI.
 *
 * 72 DPI keeps exported files small.
 */
export const MIN_DPI = 72;

/**
 * Default export DPI.
 *
 * Changed from 200 to 100 to substantially
 * reduce exported pixel dimensions and file size.
 */
export const BASE_DPI = 100;

/**
 * Maximum export DPI.
 *
 * Limited to 150 so accidental 300 DPI exports
 * do not create extremely large files.
 */
export const MAX_DPI = 150;

/**
 * Default compressed image quality.
 *
 * 0.70 gives a good balance between quality
 * and file size for WebP/JPEG.
 */
export const DEFAULT_EXPORT_QUALITY = 0.70;

/**
 * Default export format.
 *
 * WebP normally gives the smallest file.
 */
export type ExportFormat =
  | "webp"
  | "jpeg"
  | "png";

export const DEFAULT_EXPORT_FORMAT: ExportFormat =
  "webp";

export const SIZES =
  DEFAULT_SIZE_CHART.map(
    (s) => s.size,
  );

export function findSize(
  chart: SizeSpec[],
  size: string,
): SizeSpec {
  return (
    chart.find(
      (s) => s.size === size,
    ) ?? BASE_SIZE
  );
}

export function sizeLabel(
  s: string,
  chart: SizeSpec[] =
    DEFAULT_SIZE_CHART,
) {
  const spec =
    chart.find(
      (x) => x.size === s,
    );

  return spec
    ? `${spec.size} — ${spec.w}×${spec.h}"`
    : s;
}

export type FontOption = {
  label: string;
  value: string;
  custom?: boolean;
};

export const FONT_OPTIONS: FontOption[] = [
  {
    label: "Anton",
    value: "Anton",
  },
  {
    label: "Bebas Neue",
    value: "'Bebas Neue'",
  },
  {
    label: "Oswald",
    value: "Oswald",
  },
  {
    label: "Archivo Black",
    value: "'Archivo Black'",
  },
  {
    label: "Teko",
    value: "Teko",
  },
  {
    label: "Rubik Mono One",
    value: "'Rubik Mono One'",
  },
  {
    label: "Playfair Display",
    value: "'Playfair Display'",
  },
  {
    label: "Pacifico",
    value: "Pacifico",
  },
  {
    label: "Caveat",
    value: "Caveat",
  },
  {
    label: "Barlow Condensed",
    value: "'Barlow Condensed'",
  },
  {
    label: "Bungee",
    value: "Bungee",
  },
  {
    label: "Monoton",
    value: "Monoton",
  },
  {
    label: "Righteous",
    value: "Righteous",
  },
  {
    label: "Alfa Slab One",
    value: "'Alfa Slab One'",
  },
  {
    label: "Black Ops One",
    value: "'Black Ops One'",
  },
  {
    label: "Press Start 2P",
    value: "'Press Start 2P'",
  },
  {
    label: "Lobster",
    value: "Lobster",
  },
  {
    label: "Great Vibes",
    value: "'Great Vibes'",
  },
  {
    label: "Permanent Marker",
    value: "'Permanent Marker'",
  },
  {
    label: "Staatliches",
    value: "Staatliches",
  },
  {
    label: "Russo One",
    value: "Russo One",
  },
  {
    label: "Orbitron",
    value: "Orbitron",
  },
  {
    label: "Faster One",
    value: "'Faster One'",
  },
  {
    label: "Creepster",
    value: "Creepster",
  },
];

const baseLayer: LayerStyle = {
  enabled: true,

  fontFamily: "Anton",
  weight: 400,
  uppercase: true,

  sizePct: 9,

  widthPct: 100,
  heightPct: 100,

  xPct: 50,
  yPct: 17,

  rotation: 0,
  curve: 0,

  letterSpacingPct: 2,

  // Default text:
  // yellow -> red gradient
  fill: "gradient",
  colorHex: "#facc15",

  gradFrom: "#ffff00",
  gradTo: "#ff0000",
  gradAngle: 90,

  outlineHex: "#111111",
  outlineWidth: 0,

  effect: "none",
  effectHex: "#000000",
  effectStrength: 3,

  opacity: 100,
};

/* ============================================================
 * DEFAULT DESIGN
 * ============================================================ */

export const defaultStyle: DesignStyle = {
  name: {
    ...baseLayer,

    // Reference:
    // centered near 17% height
    sizePct: 10,

    xPct: 50,
    yPct: 17,
  },

  game: {
    ...baseLayer,

    enabled: true,

    // Large center number
    sizePct: 34,

    xPct: 50,
    yPct: 43.3,
  },

  size: {
    ...baseLayer,

    // Small size text near bottom
    sizePct: 3,

    xPct: 50,
    yPct: 92,
  },

  phone: {
    ...baseLayer,

    enabled: false,

    sizePct: 3,

    xPct: 50,
    yPct: 82,

    uppercase: false,
  },
};

/* ============================================================
 * TEXT PRESETS
 * ============================================================ */

export const TEXT_PRESETS: {
  label: string;
  patch: Partial<LayerStyle>;
}[] = [
  {
    label: "Yellow Red",

    patch: {
      fill: "gradient",
      colorHex: "#facc15",

      gradFrom: "#ffff00",
      gradTo: "#ff0000",
      gradAngle: 90,

      outlineWidth: 0,
      effect: "none",
    },
  },

  {
    label: "Sunset gradient",

    patch: {
      fill: "gradient",

      gradFrom: "#ffff00",
      gradTo: "#ff0000",
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

    patch: {
      curve: 40,
      letterSpacingPct: 4,

      outlineWidth: 2,
      outlineHex: "#000000",
    },
  },
];

/* ============================================================
 * TEXT
 * ============================================================ */

export function layerText(
  key: LayerKey,
  row: PersonRow,
  l: LayerStyle,
): string {
  const raw =
    key === "name"
      ? row.name
      : key === "game"
        ? row.game
        : key === "size"
          ? sizeLabel(row.size)
          : row.phone;

  const text =
    (raw ?? "").trim();

  return l.uppercase
    ? text.toUpperCase()
    : text;
}

/* ============================================================
 * TEXT MEASUREMENT
 * ============================================================ */

function measureTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  let total = 0;

  for (const ch of text) {
    total +=
      ctx.measureText(ch).width +
      tracking;
  }

  return Math.max(
    0,
    total - tracking,
  );
}

/* ============================================================
 * TEXT PAINTING
 * ============================================================ */

function paintChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
  total: number,
  curveDeg: number,
  stroke: boolean,
) {
  if (!text) {
    return;
  }

  /*
   * Flat text
   */
  if (
    Math.abs(curveDeg) < 0.5
  ) {
    let x =
      -total / 2;

    for (const ch of text) {
      const cw =
        ctx.measureText(ch).width;

      if (stroke) {
        ctx.strokeText(
          ch,
          x,
          0,
        );
      }

      ctx.fillText(
        ch,
        x,
        0,
      );

      x +=
        cw +
        tracking;
    }

    return;
  }

  /*
   * Curved text
   */
  const sweep =
    (Math.abs(curveDeg) *
      Math.PI) /
    180;

  const safeSweep =
    Math.max(
      0.01,
      sweep,
    );

  const radius =
    Math.max(
      total / safeSweep,
      1,
    );

  const up =
    curveDeg > 0;

  let angle =
    -safeSweep / 2;

  for (const ch of text) {
    const cw =
      ctx.measureText(ch)
        .width;

    const step =
      (cw + tracking) /
      radius;

    ctx.save();

    if (up) {
      ctx.translate(
        0,
        radius,
      );

      ctx.rotate(
        angle +
          step / 2,
      );

      ctx.translate(
        0,
        -radius,
      );
    } else {
      ctx.translate(
        0,
        -radius,
      );

      ctx.rotate(
        -(angle +
          step / 2),
      );

      ctx.translate(
        0,
        radius,
      );
    }

    if (stroke) {
      ctx.strokeText(
        ch,
        -cw / 2,
        0,
      );
    }

    ctx.fillText(
      ch,
      -cw / 2,
      0,
    );

    ctx.restore();

    angle += step;
  }
}

/* ============================================================
 * DRAW TEXT LAYER
 * ============================================================ */

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
  if (!text) {
    return;
  }

  if (!l.enabled) {
    return;
  }

  const fontPx =
    (l.sizePct / 100) *
    w *
    scale;

  const safeFontPx =
    Math.max(
      1,
      fontPx,
    );

  const font =
    `${l.weight} ${safeFontPx}px ${l.fontFamily}, sans-serif`;

  ctx.save();

  ctx.font = font;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  ctx.globalAlpha =
    Math.max(
      0,
      Math.min(
        1,
        l.opacity / 100,
      ),
    );

  const tracking =
    (l.letterSpacingPct / 100) *
    safeFontPx;

  const total =
    measureTracked(
      ctx,
      text,
      tracking,
    );

  ctx.translate(
    ox +
      (l.xPct / 100) *
        w,
    oy +
      (l.yPct / 100) *
        h,
  );

  if (l.rotation) {
    ctx.rotate(
      (l.rotation *
        Math.PI) /
        180,
    );
  }

  const sx =
    Math.max(
      0.1,
      Math.min(
        4,
        (l.widthPct ??
          100) /
          100,
      ),
    );

  const sy =
    Math.max(
      0.1,
      Math.min(
        4,
        (l.heightPct ??
          100) /
          100,
      ),
    );

  if (
    sx !== 1 ||
    sy !== 1
  ) {
    ctx.scale(
      sx,
      sy,
    );
  }

  const strokeW =
    (l.outlineWidth / 100) *
    safeFontPx *
    2;

  ctx.lineWidth =
    strokeW;

  ctx.strokeStyle =
    l.outlineHex;

  const unit =
    safeFontPx / 100;

  /*
   * Extrude
   */
  if (
    l.effect === "extrude"
  ) {
    const depth =
      Math.max(
        1,
        Math.round(
          l.effectStrength *
            3,
        ),
      );

    ctx.fillStyle =
      l.effectHex;

    for (
      let i = depth;
      i >= 1;
      i--
    ) {
      ctx.save();

      ctx.translate(
        i * unit,
        i * unit,
      );

      paintChars(
        ctx,
        text,
        tracking,
        total,
        l.curve,
        false,
      );

      ctx.restore();
    }
  }

  /*
   * Emboss
   */
  if (
    l.effect === "emboss"
  ) {
    ctx.fillStyle =
      l.effectHex;

    ctx.save();

    ctx.translate(
      -l.effectStrength *
        unit,
      -l.effectStrength *
        unit,
    );

    paintChars(
      ctx,
      text,
      tracking,
      total,
      l.curve,
      false,
    );

    ctx.restore();
  }

  /*
   * Shadow
   */
  if (
    l.effect === "shadow"
  ) {
    ctx.shadowColor =
      l.effectHex;

    ctx.shadowBlur =
      l.effectStrength *
      unit *
      2;

    ctx.shadowOffsetX =
      l.effectStrength *
      unit;

    ctx.shadowOffsetY =
      l.effectStrength *
      unit;
  }

  /*
   * Glow
   */
  if (
    l.effect === "glow"
  ) {
    ctx.shadowColor =
      l.effectHex;

    ctx.shadowBlur =
      l.effectStrength *
      unit *
      4;
  }

  /*
   * Fill
   */
  if (
    l.fill === "gradient"
  ) {
    const angle =
      (l.gradAngle *
        Math.PI) /
      180;

    const rx =
      (Math.cos(angle) *
        total) /
      2;

    const ry =
      (Math.sin(angle) *
        safeFontPx) /
      2;

    const gradient =
      ctx.createLinearGradient(
        -rx,
        -ry,
        rx,
        ry,
      );

    gradient.addColorStop(
      0,
      l.gradFrom,
    );

    gradient.addColorStop(
      1,
      l.gradTo,
    );

    ctx.fillStyle =
      gradient;
  } else {
    ctx.fillStyle =
      l.colorHex;
  }

  paintChars(
    ctx,
    text,
    tracking,
    total,
    l.curve,
    strokeW > 0,
  );

  ctx.restore();
}

/* ============================================================
 * RENDER SHIRT
 * ============================================================ */

export function renderShirt(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  row: PersonRow,
  style: DesignStyle,
  outputWidth: number,
  outputHeight?: number,
  textScale = 1,
) {
  const sourceW =
    img.naturalWidth ||
    img.width;

  const sourceH =
    img.naturalHeight ||
    img.height;

  if (
    sourceW <= 0 ||
    sourceH <= 0
  ) {
    return;
  }

  const w =
    Math.max(
      1,
      Math.round(
        outputWidth,
      ),
    );

  const h =
    Math.max(
      1,
      Math.round(
        outputHeight ??
          (w * sourceH) /
            sourceW,
      ),
    );

  canvas.width = w;
  canvas.height = h;

  const ctx =
    canvas.getContext(
      "2d",
      {
        alpha: true,
      },
    );

  if (!ctx) {
    throw new Error(
      "Unable to create canvas context.",
    );
  }

  ctx.imageSmoothingEnabled =
    true;

  ctx.imageSmoothingQuality =
    "high";

  ctx.clearRect(
    0,
    0,
    w,
    h,
  );

  /*
   * COVER rendering.
   *
   * Fills the complete canvas
   * without transparent borders.
   */
  const scale =
    Math.max(
      w / sourceW,
      h / sourceH,
    );

  const drawW =
    sourceW * scale;

  const drawH =
    sourceH * scale;

  const drawX =
    (w - drawW) / 2;

  const drawY =
    (h - drawH) / 2;

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    0,
    0,
    w,
    h,
  );

  ctx.clip();

  ctx.drawImage(
    img,
    drawX,
    drawY,
    drawW,
    drawH,
  );

  ctx.restore();

  /*
   * Text scale.
   */
  const ts =
    Math.max(
      0.2,
      Math.min(
        3,
        Number.isFinite(
          textScale,
        )
          ? textScale
          : 1,
      ),
    );

  /*
   * Text uses complete
   * physical output area.
   */
  const artworkX = 0;
  const artworkY = 0;
  const artworkW = w;
  const artworkH = h;

  for (
    const key of LAYER_KEYS
  ) {
    const l =
      style[key];

    if (!l.enabled) {
      continue;
    }

    const text =
      layerText(
        key,
        row,
        l,
      );

    if (!text) {
      continue;
    }

    drawLayer(
      ctx,
      text,
      l,
      artworkW,
      artworkH,
      artworkX,
      artworkY,
      ts,
    );
  }
}

/* ============================================================
 * DPI / PIXEL CALCULATION
 * ============================================================ */

export function sheetPixels(
  spec: SizeSpec,
  dpi: number,
) {
  const d =
    Math.min(
      MAX_DPI,
      Math.max(
        MIN_DPI,
        Math.round(dpi),
      ),
    );

  return {
    w: Math.max(
      1,
      Math.round(
        spec.w * d,
      ),
    ),

    h: Math.max(
      1,
      Math.round(
        spec.h * d,
      ),
    ),

    dpi: d,
  };
}

/* ============================================================
 * FILENAME
 * ============================================================ */

export function slug(
  v: string,
) {
  return (
    v
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "",
      ) ||
    "name"
  );
}

/* ============================================================
 * PNG DPI METADATA
 * ============================================================ */

const CRC_TABLE =
  (() => {
    const t =
      new Uint32Array(
        256,
      );

    for (
      let n = 0;
      n < 256;
      n++
    ) {
      let c = n;

      for (
        let k = 0;
        k < 8;
        k++
      ) {
        c =
          c & 1
            ? 0xedb88320 ^
              (c >>> 1)
            : c >>> 1;
      }

      t[n] =
        c >>> 0;
    }

    return t;
  })();

function crc32(
  bytes: Uint8Array,
) {
  let c =
    0xffffffff;

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    c =
      CRC_TABLE[
        (c ^
          bytes[i]!) &
          0xff
      ]! ^
      (c >>> 8);
  }

  return (
    c ^
    0xffffffff
  ) >>> 0;
}

/**
 * Adds/replaces PNG pHYs metadata.
 */
export async function pngWithDpi(
  blob: Blob,
  dpi: number,
): Promise<Blob> {
  const src =
    new Uint8Array(
      await blob.arrayBuffer(),
    );

  const safeDpi =
    Math.min(
      MAX_DPI,
      Math.max(
        MIN_DPI,
        Math.round(dpi),
      ),
    );

  const ppm =
    Math.round(
      safeDpi / 0.0254,
    );

  /*
   * PNG pHYs chunk:
   *
   * length = 9
   * type   = pHYs
   * X ppm
   * Y ppm
   * unit   = 1 metre
   */
  const chunk =
    new Uint8Array(
      21,
    );

  const dv =
    new DataView(
      chunk.buffer,
    );

  dv.setUint32(
    0,
    9,
  );

  chunk.set(
    [
      0x70,
      0x48,
      0x59,
      0x73,
    ],
    4,
  );

  dv.setUint32(
    8,
    ppm,
  );

  dv.setUint32(
    12,
    ppm,
  );

  chunk[16] = 1;

  dv.setUint32(
    17,
    crc32(
      chunk.subarray(
        4,
        17,
      ),
    ),
  );

  let pos = 8;
  let insertAt = 8;

  const view =
    new DataView(
      src.buffer,
      src.byteOffset,
      src.byteLength,
    );

  while (
    pos + 8 <=
    src.length
  ) {
    const len =
      view.getUint32(
        pos,
      );

    const type =
      String.fromCharCode(
        src[pos + 4]!,
        src[pos + 5]!,
        src[pos + 6]!,
        src[pos + 7]!,
      );

    const next =
      pos +
      12 +
      len;

    if (
      type === "IHDR"
    ) {
      insertAt = next;
    }

    /*
     * Replace existing pHYs.
     */
    if (
      type === "pHYs"
    ) {
      const out =
        new Uint8Array(
          src.length -
            (12 + len) +
            chunk.length,
        );

      out.set(
        src.subarray(
          0,
          pos,
        ),
        0,
      );

      out.set(
        chunk,
        pos,
      );

      out.set(
        src.subarray(
          next,
        ),
        pos +
          chunk.length,
      );

      return new Blob(
        [out],
        {
          type: "image/png",
        },
      );
    }

    if (
      type === "IDAT" ||
      type === "IEND"
    ) {
      break;
    }

    pos = next;
  }

  /*
   * Insert pHYs after IHDR.
   */
  const out =
    new Uint8Array(
      src.length +
        chunk.length,
    );

  out.set(
    src.subarray(
      0,
      insertAt,
    ),
    0,
  );

  out.set(
    chunk,
    insertAt,
  );

  out.set(
    src.subarray(
      insertAt,
    ),
    insertAt +
      chunk.length,
  );

  return new Blob(
    [out],
    {
      type: "image/png",
    },
  );
}

/* ============================================================
 * COMPRESSED EXPORT
 * ============================================================ */

/**
 * Export canvas as WebP/JPEG/PNG.
 *
 * WebP is the default because it generally produces
 * significantly smaller files than PNG.
 */
export async function exportCompressedImage(
  canvas: HTMLCanvasElement,
  dpi: number,
  format: ExportFormat =
    DEFAULT_EXPORT_FORMAT,
  quality: number =
    DEFAULT_EXPORT_QUALITY,
): Promise<Blob> {
  const safeDpi =
    Math.min(
      MAX_DPI,
      Math.max(
        MIN_DPI,
        Math.round(dpi),
      ),
    );

  const safeQuality =
    Math.max(
      0.40,
      Math.min(
        0.95,
        Number.isFinite(
          quality,
        )
          ? quality
          : DEFAULT_EXPORT_QUALITY,
      ),
    );

  /*
   * PNG is lossless.
   *
   * Quality does not apply to PNG.
   */
  if (
    format === "png"
  ) {
    const blob =
      await canvasToBlob(
        canvas,
        "image/png",
      );

    return pngWithDpi(
      blob,
      safeDpi,
    );
  }

  /*
   * WebP.
   *
   * Falls back to JPEG if the
   * browser does not support WebP.
   */
  if (
    format === "webp"
  ) {
    const webp =
      await canvasToBlob(
        canvas,
        "image/webp",
        safeQuality,
      );

    /*
     * Some browsers may return
     * PNG when WebP isn't supported.
     */
    if (
      webp.type ===
      "image/webp"
    ) {
      return webp;
    }

    return canvasToBlob(
      canvas,
      "image/jpeg",
      safeQuality,
    );
  }

  /*
   * JPEG.
   */
  return canvasToBlob(
    canvas,
    "image/jpeg",
    safeQuality,
  );
}

/* ============================================================
 * CANVAS TO BLOB
 * ============================================================ */

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Unable to create export image.",
              ),
            );

            return;
          }

          resolve(blob);
        },
        mimeType,
        quality,
      );
    },
  );
}

/* ============================================================
 * TARGET FILE SIZE EXPORT
 * ============================================================ */

/**
 * Export an image while attempting to stay below
 * the requested maximum file size.
 *
 * Example:
 *
 *   const blob =
 *     await exportToMaxSize(
 *       canvas,
 *       100,
 *       2,
 *     );
 *
 * 2 = maximum target size in MB.
 *
 * WebP quality is progressively reduced until
 * the target is reached or the minimum quality
 * limit is reached.
 */
export async function exportToMaxSize(
  canvas: HTMLCanvasElement,
  dpi: number,
  maxSizeMB = 2,
  format: ExportFormat =
    DEFAULT_EXPORT_FORMAT,
): Promise<Blob> {
  const targetBytes =
    Math.max(
      0.25,
      maxSizeMB,
    ) *
    1024 *
    1024;

  /*
   * PNG cannot be quality-compressed.
   *
   * Return PNG directly.
   */
  if (
    format === "png"
  ) {
    return exportCompressedImage(
      canvas,
      dpi,
      "png",
    );
  }

  /*
   * Try several quality levels.
   */
  const qualities = [
    0.80,
    0.70,
    0.60,
    0.50,
    0.45,
    0.40,
  ];

  let bestBlob: Blob | null =
    null;

  for (
    const quality of qualities
  ) {
    const blob =
      await exportCompressedImage(
        canvas,
        dpi,
        format,
        quality,
      );

    bestBlob = blob;

    if (
      blob.size <=
      targetBytes
    ) {
      return blob;
    }
  }

  /*
   * If the requested target cannot be
   * reached, return the smallest version
   * generated.
   */
  return (
    bestBlob ??
    exportCompressedImage(
      canvas,
      dpi,
      format,
      0.40,
    )
  );
}

/* ============================================================
 * RECOMMENDED EXPORT
 * ============================================================ */

/**
 * Recommended export for the application.
 *
 * Defaults:
 *
 *   DPI      = 100
 *   Format   = WebP
 *   Quality  = 0.70
 *   Max size = 2 MB
 *
 * This gives substantially smaller files
 * than the old 200 DPI PNG export.
 */
export async function exportDesign(
  canvas: HTMLCanvasElement,
  dpi: number = BASE_DPI,
  maxSizeMB = 2,
): Promise<Blob> {
  return exportToMaxSize(
    canvas,
    dpi,
    maxSizeMB,
    "webp",
  );
}

