import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { Download, ImagePlus, Loader2, Plus, Trash2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  FONT_OPTIONS,
  SIZES,
  defaultStyle,
  sizeLabel,
  renderShirt,
  slug,
  type NameStyle,
  type PersonRow,
} from "@/lib/tshirt";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PressName — Bulk T-Shirt Name & Size Print Generator" },
      {
        name: "description",
        content:
          "Upload a t-shirt design, paste your name and size list, pick a font, and export high-quality print-ready images for every person in one ZIP.",
      },
      { property: "og:title", content: "PressName — Bulk T-Shirt Name Printer" },
      {
        property: "og:description",
        content:
          "Personalise one t-shirt artwork with a whole roster of names and sizes, then export high-resolution images in bulk.",
      },
    ],
  }),
  component: Index,
});

const uid = () => Math.random().toString(36).slice(2, 9);

const starterRows: PersonRow[] = [
  { id: uid(), name: "Alex Carter", phone: "98765 43210", number: "10", size: "M", qty: 1 },
  { id: uid(), name: "Priya Nair", phone: "", number: "7", size: "S", qty: 1 },
  { id: uid(), name: "Jordan Blake", phone: "91234 56780", number: "", size: "XL", qty: 2 },
];

function Index() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [rows, setRows] = useState<PersonRow[]>(starterRows);
  const [activeId, setActiveId] = useState<string>(starterRows[0]!.id);
  const [style, setStyle] = useState<NameStyle>(defaultStyle);
  const [outWidth, setOutWidth] = useState(2500);
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => rows.find((r) => r.id === activeId) ?? rows[0]!,
    [rows, activeId],
  );

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        await Promise.all(
          FONT_OPTIONS.map((f) =>
            document.fonts.load(`400 64px ${f.value}`, "ABCDEFGabcdefg0123"),
          ),
        );
        await document.fonts.ready;
      } catch {
        /* noop */
      }
      if (alive) setFontsReady(true);
    };
    load();
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
      toast.success(`Artwork loaded — ${image.naturalWidth}x${image.naturalHeight}px`);
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

  // Live preview
  useEffect(() => {
    if (!img || !previewRef.current || !active) return;
    renderShirt(previewRef.current, img, active, style, 1000);
  }, [img, active, style, fontsReady]);

  const update = (id: string, patch: Partial<PersonRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () => {
    const r = { id: uid(), name: "", phone: "", number: "", size: "M", qty: 1 };
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
        const parts = line.split(/[,\t;]+/).map((p) => p.trim());
        return {
          id: uid(),
          name: parts[0] ?? "",
          number: parts[1] ?? "",
          phone: parts[2] ?? "",
          size: (parts[3] || "M").toUpperCase(),
          qty: Number(parts[4]) > 0 ? Number(parts[4]) : 1,
        };
      });
    if (!parsed.length) {
      toast.error("Nothing to import — add lines like: Alex Carter, 10, 9876543210, L, 1");
      return;
    }
    setRows(parsed);
    setActiveId(parsed[0]!.id);
    setBulk("");
    toast.success(`Imported ${parsed.length} people`);
  };

  const renderBlob = async (row: PersonRow): Promise<Blob> => {
    const c = document.createElement("canvas");
    renderShirt(c, img!, row, style, outWidth);
    return await new Promise<Blob>((res) =>
      c.toBlob((b) => res(b!), "image/png", 1),
    );
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
      download(await renderBlob(active), `${slug(active.name)}-${active.size}.png`);
    } finally {
      setBusy(false);
    }
  };

  const exportAll = async () => {
    if (!img) return;
    const valid = rows.filter((r) => r.name.trim());
    if (!valid.length) {
      toast.error("Add at least one name first.");
      return;
    }
    setBusy(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < valid.length; i++) {
        const r = valid[i]!;
        const blob = await renderBlob(r);
        const folder = zip.folder(r.size) ?? zip;
        folder.file(
          `${String(i + 1).padStart(2, "0")}-${slug(r.name)}-${r.size}${r.qty > 1 ? `-x${r.qty}` : ""}.png`,
          blob,
        );
      }
      const out = await zip.generateAsync({ type: "blob" });
      download(out, "tshirt-prints.zip");
      toast.success(`Exported ${valid.length} print files at ${outWidth}px wide`);
    } finally {
      setBusy(false);
    }
  };

  const totalPieces = rows.reduce((a, r) => a + (r.name.trim() ? r.qty : 0), 0);

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
              Bulk name + size personalisation for t-shirt artwork
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(outWidth)} onValueChange={(v) => setOutWidth(Number(v))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1500">1500px</SelectItem>
                <SelectItem value="2500">2500px HQ</SelectItem>
                <SelectItem value="4000">4000px Ultra</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAll} disabled={!img || busy}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Export all
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* LEFT: preview + table */}
        <div className="flex flex-col gap-5">
          <section className="panel p-4" ref={dropRef}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">Preview</h2>
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
                  PNG or JPG — the higher the resolution, the sharper the prints.
                </p>
              </div>
            )}
          </section>

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
              <table className="w-full min-w-[680px] border-separate border-spacing-y-1 text-sm">
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
                      className={`cursor-pointer ${r.id === active?.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
                    >
                      <td className="rounded-l-md px-2 py-1 text-muted-foreground">{i + 1}</td>
                      <td className="px-2 py-1">
                        <Input
                          value={r.name}
                          placeholder="Full name"
                          onChange={(e) => update(r.id, { name: e.target.value })}
                          className="h-9"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          type="number"
                          value={r.number}
                          placeholder="#"
                          onChange={(e) => update(r.id, { number: e.target.value })}
                          className="h-9 w-[70px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Input
                          value={r.phone}
                          placeholder="Phone"
                          onChange={(e) => update(r.id, { phone: e.target.value })}
                          className="h-9 w-[110px]"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <Select value={r.size} onValueChange={(v) => update(r.id, { size: v })}>
                          <SelectTrigger className="h-9 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {sizeLabel(s)}
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
                          onChange={(e) =>
                            update(r.id, { qty: Math.max(1, Number(e.target.value) || 1) })
                          }
                          className="h-9 w-[70px]"
                        />
                      </td>
                      <td className="rounded-r-md px-2 py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 text-muted-foreground hover:text-destructive"
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
              <Label htmlFor="bulk">Paste a list (Name, Size, Qty — one per line)</Label>
              <Textarea
                id="bulk"
                rows={3}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={"Alex Carter, L, 1\nPriya Nair, S, 2"}
              />
              <Button variant="secondary" className="justify-self-start" onClick={importBulk}>
                Replace table with list
              </Button>
            </div>
          </section>
        </div>

        {/* RIGHT: style controls */}
        <aside className="panel h-fit p-4 lg:sticky lg:top-6">
          <h2 className="mb-4 text-lg">Name styling</h2>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Font</Label>
              <Select
                value={style.fontFamily}
                onValueChange={(v) => setStyle({ ...style, fontFamily: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="fill">Text colour</Label>
                <Input
                  id="fill"
                  type="color"
                  value={style.colorHex}
                  onChange={(e) => setStyle({ ...style, colorHex: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="stroke">Outline colour</Label>
                <Input
                  id="stroke"
                  type="color"
                  value={style.outlineHex}
                  onChange={(e) => setStyle({ ...style, outlineHex: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
            </div>

            <SliderRow
              label="Text size"
              value={style.sizePct}
              min={2}
              max={25}
              step={0.5}
              suffix="%"
              onChange={(v) => setStyle({ ...style, sizePct: v })}
            />
            <SliderRow
              label="Horizontal position"
              value={style.xPct}
              min={0}
              max={100}
              step={0.5}
              suffix="%"
              onChange={(v) => setStyle({ ...style, xPct: v })}
            />
            <SliderRow
              label="Vertical position"
              value={style.yPct}
              min={0}
              max={100}
              step={0.5}
              suffix="%"
              onChange={(v) => setStyle({ ...style, yPct: v })}
            />
            <SliderRow
              label="Letter spacing"
              value={style.letterSpacingPct}
              min={-5}
              max={30}
              step={0.5}
              suffix="%"
              onChange={(v) => setStyle({ ...style, letterSpacingPct: v })}
            />
            <SliderRow
              label="Outline thickness"
              value={style.outlineWidth}
              min={0}
              max={8}
              step={0.25}
              suffix="%"
              onChange={(v) => setStyle({ ...style, outlineWidth: v })}
            />

            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
              <Label htmlFor="upper">Uppercase names</Label>
              <Switch
                id="upper"
                checked={style.uppercase}
                onCheckedChange={(v) => setStyle({ ...style, uppercase: v })}
              />
            </div>

            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
              <Label htmlFor="showsize">Print size under name</Label>
              <Switch
                id="showsize"
                checked={style.showSize}
                onCheckedChange={(v) => setStyle({ ...style, showSize: v })}
              />
            </div>

            {style.showSize && (
              <>
                <SliderRow
                  label="Size text scale"
                  value={style.sizeScale}
                  min={0.2}
                  max={1.2}
                  step={0.05}
                  suffix="×"
                  onChange={(v) => setStyle({ ...style, sizeScale: v })}
                />
                <SliderRow
                  label="Gap under name"
                  value={style.sizeGapPct}
                  min={0}
                  max={30}
                  step={1}
                  suffix="%"
                  onChange={(v) => setStyle({ ...style, sizeGapPct: v })}
                />
              </>
            )}

            <Button variant="ghost" onClick={() => setStyle(defaultStyle)}>
              Reset styling
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <Label>{label}</Label>
        <span className="tabular-nums text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v!)}
      />
    </div>
  );
}
