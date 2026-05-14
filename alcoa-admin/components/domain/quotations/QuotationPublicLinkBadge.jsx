"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows a copyable customer-facing share link for a quotation. Builds the URL
 * from the browser origin so no env var is needed in the admin UI. If the
 * quotation has no `publicToken` yet, offers a "Generate" button that POSTs to
 * `/api/quotations/:id/public-token`.
 */
export function QuotationPublicLinkBadge({ id, publicToken, detailQueryKey }) {
  const qc = useQueryClient();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const mintMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotations/${id}/public-token`, { method: "POST" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to generate link");
      return d.data;
    },
    onSuccess: () => {
      if (detailQueryKey) qc.invalidateQueries({ queryKey: detailQueryKey });
      toast.success("Public link ready");
    },
    onError: (e) => toast.error(e.message),
  });

  if (!publicToken) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => mintMut.mutate()}
        disabled={mintMut.isPending}
      >
        {mintMut.isPending ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Link2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        Generate share link
      </Button>
    );
  }

  const url = origin ? `${origin}/q/${publicToken}` : `/q/${publicToken}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="inline-flex items-stretch rounded-md border bg-muted/30 overflow-hidden text-xs">
      <span className="px-2.5 py-1.5 inline-flex items-center gap-1.5 text-muted-foreground border-r">
        <Link2 className="h-3.5 w-3.5" />
        Public link
      </span>
      <span
        className="px-2 py-1.5 font-mono text-[11px] text-foreground/80 max-w-[260px] truncate"
        title={url}
      >
        {url}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="px-2 py-1.5 border-l hover:bg-accent inline-flex items-center"
        title="Copy link"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1.5 border-l hover:bg-accent inline-flex items-center"
        title="Open in new tab"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
