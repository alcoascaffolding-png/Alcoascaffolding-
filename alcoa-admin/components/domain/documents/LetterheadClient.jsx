"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveBlobAsPdfDownload } from "@/lib/document-outbound-client";

async function requestLetterheadBlob({ body, pages, watermark }) {
  const res = await fetch("/api/letterhead/pdf", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, pages, watermark }),
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    if (contentType.includes("application/json")) {
      const d = await res.json().catch(() => ({}));
      message = typeof d.error === "string" ? d.error : d.error?.message || message;
    }
    throw new Error(message);
  }
  if (!contentType.includes("application/pdf")) {
    throw new Error("Server did not return a PDF. Try again or contact support.");
  }
  return res.blob();
}

export function LetterheadClient() {
  const [body, setBody] = useState("");
  const [pages, setPages] = useState("1");
  const [watermark, setWatermark] = useState(false);
  const [busy, setBusy] = useState("");

  const payload = { body, pages: Number(pages), watermark };

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await requestLetterheadBlob(payload);
      saveBlobAsPdfDownload(blob, "alcoa-letterhead");
      toast.success("Letterhead downloaded");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy("");
    }
  }

  async function handlePreview() {
    setBusy("preview");
    try {
      const blob = await requestLetterheadBlob(payload);
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) toast.info("Pop-up blocked — use Download instead.");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Body text (optional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Leave this blank for a completely empty letterhead you can print and type on. Anything
            you enter is placed between the header and footer, on the first page only.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            placeholder={"Date: 01 August 2026\n\nTo Whom It May Concern,\n\n..."}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Pages</Label>
            <Select value={pages} onValueChange={setPages}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "page" : "pages"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Extra pages are blank — useful for printing a stack of letterhead paper.
            </p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="letterhead-watermark">Faint logo watermark</Label>
              <p className="text-xs text-muted-foreground">
                Adds a very light centred logo behind the body.
              </p>
            </div>
            <Switch
              id="letterhead-watermark"
              checked={watermark}
              onCheckedChange={setWatermark}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleDownload} disabled={!!busy}>
              <Download className="h-4 w-4 mr-1" />
              {busy === "download" ? "Generating…" : "Download PDF"}
            </Button>
            <Button variant="outline" onClick={handlePreview} disabled={!!busy}>
              <Eye className="h-4 w-4 mr-1" />
              {busy === "preview" ? "Generating…" : "Preview"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
