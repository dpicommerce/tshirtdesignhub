import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  Download,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  Plus,
  Ruler,
  Shirt,
  Trash2,
  Type,
} from "lucide-react";
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
  TEXT_PRESETS,
  defaultStyle,
  findSize,
  renderShirt,
  sheetPixels,
  slug,
  type DesignStyle,
  type FontOption,
  type LayerKey,
  type LayerStyle,
  type PersonRow,
  type SizeSpec,
} from "@/lib/tshirt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PressName — Bulk T-Shirt Print Sheet Generator" },
      {
        name: "description",
        content:
          "Upload artwork and an Excel size chart, personalise names, numbers and phone lines, then export print-ready sheets at the exact inch size and DPI for every person.",
      },
      { property: "og:title", content: "PressName — Bulk T-Shirt Print Sheets" },
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

const starterRows: PersonRow[] = [
  { id: uid(), name: "Alex Carter", phone: "98765 43210", number: "10", size: "(L)40", qty: 1 },
  { id: uid(), name: "Priya Nair", phone: "", number: "7", size: "(M)38", qty: 1 },
  { id: uid(), name: "Jordan Blake", phone: "91234 56780", number: "", size: "(XL)42", qty: 2 },
];

function Index() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState<PersonRow[]>(starterRows);
  const [activeId, setActiveId] = useState<string>(starterRows[0]!.id);
  const [style, setStyle] = useState<DesignStyle>(defaultStyle);
  const [layer, setLayer] = useState<LayerKey>("name");
  const [chart, setChart] = useState<SizeSpec[]>(DEFAULT_SIZE_CHART);
  const [dpi, setDpi] = useState(BASE_DPI);
  const [textScale, setTextScale] = useState(100);
  const [fonts, setFonts] = useState<FontOption[]>(FONT_OPTIONS);

  const [bulk, setBulk] = useState("");
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

  // Live preview at base sheet proportions
  useEffect(() => {
    if (!img || !previewRef.current || !active) return;
    const spec = findSize(chart, active.size);
    const ratio = spec.h / spec.w;
    renderShirt(previewRef.current, img, active, style, 1000, Math.round(1000 * ratio), textScale / 100);
  }, [img, active, style, chart, textScale, fontsReady]);


  const update = (id: string, p: Partial<PersonRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const addRow = () => {
    const r: PersonRow = {
      id: uid(),
      name: "",
      phone: "",
      number: "",
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
          number: p[1] ?? "",
          phone: p[2] ?? "",
          size: p[3] || BASE_SIZE.size,
          qty: Number(p[4]) > 0 ? Number(p[4]) : 1,
        };
      });
    if (!parsed.length) {
      toast.error("Nothing to import — add lines like: Alex Carter, 10, 9876543210, (L)40, 1");
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
      if (res > 0) setDpi(Math.min(MAX_DPI, res));
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
        next.push({
          id: uid(),
          name,
          number: pick(r, ["number", "no", "jerseyno"]),
          phone: pick(r, ["phone", "phoneno", "mobile", "contact"]),
          size,
          qty: qty > 0 ? qty : 1,
        });
      }
      if (!next.length) {
        toast.error("No rows found — expected columns Name, Number, Phone, Size, Qty.");
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
        { Name: "Alex Carter", Number: 10, Phone: "9876543210", Size: "(L)40", Qty: 1 },
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
    renderShirt(c, img!, row, style, px.w, px.h, textScale / 100);
    return await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png", 1));
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
      download(await renderBlob(active), `${slug(active.name)}-${slug(active.size)}.png`);
    } finally {
      setBusy(false);
    }
  };

  const exportAll = async () => {
    if (!img) return;
    const valid = rows.filter((r) => r.name.trim() || r.number.trim());
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
          `${String(i + 1).padStart(2, "0")}-${slug(r.name || r.number)}-${spec.w}x${spec.h}in-${px.dpi}dpi${r.qty > 1 ? `-x${r.qty}` : ""}.png`,
          blob,
        );
      }
      const out = await zip.generateAsync({ type: "blob" });
      download(out, `tshirt-prints-${dpi}dpi.zip`);
      toast.success(`Exported ${valid.length} sheets at ${dpi} DPI`);
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
          <span
            className="flex size-10 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Shirt className="size-5" />
          </span>
          <div className="mr-auto">
            <h1 className="text-2xl leading-none tracking-wide sm:text-3xl">PRESSNAME</h1>
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
                min={72}
                max={MAX_DPI}
                value={dpi}
                onChange={(e) =>
                  setDpi(Math.min(MAX_DPI, Math.max(72, Number(e.target.value) || BASE_DPI)))
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
                  Columns: Name, Number, Phone, Size, Qty
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
              <table className="w-full min-w-[720px] border-separate border-spacing-y-1 text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-2 pb-1">#</th>
                    <th className="px-2 pb-1">Name on shirt</th>
                    <th className="px-2 pb-1">Number</th>
                    <th className="px-2 pb-1">Phone</th>
                    <th className="px-2 pb-1">Size</th>
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
                          value={r.number}
                          placeholder="10"
                          className="w-20"
                          onChange={(e) => update(r.id, { number: e.target.value })}
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
                placeholder={"Alex Carter, 10, 9876543210, (L)40, 1\nPriya Nair, 7, , (M)38, 2"}
              />
              <Button variant="secondary" onClick={importBulk} className="justify-self-start">
                Replace roster with list
              </Button>
            </div>
          </section>
        </div>

        {/* RIGHT: text design */}
        <aside className="panel h-fit p-4">
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

            <div className="rounded-md border border-border/70 bg-secondary/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <Label>All text size — {textScale}%</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => setTextScale((v) => Math.max(20, v - 5))}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7"
                    onClick={() => setTextScale((v) => Math.min(300, v + 5))}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              {num(textScale, setTextScale, 20, 300, 5)}
              <p className="mt-1 text-xs text-muted-foreground">
                Scales every line at once. Text keeps the same position on every shirt size.
              </p>
            </div>

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
