"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPT = ".csv,.xlsx,.xls";

/**
 * Import CSV/Excel data with validation before persisting.
 *
 * @param {string} resource - API resource id, e.g. "products"
 * @param {string} [label] - Display name for dialog title
 * @param {() => void} [onSuccess] - Called after a successful import
 */
export function ImportButton({ resource, label, onSuccess }) {
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState(null);

  const title = label || resource.replace(/-/g, " ");

  function resetState() {
    setFile(null);
    setValidation(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) resetState();
  }

  async function downloadTemplate() {
    try {
      const res = await fetch(`/api/import/${resource}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to download template");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.download = match?.[1] || `${resource}-import-template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function submit(mode) {
    if (!file) {
      toast.error("Select a CSV or Excel file first.");
      return;
    }

    const isImport = mode === "import";
    if (isImport) setImporting(true);
    else setValidating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const res = await fetch(`/api/import/${resource}`, { method: "POST", body: formData });
      const data = await res.json();

      if (!data.success) {
        const payload = {
          success: false,
          message: data.error || "Validation failed",
          errors: data.details?.errors || [],
          mode: data.details?.mode || mode,
          rowCount: data.details?.rowCount,
        };
        setValidation(payload);
        toast.error(payload.message);
        return;
      }

      const payload = { ...data.data, success: true };

      if (isImport) {
        toast.success(payload.message || "Import complete");
        onSuccess?.();
        handleOpenChange(false);
      } else {
        setValidation(payload);
        toast.success(payload.message || "File validated");
      }
    } catch (e) {
      toast.error(e.message || "Import request failed");
    } finally {
      setValidating(false);
      setImporting(false);
    }
  }

  function onFileChange(e) {
    const picked = e.target.files?.[0];
    setFile(picked || null);
    setValidation(null);
  }

  const canImport = validation?.success && validation?.mode === "validate";
  const errors = validation?.errors || [];

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Import
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import {title}</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file. We validate every row against the expected columns and
              data types before saving anything.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4" />
                Download template
              </Button>
            </div>

            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50",
                file && "border-primary/50 bg-primary/5"
              )}
            >
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">
                {file ? file.name : "Click to choose .csv or .xlsx file"}
              </span>
              <span className="text-xs text-muted-foreground">Max 2,000 rows · 5 MB</span>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={onFileChange}
              />
            </label>

            {validation && (
              <div
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  validation.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                )}
              >
                <div className="flex items-start gap-2">
                  {validation.success ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{validation.message}</p>
                    {!validation.success && errors.length > 0 && (
                      <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-4 text-xs">
                        {errors.slice(0, 15).map((err, i) => (
                          <li key={i}>{err.message}</li>
                        ))}
                        {errors.length > 15 && (
                          <li>…and {errors.length - 15} more issue(s).</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!file || validating || importing}
              onClick={() => submit("validate")}
            >
              {validating ? <InlineSkeleton /> : "Validate"}
            </Button>
            <Button
              type="button"
              disabled={!canImport || importing || validating}
              onClick={() => submit("import")}
            >
              {importing ? <InlineSkeleton /> : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
