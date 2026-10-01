// src/lib/tshirt.ts

export type PersonRow = {
  id: string;
  name: string;
  phone: string;
  number: string;
  size: string;
  qty: number;

  // Individual text scale for this design
  textScale?: number;
};

export type LayerKey = "name" | "number" | "size" | "phone";

export const LAYER_KEYS: LayerKey[] = [
  "name",
  "number",
  "size",
  "phone",
];

export const LAYER_LABELS: Record<LayerKey, string> = {
  name: "Name",
  number: "Number",
  size: "Size",
  phone: "Phone",
};

export type FillMode = "solid" | "gradient";

export type TextDirection = "horizontal" | "vertical-up" | "vertical-down";

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

  /** Text writing direction/orientation */
  direction: TextDirection;

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

export type DesignStyle = Record<LayerKey, LayerStyle>;

export type ClipArt = {
  id: string;
  src: string;
  image?: HTMLImageElement;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  shadow: boolean;
  shadowBlur: number;
  shadowOpacity: number;
};


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

export const BASE_DPI = 200;
export const MAX_DPI = 300;

export const SIZES = DEFAULT_SIZE_CHART.map((s) => s.size);

export function findSize(
  chart: SizeSpec[],
  size: string,
): SizeSpec {
  const raw = String(size ?? "").trim();
  const normalized = raw.replace(/^\([^)]*\)\s*/, "");

  return (
    chart.find((s) => s.size === raw) ??
    chart.find((s) => s.size === normalized) ??
    BASE_SIZE
  );
}

