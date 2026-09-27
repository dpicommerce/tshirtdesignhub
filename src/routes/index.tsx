import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Grid3x3,
  ImagePlus,
  Loader2,
  Minus,
  Plus,

  Ruler,
  Trash2,
  Type,
} from "lucide-react";
import justhueLogoSrc from "@/assets/justhue-logo.jpeg";
const justhueLogo = { url: justhueLogoSrc };
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  BASE_DPI,
  BASE_SIZE,
  DEFAULT_SIZE_CHART,
  FONT_OPTIONS,
  LAYER_KEYS,
  LAYER_LABELS,
  MAX_DPI,
  MIN_DPI,
  HAND_OPTIONS,
  TEXT_PRESETS,
  defaultStyle,
  findSize,
  renderShirt,
  exportDesign,
  getLayerTextScale,
  setLayerTextScale,
  setLayerOrientation,
  sheetPixels,
  slug,
  type DesignStyle,
  type FontOption,
  type HandType,
  type LayerKey,
  type LayerStyle,
  type PersonRow,
  type SizeSpec,
} from "@/lib/tshirt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JustHue — Bulk T-Shirt Print Sheet Generator" },
      {
        name: "description",
        content:
          "Upload artwork and an Excel size chart, personalise names, games and phone lines, then export print-ready sheets at the exact inch size and DPI for every person.",
      },
      { property: "og:title", content: "JustHue — Bulk T-Shirt Print Sheets" },
      {
        property: "og:description",
        content:
          "Excel-driven t-shirt personalisation: exact inch sizes, up to 300 DPI, gradients, effects and custom fonts.",
      },
    ],
  }),
  component: Index,
});

const uid = () => Math.random().toString(36).slice(2, 9);

type ClipArtItem = {
  id: string;
  name: string;
  src: string;
  image: HTMLImageElement;
  xPct: number;
  yPct: number;
  sizePct: number;
  rotation: number;
  opacity: number;
  widthPct: number;
  heightPct: number;
  flipX: boolean;
  flipY: boolean;
  enabled: boolean;
};

const starterRows: PersonRow[] = [
  { id: uid(), name: "Alex Carter", phone: "98765 43210", game: "10", hand: "half", size: "(L)40", qty: 1 },
  { id: uid(), name: "Priya Nair", phone: "", game: "7", hand: "half", size: "(M)38", qty: 1 },
  { id: uid(), name: "Jordan Blake", phone: "91234 56780", game: "", hand: "full", size: "(XL)42", qty: 2 },
];

export function Index() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState<PersonRow[]>(starterRows);
  const [activeId, setActiveId] = useState<string>(starterRows[0]!.id);
  const [style, setStyle] = useState<DesignStyle>(() => ({
    ...defaultStyle,
    name: { ...defaultStyle.name, sizePct: 2, yPct: 98 },
    game: { ...defaultStyle.game, sizePct: 2, yPct: 98 },
    size: { ...defaultStyle.size, sizePct: 2, yPct: 98 },
    phone: { ...defaultStyle.phone, sizePct: 2, yPct: 98 },
  }));
  const [layer, setLayer] = useState<LayerKey>("name");
  const [chart, setChart] = useState<SizeSpec[]>(DEFAULT_SIZE_CHART);
  const [dpi, setDpi] = useState(BASE_DPI);
  const [showGrid, setShowGrid] = useState(true);
  const [fonts, setFonts] = useState<FontOption[]>(FONT_OPTIONS);
