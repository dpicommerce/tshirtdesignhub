import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const UPI_ID = "udhayaraj24-2@okaxis";
export const PRICE_PER_FILE = 1;

type Props = {
  open: boolean;
  files: number;
  userId: string | null;
  onClose: () => void;
  onPaid: () => void;
};

export function PayToExport({ open, files, userId, onClose, onPaid }: Props) {
  const amount = files * PRICE_PER_FILE;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=JustHue&am=${amount}&cu=INR&tn=${encodeURIComponent(`JustHue ${files} file(s)`)}`;
  const [qr, setQr] = useState("");
  const [utr, setUtr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUtr("");
    QRCode.toDataURL(upiLink, { width: 240, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [open, upiLink]);

  const submit = async () => {
    const clean = utr.replace(/\D/g, "");
    if (clean.length !== 12) {
      toast.error("UTR number must be 12 digits.");
      return;
    }
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("export_payments")
      .insert({ user_id: userId, utr: clean, amount, files });
    setSaving(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "This UTR number has already been used." : "Could not save the payment. Try again.",
      );
      return;
    }
    toast.success("Payment noted — downloading your files");
    onPaid();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pay ₹{amount} to download</DialogTitle>
          <DialogDescription>
            ₹{PRICE_PER_FILE} per design × {files} file{files === 1 ? "" : "s"}. Scan with any UPI app, then enter the
            12-digit UTR number.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {qr ? (
            <img src={qr} alt="UPI payment QR code" className="size-52 rounded-md bg-card" />
          ) : (
            <Loader2 className="size-6 animate-spin" />
          )}
          <p className="text-sm">
            UPI ID: <span className="font-mono font-semibold">{UPI_ID}</span>
          </p>
          <a href={upiLink} className="text-sm text-primary underline sm:hidden">
            Open UPI app
          </a>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="utr">UTR / reference number</Label>
          <Input
            id="utr"
            inputMode="numeric"
            maxLength={12}
            placeholder="12-digit UTR"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
          />
          <Button onClick={submit} disabled={saving || utr.length !== 12}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Submit & download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