export function sizeLabel(
  s: string,
  chart: SizeSpec[] = DEFAULT_SIZE_CHART,
) {
  const spec = chart.find((x) => x.size === s);

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
  direction: "horizontal",

  sizePct: 9,
  widthPct: 100,
  heightPct: 100,

  xPct: 50,
  yPct: 17,

  rotation: 0,
  curve: 0,
  letterSpacingPct: 2,

  // Default text: yellow -> red gradient
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

// Reference layout defaults:
// Name      -> centered at ~17% height
// Number    -> large centered number at ~43.3% height
// Size      -> small centered text at ~92% height
// Phone     -> disabled by default
//
// Supplied reference also contains "VOLLEY BALL" at ~69% height.
// This source file has no subtitle/static-text layer, so that text
// must be positioned in the component that renders it.
export const defaultStyle: DesignStyle = {
  name: {
    ...baseLayer,
    // Reference: SAKTHI is centered around 17% height.
    sizePct: 8,
    xPct: 50,
    yPct: 19,
  },

  number: {
    ...baseLayer,
    enabled: true,
    // Reference: 07 occupies the large center area.
    sizePct: 38,
    xPct: 50,
    yPct: 46,
  },

  size: {
    ...baseLayer,
    // Small size label near the bottom.
    sizePct: 1.5,
    xPct: 50,
    yPct: 99.5,
  },

  phone: {
    ...baseLayer,
    enabled: false,
    sizePct: 10,
    xPct: 50,
    yPct: 68,
    uppercase: false,
  },
};

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

export function layerText(
  key: LayerKey,
  row: PersonRow,
  l: LayerStyle,
): string {
  const raw =
    key === "name"
      ? row.name
      : key === "number"
        ? row.number
        : key === "size"
          ? sizeLabel(row.size)
          : row.phone;

  const text = (raw ?? "").trim();

  return l.uppercase
    ? text.toUpperCase()
    : text;
}

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

function paintChars(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
  total: number,
  curveDeg: number,
  stroke: boolean,
) {
  if (!text) return;

  /*
   * Flat text
   */
  if (Math.abs(curveDeg) < 0.5) {
    let x = -total / 2;

    for (const ch of text) {
      const cw = ctx.measureText(ch).width;

      if (stroke) {
        ctx.strokeText(ch, x, 0);
      }

      ctx.fillText(ch, x, 0);

      x += cw + tracking;
    }

    return;
  }

  /*
   * Curved text
   */
  const sweep =
    (Math.abs(curveDeg) * Math.PI) / 180;

  const safeSweep =
    Math.max(0.01, sweep);

  const radius =
    Math.max(
      total / safeSweep,
      1,
    );

  const up = curveDeg > 0;

  let angle = -safeSweep / 2;

  for (const ch of text) {
    const cw =
      ctx.measureText(ch).width;

    const step =
      (cw + tracking) / radius;

    ctx.save();

    if (up) {
      ctx.translate(0, radius);

      ctx.rotate(
        angle + step / 2,
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
        -(angle + step / 2),
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
  if (!l.enabled) return;

  /*
   * IMPORTANT:
   *
   * Font size is based on the ACTUAL OUTPUT ARTWORK WIDTH.
   *
   * Therefore:
   *
   * 12" shirt → smaller text
   * 22" shirt → normal text
   * 30" shirt → larger text
   *
   * This keeps the physical design proportional.
   */
  const fontPx =
    (l.sizePct / 100) *
    w *
    scale;

  const safeFontPx =
    Math.max(1, fontPx);

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

  /*
   * Text position is relative to the
   * selected physical artwork area.
   */
  ctx.translate(
    ox + (l.xPct / 100) * w,
    oy + (l.yPct / 100) * h,
  );

  const directionRotation =
    l.direction === "vertical-up"
      ? -90
      : l.direction === "vertical-down"
        ? 90
        : 0;

  const effectiveRotation =
    l.rotation + directionRotation;

  if (effectiveRotation) {
    ctx.rotate(
      (effectiveRotation * Math.PI) / 180,
    );
  }

  const sx = Math.max(
    0.1,
    Math.min(
      4,
      (l.widthPct ?? 100) / 100,
    ),
  );

  const sy = Math.max(
    0.1,
    Math.min(
      4,
      (l.heightPct ?? 100) / 100,
    ),
  );

  if (sx !== 1 || sy !== 1) {
    ctx.scale(sx, sy);
  }

  const strokeW =
    (l.outlineWidth / 100) *
    safeFontPx *
    2;

  ctx.lineWidth = strokeW;
  ctx.strokeStyle = l.outlineHex;

  const unit =
    safeFontPx / 100;

  /*
   * Extrude effect
   */
  if (l.effect === "extrude") {
    const depth = Math.max(
      1,
      Math.round(
        l.effectStrength * 3,
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
   * Emboss effect
   */
  if (l.effect === "emboss") {
    ctx.fillStyle =
      l.effectHex;

    ctx.save();

    ctx.translate(
      -l.effectStrength * unit,
      -l.effectStrength * unit,
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
  if (l.effect === "shadow") {
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
  if (l.effect === "glow") {
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
  if (l.fill === "gradient") {
    const angle =
      (l.gradAngle * Math.PI) /
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

/**
 * Renders the design into the EXACT requested
 * physical canvas dimensions.
 *
 * IMPORTANT CHANGE:
 *
 * Previous implementation used:
 *
 *   Math.min(...)
 *
 * which FIT the artwork inside the target canvas
 * and therefore created transparent margins.
 *
 * This implementation uses:
 *
 *   Math.max(...)
 *
 * and clips the artwork to the target canvas.
 *
 * Result:
 *
 * 12 × 17" → completely filled 12 × 17" canvas
 * 22 × 32" → completely filled 22 × 32" canvas
 * 30 × 32" → completely filled 30 × 32" canvas
 *
 * No transparent outer frame is created.
 */
function drawClipArt(
  ctx: CanvasRenderingContext2D,
  art: ClipArt,
  w: number,
  h: number,
) {
  if (!art?.src) return;

  const image = art.image;
  if (!image || !image.complete || image.naturalWidth <= 0) return;

  const cx = (art.xPct / 100) * w;
  const cy = (art.yPct / 100) * h;
  const targetW = Math.max(1, (art.widthPct / 100) * w);
  const targetH = Math.max(1, (art.heightPct / 100) * h);
  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return;

  // Preserve clip-art aspect ratio inside the requested box.
  const fit = Math.min(targetW / iw, targetH / ih);
  const dw = iw * fit;
  const dh = ih * fit;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, art.opacity / 100));
  ctx.translate(cx, cy);
  ctx.rotate((art.rotation * Math.PI) / 180);
  ctx.scale(art.flipX ? -1 : 1, art.flipY ? -1 : 1);

  if (art.shadow) {
    ctx.shadowColor = `rgba(0,0,0,${Math.max(0, Math.min(1, art.shadowOpacity / 100))})`;
    ctx.shadowBlur = Math.max(0, art.shadowBlur);
    ctx.shadowOffsetX = art.shadowBlur * 0.35;
    ctx.shadowOffsetY = art.shadowBlur * 0.35;
  }

  ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

export function renderShirt(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  row: PersonRow,
  style: DesignStyle,
  outputWidth: number,
  outputHeight?: number,
  textScale = 1,
  clipArts: ClipArt[] = [],
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

  const w = Math.max(
    1,
    Math.round(outputWidth),
  );

  /*
   * If explicit height is supplied,
   * ALWAYS use it.
   */
  const h = Math.max(
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
    canvas.getContext("2d", {
      alpha: true,
    });

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
   * ============================================================
   * SIZE-AWARE ARTWORK RESIZE — NO ZOOM / NO CROP
   * ============================================================
   *
   * The uploaded artwork is resized directly to the exact
   * selected output canvas dimensions.
   *
   * IMPORTANT:
   *   - Do NOT use Math.max() here.
   *   - Do NOT use COVER scaling.
   *   - Do NOT crop the source image.
   *   - The complete uploaded image is always drawn.
   *   - Each selected shirt size gets its own exact pixel size.
   *
   * This means changing 40 -> 44 -> 48 resizes the complete
   * artwork to the new canvas instead of zooming into it.
   * The image fills the complete output area, so there is no
   * transparent outer frame.
   */
  const drawX = 0;
  const drawY = 0;
  const drawW = w;
  const drawH = h;

  ctx.drawImage(
    img,
    0,
    0,
    sourceW,
    sourceH,
    drawX,
    drawY,
    drawW,
    drawH,
  );

  /*
   * ============================================================
   * CLIP ART
   * ============================================================
   * Clip art is drawn after the uploaded base artwork and before text.
   * This keeps it editable independently while allowing text to remain
   * on top of the clip art.
   */
  for (const art of clipArts) {
    drawClipArt(ctx, art, w, h);
  }

  /*
   * ============================================================
   * TEXT AREA
   * ============================================================
   *
   * Text is positioned against the FULL selected size.
   *
   * Example:
   *
   * (S)36 = 20 × 31"
   * (L)40 = 22 × 32"
   * (XXL)44 = 24 × 32"
   *
   * Therefore every size gets proportional text placement.
   */
  const ts =
    Math.max(
      0.2,
      Math.min(
        3,
        Number.isFinite(textScale)
          ? textScale
          : 1,
      ),
    );

  /*
   * Use the entire physical output area.
   *
   * This is intentional.
   *
   * Text must scale with the selected size,
   * not with the original uploaded image dimensions.
   */
  const artworkX = 0;
  const artworkY = 0;
  const artworkW = w;
  const artworkH = h;

  for (
    const key of LAYER_KEYS
  ) {
    const l = style[key];

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

/**
 * Returns exact pixel dimensions for
 * physical size + DPI.
 */
export function sheetPixels(
  spec: SizeSpec,
  dpi: number,
) {
  const d = Math.min(
    MAX_DPI,
    Math.max(
      BASE_DPI,
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

/**
 * Safe filename slug.
 */
export function slug(v: string) {
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
  let c = 0xffffffff;

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
 *
 * DPI is preserved as physical print resolution.
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
        BASE_DPI,
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
   * length  = 9
   * type    = pHYs
   * X ppm
   * Y ppm
   * unit    = 1 metre
   * CRC
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

  /*
   * Search PNG chunks.
   */
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

    if (type === "IHDR") {
      insertAt = next;
    }

    /*
     * Replace an existing pHYs.
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