const [clipArts, setClipArts] = useState<ClipArtItem[]>([]);
const [activeClipArtId, setActiveClipArtId] = useState<string | null>(null);  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => rows.find((r) => r.id === activeId) ?? rows[0]!, [rows, activeId]);
  const L = style[layer];
  const patch = (p: Partial<LayerStyle>) =>
    setStyle((s) => ({ ...s, [layer]: { ...s[layer], ...p } }));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.all(
          FONT_OPTIONS.map((f) => document.fonts.load(`400 64px ${f.value}`, "ABCDEFGabcdefg0123")),
        );
        await document.fonts.ready;
      } catch {
        /* noop */
      }
      if (alive) setFontsReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const activeClipArt = useMemo(
    () => clipArts.find((c) => c.id === activeClipArtId) ?? clipArts[0] ?? null,
    [clipArts, activeClipArtId],
  );

  const updateClipArt = (id: string, patch: Partial<ClipArtItem>) =>
    setClipArts((items) => items.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const loadClipArt = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a PNG, JPG, WEBP or other image clip-art file.");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = () => reject(new Error("read failed"));
        fr.readAsDataURL(file);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      const item: ClipArtItem = {
        id: uid(), name: file.name.replace(/\\.[^.]+$/, "") || "Clip art", src: dataUrl,
        image, xPct: 50, yPct: 50, sizePct: 30, rotation: 0, opacity: 100,
        widthPct: 100, heightPct: 100, flipX: false, flipY: false, enabled: true,
      };
      setClipArts((items) => [...items, item]);
      setActiveClipArtId(item.id);
      toast.success(`Clip art "${item.name}" added`);
    } catch {
      toast.error("That clip-art image could not be loaded.");
    }
  }, []);

  const drawClipArts = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    for (const c of clipArts) {
      if (!c.enabled || c.opacity <= 0 || !c.image.complete) continue;
      const sw = c.image.naturalWidth || c.image.width;
      const sh = c.image.naturalHeight || c.image.height;
      if (!sw || !sh) continue;
      const targetW = Math.max(1, (c.sizePct / 100) * w);
      const targetH = Math.max(1, targetW * (sh / sw) * (c.heightPct / 100));
      const finalW = targetW * (c.widthPct / 100);
      const cx = (c.xPct / 100) * w;
      const cy = (c.yPct / 100) * h;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, c.opacity / 100));
      ctx.translate(cx, cy);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.scale(c.flipX ? -1 : 1, c.flipY ? -1 : 1);
      ctx.drawImage(c.image, -finalW / 2, -targetH / 2, finalW, targetH);
      ctx.restore();
    }
  };

  const loadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG or JPG).");
      return;
    }
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result));
        fr.onerror = () => rej(new Error("read failed"));
        fr.readAsDataURL(file);
      });
      const image = new Image();
      image.src = dataUrl;
      await image.decode();
      setImg(image);
      setImgSrc(dataUrl);
      toast.success(
        `Artwork loaded — ${image.naturalWidth}×${image.naturalHeight}px, treated as ${BASE_SIZE.w}×${BASE_SIZE.h}" at ${BASE_DPI} DPI`,
      );
    } catch {
      toast.error("That image could not be read.");
    }
  }, []);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const over = (e: DragEvent) => e.preventDefault();
    const drop = (e: DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f) void loadFile(f);
    };
    el.addEventListener("dragover", over);
    el.addEventListener("drop", drop);
    return () => {
      el.removeEventListener("dragover", over);
      el.removeEventListener("drop", drop);
    };
  }, [loadFile]);

  // Live preview at base sheet proportions, with optional inch grid overlay
  useEffect(() => {
    if (!img || !previewRef.current || !active) return;
    const spec = findSize(chart, active.size);
    const ratio = spec.h / spec.w;
    const canvas = previewRef.current;
    renderShirt(canvas, img, active, style, 1000, Math.round(1000 * ratio), 1);
    if (!showGrid) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const xStep = canvas.width / spec.w;
    const yStep = canvas.height / spec.h;
    ctx.save();
    for (let i = 0; i <= spec.w; i++) {
      const x = Math.round(i * xStep) + 0.5;
      ctx.strokeStyle = i % 5 === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= spec.h; j++) {
      const y = Math.round(j * yStep) + 0.5;
      ctx.strokeStyle = j % 5 === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // inch rulers: label every 5"
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `${Math.max(14, canvas.width * 0.014)}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let i = 5; i < spec.w; i += 5) ctx.fillText(`${i}"`, i * xStep + 4, 4);
    for (let j = 5; j < spec.h; j += 5) ctx.fillText(`${j}"`, 4, j * yStep + 4);
    ctx.restore();
  }, [img, active, style, chart, fontsReady, showGrid]);

  const stepRow = (dir: 1 | -1) => {
    const idx = rows.findIndex((r) => r.id === active?.id);
    const next = rows[(idx + dir + rows.length) % rows.length];
    if (next) setActiveId(next.id);
  };


  const update = (id: string, p: Partial<PersonRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const addRow = () => {
    const r: PersonRow = {
      id: uid(),
      name: "",
      phone: "",
      game: "",
      hand: "half",
      size: BASE_SIZE.size,
      qty: 1,
    };
    setRows((rs) => [...rs, r]);
    setActiveId(r.id);
  };

  const removeRow = (id: string) =>
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((r) => r.id !== id)));

  const importBulk = () => {
    const parsed = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const p = line.split(/[,\t;]+/).map((x) => x.trim());
        return {
          id: uid(),
          name: p[0] ?? "",
          game: p[1] ?? "",
          hand: (p[2]?.toLowerCase().includes("full") ? "full" : "half") as HandType,
          phone: p[3] ?? "",
          size: p[4] || BASE_SIZE.size,
          qty: Number(p[5]) > 0 ? Number(p[5]) : 1,
        };
      });
    if (!parsed.length) {
      toast.error("Nothing to import — add lines like: Alex Carter, 10, half, 9876543210, (L)40, 1");
      return;
    }
    setRows(parsed);
    setActiveId(parsed[0]!.id);
    setBulk("");
    toast.success(`Imported ${parsed.length} people`);
  };

  const readSheet = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]!]!;
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  };

  const pick = (r: Record<string, unknown>, keys: string[]) => {
    for (const k of Object.keys(r)) {
      const norm = k.toLowerCase().replace(/[^a-z]/g, "");
      if (keys.includes(norm)) return String(r[k] ?? "").trim();
    }
    return "";
  };

  const importChartFile = async (file: File) => {
    try {
      const data = await readSheet(file);
      const next: SizeSpec[] = [];
      let res = 0;
      for (const r of data) {
        const size = pick(r, ["size"]);
        const w = Number(pick(r, ["width", "widthin", "widthinches"]));
        const h = Number(pick(r, ["height", "heightin", "heightinches"]));
        const dp = Number(pick(r, ["resolution", "dpi", "res"]));
        if (!size || !(w > 0) || !(h > 0)) continue;
        next.push({ size, w, h });
        if (dp > 0) res = dp;
      }
      if (!next.length) {
        toast.error("Couldn't find Size / Width (in) / Height (in) columns in that file.");
        return;
      }
      setChart(next);
      if (res > 0) setDpi(Math.min(MAX_DPI, Math.max(MIN_DPI, res)));
      toast.success(`Size chart loaded — ${next.length} sizes`);
    } catch {
      toast.error("That spreadsheet could not be read.");
    }
  };

  const importRosterFile = async (file: File) => {
    try {
      const data = await readSheet(file);
      const next: PersonRow[] = [];
      for (const r of data) {
        const name = pick(r, ["name", "nameonshirt"]);
        const size = pick(r, ["size"]) || BASE_SIZE.size;
        if (!name && !size) continue;
        const qty = Number(pick(r, ["qty", "quantity", "pcs"]));
        const handRaw = pick(r, ["hand", "sleeve", "handtype"]).toLowerCase();
        const hand: HandType = handRaw.includes("full") ? "full" : "half";
        next.push({
          id: uid(),
          name,
          game: pick(r, ["game", "number", "no", "jerseyno"]),
          hand,
          phone: pick(r, ["phone", "phoneno", "mobile", "contact"]),
          size,
          qty: qty > 0 ? qty : 1,
        });
      }
      if (!next.length) {
        toast.error("No rows found — expected columns Name, Game, Hand, Phone, Size, Qty.");
        return;
      }
      setRows(next);
      setActiveId(next[0]!.id);
      toast.success(`Imported ${next.length} people from the spreadsheet`);
    } catch {
      toast.error("That spreadsheet could not be read.");
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        chart.map((s) => ({
          Size: s.size,
          "Width (in)": s.w,
          "Height (in)": s.h,
          INCHESS: "INCHESS",
          Resolution: dpi,
        })),
      ),
      "Size Chart",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Name: "Alex Carter", Game: 10, Hand: "Half Hand", Phone: "9876543210", Size: "(L)40", Qty: 1 },
      ]),
      "Names",
    );
    XLSX.writeFile(wb, "pressname-template.xlsx");
  };

  const loadFontFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const family = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF)$/, "");
      const ff = new FontFace(family, buf);
      await ff.load();
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff);
      const value = `"${family}"`;
      setFonts((f) => (f.some((x) => x.value === value) ? f : [...f, { label: family, value, custom: true }]));
      patch({ fontFamily: value });
      setFontsReady((v) => !v);
      toast.success(`Font "${family}" added`);
    } catch {
      toast.error("That font file could not be loaded.");
    }
  };

  const renderBlob = async (row: PersonRow): Promise<Blob> => {
    const spec = findSize(chart, row.size);
    const px = sheetPixels(spec, dpi);
    const c = document.createElement("canvas");
    renderShirt(c, img!, row, style, px.w, px.h, 1);
    // WebP keeps the exported files much smaller than PNG while
    // preserving the exact pixel dimensions selected by the DPI.
    return await exportDesign(c, px.dpi, 2);
  };


  const download = (blob: Blob, filename: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const exportOne = async () => {
    if (!img || !active) return;
    setBusy(true);
    try {
      download(await renderBlob(active), `${slug(active.name)}-${slug(active.size)}.webp`);
    } finally {
      setBusy(false);
    }
  };

  const exportAll = async () => {
    if (!img) return;
    const valid = rows.filter((r) => r.name.trim() || r.game.trim());
    if (!valid.length) {
      toast.error("Add at least one name first.");
      return;
    }
    setBusy(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < valid.length; i++) {
        const r = valid[i]!;
        const spec = findSize(chart, r.size);
        const px = sheetPixels(spec, dpi);
        const blob = await renderBlob(r);
        const folder = zip.folder(`${slug(r.size)}-${spec.w}x${spec.h}in`) ?? zip;
        folder.file(
          `${String(i + 1).padStart(2, "0")}-${slug(r.name || r.game)}-${spec.w}x${spec.h}in-${px.dpi}dpi${r.qty > 1 ? `-x${r.qty}` : ""}.webp`,
          blob,
        );
      }
      const out = await zip.generateAsync({ type: "blob" });
      download(out, `tshirt-prints-${sheetPixels(BASE_SIZE, dpi).dpi}dpi.zip`);
      toast.success(`Exported ${valid.length} sheets at ${sheetPixels(BASE_SIZE, dpi).dpi} DPI`);
    } finally {
      setBusy(false);
    }
  };

  const totalPieces = rows.reduce((a, r) => a + (r.name.trim() ? r.qty : 0), 0);
  const activeSpec = findSize(chart, active?.size ?? BASE_SIZE.size);
  const activePx = sheetPixels(activeSpec, dpi);

  const num = (v: number, set: (n: number) => void, min: number, max: number, step = 1) => (
    <Slider
      value={[v]}
      min={min}
      max={max}
      step={step}
      onValueChange={([n]) => set(n ?? v)}
      className="mt-2"
    />
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <Toaster position="top-center" />

      <header className="border-b border-border/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-5 sm:px-6">
          <img
            src={justhueLogo.url}
            alt="JustHue"
            className="size-16 rounded-md bg-card object-contain sm:size-20"
          />
          <div className="mr-auto">
            <h1 className="text-2xl leading-none tracking-wide sm:text-3xl">JUSTHUE</h1>
            <p className="text-xs text-muted-foreground">
              Base sheet {BASE_SIZE.w}×{BASE_SIZE.h}" at {BASE_DPI} DPI · resized per size chart
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-input bg-secondary px-3 py-1.5">
              <Label htmlFor="dpi" className="text-xs text-muted-foreground">
                DPI
              </Label>
              <Input
                id="dpi"
                type="number"
                min={MIN_DPI}
                max={MAX_DPI}
                value={dpi}
                onChange={(e) =>
                  setDpi(Math.min(MAX_DPI, Math.max(MIN_DPI, Number(e.target.value) || MIN_DPI)))
                }
                className="h-7 w-20"
              />
            </div>
            <Button onClick={exportAll} disabled={!img || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Export all
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT */}
        <div className="flex flex-col gap-5">
          <section className="panel p-4" ref={dropRef}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">
                Preview{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {activeSpec.w}×{activeSpec.h}" · {activePx.w}×{activePx.h}px @ {activePx.dpi} DPI
                </span>
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => stepRow(-1)}
                  disabled={!rows.length}
                  title="Previous person"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => stepRow(1)}
                  disabled={!rows.length}
                  title="Next person"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant={showGrid ? "default" : "secondary"}
                  onClick={() => setShowGrid((v) => !v)}
                  title="Toggle inch grid"
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void loadFile(f);
                    }}
                  />
                  <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-secondary px-3 text-sm font-medium hover:bg-muted">
                    <ImagePlus className="size-4" />
                    {imgSrc ? "Replace design" : "Upload design"}
                  </span>
                </label>
                <Button variant="secondary" onClick={exportOne} disabled={!img || busy}>
                  <Download className="size-4" />
                  This one
                </Button>
              </div>
            </div>

            {img ? (
              <canvas
                ref={previewRef}
                className="mx-auto max-h-[52vh] w-auto max-w-full rounded-md border border-border bg-secondary"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/80 bg-secondary/40 px-6 py-16 text-center">
                <ImagePlus className="size-8 text-primary" />
                <p className="font-medium">Drop your t-shirt design here</p>
                <p className="text-sm text-muted-foreground">
                  Artwork is treated as a {BASE_SIZE.w}×{BASE_SIZE.h}" sheet at {BASE_DPI} DPI and
                  rescaled to each size.
                </p>
              </div>
            )}
          </section>

          {/* Spreadsheet */}
          <section className="panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg">
                <FileSpreadsheet className="size-4 text-primary" /> Excel import
              </h2>
              <Button variant="secondary" onClick={downloadTemplate}>
                <Download className="size-4" /> Template
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-border/80 bg-secondary/40 p-3 text-sm hover:bg-secondary">
                <span className="font-medium">Upload size chart (.xlsx / .csv)</span>
                <span className="text-xs text-muted-foreground">
                  Columns: Size, Width (in), Height (in), Resolution
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importChartFile(f);
                  }}
                />
              </label>
              <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-border/80 bg-secondary/40 p-3 text-sm hover:bg-secondary">
                <span className="font-medium">Upload name list (.xlsx / .csv)</span>
                <span className="text-xs text-muted-foreground">
                  Columns: Name, Game, Hand, Phone, Size, Qty
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importRosterFile(f);
                  }}
                />
              </label>
            </div>
            <div className="mt-3 max-h-44 overflow-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-secondary text-left uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1">Size</th>
                    <th className="px-2 py-1">Width (in)</th>
                    <th className="px-2 py-1">Height (in)</th>
                    <th className="px-2 py-1">Pixels @ {dpi}</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.map((s) => {
                    const px = sheetPixels(s, dpi);
                    return (
                      <tr key={s.size} className="border-t border-border/60">
                        <td className="px-2 py-1 font-medium">{s.size}</td>
                        <td className="px-2 py-1">{s.w}</td>
                        <td className="px-2 py-1">{s.h}</td>
                        <td className="px-2 py-1 text-muted-foreground">
                          {px.w}×{px.h}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Roster */}
          <section className="panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">
                Roster{" "}
                <span className="align-middle text-sm font-normal text-muted-foreground">
                  {rows.length} rows · {totalPieces} pieces
                </span>
              </h2>
              <Button variant="secondary" onClick={addRow}>
                <Plus className="size-4" /> Add row
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-y-1 text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-2 pb-1">#</th>
                    <th className="px-2 pb-1">Name on shirt</th>
                    <th className="px-2 pb-1">Game</th>
                    <th className="px-2 pb-1">Phone</th>
                    <th className="px-2 pb-1">Size</th>
                    <th className="px-2 pb-1">Hand</th>
                    <th className="px-2 pb-1">Qty</th>
                    <th className="px-2 pb-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.id}
                      onClick={() => setActiveId(r.id)}
                      className={`cursor-pointer ${r.id === active?.id ? "bg-secondary" : "hover:bg-secondary/60"}`}
                    >
                      <td className="px-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1">
                        <Input
                          value={r.name}
                          placeholder="Name"
                          onChange={(e) => update(r.id, { name: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={r.game}
                          placeholder="10"
                          className="w-20"
                          onChange={(e) => update(r.id, { game: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={r.phone}
                          placeholder="Phone"
                          className="w-32"
                          onChange={(e) => update(r.id, { phone: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Select value={r.size} onValueChange={(v) => update(r.id, { size: v })}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {chart.map((s) => (
                              <SelectItem key={s.size} value={s.size}>
                                {s.size} — {s.w}×{s.h}"
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1">
                        <Select value={r.hand} onValueChange={(v) => update(r.id, { hand: v as HandType })}>
                          <SelectTrigger className="w-[125px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HAND_OPTIONS.map((h) => (
                              <SelectItem key={h.value} value={h.value}>
                                {h.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="number"
                          min={1}
                          value={r.qty}
                          className="w-16"
                          onChange={(e) =>
                            update(r.id, { qty: Math.max(1, Number(e.target.value) || 1) })
                          }
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRow(r.id);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-2">
              <Label htmlFor="bulk">Paste a list</Label>
              <Textarea
                id="bulk"
                rows={3}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={"Alex Carter, 10, half, 9876543210, (L)40, 1\nPriya Nair, 7, , (M)38, 2"}
              />
              <Button variant="secondary" onClick={importBulk} className="justify-self-start">
                Replace roster with list
              </Button>
            </div>
          </section>
        </div>

        {/* RIGHT: clip art + text design */}
        <aside className="panel h-fit p-4">
          <section className="mb-6 rounded-md border border-border/70 bg-secondary/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg">Clip arts</h2>
                <p className="text-xs text-muted-foreground">Upload multiple clip arts and adjust each one independently.</p>
              </div>
              <label>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  void Promise.all(files.map(loadClipArt));
                  e.currentTarget.value = "";
                }} />
                <span className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-secondary px-3 text-sm font-medium hover:bg-muted">
                  <ImagePlus className="size-4" /> Add clip art
                </span>
              </label>
            </div>
            {clipArts.length > 0 && (
              <div className="grid gap-2">
                {clipArts.map((c) => (
                  <button key={c.id} type="button" onClick={() => setActiveClipArtId(c.id)}
                    className={`flex items-center gap-2 rounded-md border p-2 text-left ${c.id === activeClipArtId ? "border-primary bg-secondary" : "border-border/60"}`}>
                    <img src={c.src} alt="" className="size-10 rounded object-contain bg-background" />
                    <span className="min-w-0 flex-1 truncate text-xs">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.enabled ? "On" : "Off"}</span>
                  </button>
                ))}
              </div>
            )}
            {activeClipArt && (
              <div className="mt-3 grid gap-3 border-t border-border/60 pt-3">
                <div className="flex items-center justify-between"><Label>Enable clip art</Label><Switch checked={activeClipArt.enabled} onCheckedChange={(v) => updateClipArt(activeClipArt.id, {enabled:v})} /></div>
                <div><Label>Size — {activeClipArt.sizePct.toFixed(0)}%</Label>{num(activeClipArt.sizePct, (n) => updateClipArt(activeClipArt.id,{sizePct:n}), 2, 100, 1)}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>X — {activeClipArt.xPct.toFixed(0)}%</Label>{num(activeClipArt.xPct, (n) => updateClipArt(activeClipArt.id,{xPct:n}), 0, 100, .5)}</div>
                  <div><Label>Y — {activeClipArt.yPct.toFixed(0)}%</Label>{num(activeClipArt.yPct, (n) => updateClipArt(activeClipArt.id,{yPct:n}), 0, 100, .5)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Width — {activeClipArt.widthPct.toFixed(0)}%</Label>{num(activeClipArt.widthPct, (n) => updateClipArt(activeClipArt.id,{widthPct:n}), 20, 300, 1)}</div>
                  <div><Label>Height — {activeClipArt.heightPct.toFixed(0)}%</Label>{num(activeClipArt.heightPct, (n) => updateClipArt(activeClipArt.id,{heightPct:n}), 20, 300, 1)}</div>
                </div>
                <div><Label>Rotation — {activeClipArt.rotation}°</Label>{num(activeClipArt.rotation, (n) => updateClipArt(activeClipArt.id,{rotation:n}), -180, 180, 1)}</div>
                <div><Label>Opacity — {activeClipArt.opacity}%</Label>{num(activeClipArt.opacity, (n) => updateClipArt(activeClipArt.id,{opacity:n}), 0, 100, 1)}</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant={activeClipArt.flipX ? "default" : "secondary"} onClick={() => updateClipArt(activeClipArt.id,{flipX:!activeClipArt.flipX})}>Flip X</Button>
                  <Button variant={activeClipArt.flipY ? "default" : "secondary"} onClick={() => updateClipArt(activeClipArt.id,{flipY:!activeClipArt.flipY})}>Flip Y</Button>
                </div>
                <Button variant="destructive" onClick={() => { setClipArts((items)=>items.filter((x)=>x.id!==activeClipArt.id)); setActiveClipArtId(null); }}>Remove clip art</Button>
              </div>
            )}
          </section>
          <h2 className="mb-3 flex items-center gap-2 text-lg">
            <Type className="size-4 text-primary" /> Text design
          </h2>
          <h2 className="mb-3 flex items-center gap-2 text-lg">
            <Type className="size-4 text-primary" /> Text design
          </h2>

          <Tabs value={layer} onValueChange={(v) => setLayer(v as LayerKey)}>
            <TabsList className="grid w-full grid-cols-4">
              {LAYER_KEYS.map((k) => (
                <TabsTrigger key={k} value={k}>
                  {LAYER_LABELS[k]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-4 grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Print this line</Label>
              <Switch
                id="enabled"
                checked={L.enabled}
                onCheckedChange={(v) => patch({ enabled: v })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Preset</Label>
              <Select onValueChange={(v) => patch(TEXT_PRESETS[Number(v)]!.patch)}>
                <SelectTrigger>
                  <SelectValue placeholder="Apply a look…" />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_PRESETS.map((p, i) => (
                    <SelectItem key={p.label} value={String(i)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Font</Label>
              <Select value={L.fontFamily} onValueChange={(v) => patch({ fontFamily: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {fonts.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void loadFontFile(f);
                  }}
                />
                <span className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-input bg-secondary px-3 text-xs font-medium hover:bg-muted">
                  <Plus className="size-3" /> Upload your own font
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="upper">Uppercase</Label>
              <Switch
                id="upper"
                checked={L.uppercase}
                onCheckedChange={(v) => patch({ uppercase: v })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <Label>Text size</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => patch({ sizePct: Math.max(1, +(L.sizePct - 0.5).toFixed(1)) })}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    step={0.5}
                    value={L.sizePct}
                    onChange={(e) =>
                      patch({
                        sizePct: Math.min(40, Math.max(1, Number(e.target.value) || L.sizePct)),
                      })
                    }
                    className="h-7 w-20"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => patch({ sizePct: Math.min(40, +(L.sizePct + 0.5).toFixed(1)) })}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              {num(L.sizePct, (n) => patch({ sizePct: n }), 1, 40, 0.5)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Label>Text width</Label>
                  <Input
                    type="number"
                    min={20}
                    max={300}
                    step={1}
                    value={L.widthPct}
                    onChange={(e) =>
                      patch({
                        widthPct: Math.min(300, Math.max(20, Number(e.target.value) || L.widthPct)),
                      })
                    }
                    className="h-7 w-20"
                  />
                </div>
                {num(L.widthPct, (n) => patch({ widthPct: n }), 20, 300, 1)}
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Label>Text height</Label>
                  <Input
                    type="number"
                    min={20}
                    max={300}
                    step={1}
                    value={L.heightPct}
                    onChange={(e) =>
                      patch({
                        heightPct: Math.min(
                          300,
                          Math.max(20, Number(e.target.value) || L.heightPct),
                        ),
                      })
                    }
                    className="h-7 w-20"
                  />
                </div>
                {num(L.heightPct, (n) => patch({ heightPct: n }), 20, 300, 1)}
              </div>
            </div>


            <div className="rounded-md border border-border/70 bg-secondary/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Selected {LAYER_LABELS[layer]} size</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      if (!active) return;
                      const current = getLayerTextScale(active, layer);
                      update(
                        active.id,
                        setLayerTextScale(active, layer, current - 0.05),
                      );
                    }}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Input
                    type="number"
                    min={20}
                    max={300}
                    step={5}
                    value={Math.round(getLayerTextScale(active, layer) * 100)}
                    onChange={(e) => {
                      if (!active) return;
                      const value = Math.min(
                        300,
                        Math.max(20, Number(e.target.value) || 100),
                      );
                      update(
                        active.id,
                        setLayerTextScale(active, layer, value / 100),
                      );
                    }}
                    className="h-7 w-20"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => {
                      if (!active) return;
                      const current = getLayerTextScale(active, layer);
                      update(
                        active.id,
                        setLayerTextScale(active, layer, current + 0.05),
                      );
                    }}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              {num(
                Math.round(getLayerTextScale(active, layer) * 100),
                (n) => {
                  if (!active) return;
                  update(
                    active.id,
                    setLayerTextScale(active, layer, n / 100),
                  );
                },
                20,
                300,
                5,
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Applies only to this person and the selected text line. Other
                people keep their own text size.
              </p>
            </div>

            {layer === "name" && (
              <div className="grid gap-2">
                <Label>Name orientation</Label>
                <Select
                  value={L.orientation}
                  onValueChange={(v) =>
                    setStyle((s) =>
                      setLayerOrientation(
                        s,
                        "name",
                        v as "horizontal" | "vertical",
                      ),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                    <SelectItem value="vertical">Vertical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Vertical stacks the name from top to bottom. It does not
                  change the orientation of other text lines.
                </p>
              </div>
            )}

            <div>
              <Label>Horizontal — {L.xPct.toFixed(0)}%</Label>
              {num(L.xPct, (n) => patch({ xPct: n }), 0, 100, 0.5)}
            </div>
            <div>
              <Label>Vertical (up / down) — {L.yPct.toFixed(0)}%</Label>
              {num(L.yPct, (n) => patch({ yPct: n }), 0, 100, 0.5)}
            </div>
            <div>
              <Label>Letter spacing — {L.letterSpacingPct.toFixed(1)}%</Label>
              {num(L.letterSpacingPct, (n) => patch({ letterSpacingPct: n }), -5, 30, 0.5)}
            </div>
            <div>
              <Label>Rotation — {L.rotation}°</Label>
              {num(L.rotation, (n) => patch({ rotation: n }), -45, 45)}
            </div>
            <div>
              <Label>Curve / arch — {L.curve}°</Label>
              {num(L.curve, (n) => patch({ curve: n }), -120, 120)}
            </div>
            <div>
              <Label>Opacity — {L.opacity}%</Label>
              {num(L.opacity, (n) => patch({ opacity: n }), 10, 100)}
            </div>

            <div className="grid gap-2">
              <Label>Fill</Label>
              <Select
                value={L.fill}
                onValueChange={(v) => patch({ fill: v as LayerStyle["fill"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid colour</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                </SelectContent>
              </Select>
              {L.fill === "solid" ? (
                <Input
                  type="color"
                  value={L.colorHex}
                  onChange={(e) => patch({ colorHex: e.target.value })}
                  className="h-9 w-full p-1"
                />
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={L.gradFrom}
                      onChange={(e) => patch({ gradFrom: e.target.value })}
                      className="h-9 w-full p-1"
                    />
                    <Input
                      type="color"
                      value={L.gradTo}
                      onChange={(e) => patch({ gradTo: e.target.value })}
                      className="h-9 w-full p-1"
                    />
                  </div>
                  <Label className="text-xs text-muted-foreground">
                    Gradient angle — {L.gradAngle}°
                  </Label>
                  {num(L.gradAngle, (n) => patch({ gradAngle: n }), 0, 360)}
                </>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Outline — {L.outlineWidth.toFixed(1)}</Label>
              <Input
                type="color"
                value={L.outlineHex}
                onChange={(e) => patch({ outlineHex: e.target.value })}
                className="h-9 w-full p-1"
              />
              {num(L.outlineWidth, (n) => patch({ outlineWidth: n }), 0, 10, 0.5)}
            </div>

            <div className="grid gap-2">
              <Label>Effect</Label>
              <Select
                value={L.effect}
                onValueChange={(v) => patch({ effect: v as LayerStyle["effect"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="shadow">Drop shadow</SelectItem>
                  <SelectItem value="glow">Neon glow</SelectItem>
                  <SelectItem value="extrude">3D extrude</SelectItem>
                  <SelectItem value="emboss">Emboss</SelectItem>
                </SelectContent>
              </Select>
              {L.effect !== "none" && (
                <>
                  <Input
                    type="color"
                    value={L.effectHex}
                    onChange={(e) => patch({ effectHex: e.target.value })}
                    className="h-9 w-full p-1"
                  />
                  <Label className="text-xs text-muted-foreground">
                    Strength — {L.effectStrength}
                  </Label>
                  {num(L.effectStrength, (n) => patch({ effectStrength: n }), 1, 20)}
                </>
              )}
            </div>

            <p className="flex items-start gap-2 rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">
              <Ruler className="mt-0.5 size-3.5 shrink-0" />
              Every sheet is exported at its own inch size from the chart, at {dpi} DPI (max{" "}
              {MAX_DPI}).
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
