"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { STALE_SESSION_PARAM } from "@/lib/auth-constants";

/**
 * Deletes a session cookie that still decodes but no longer maps to a usable account.
 * Without this the cookie survives every reload and the user can never reach a login form.
 */
export function StaleSessionReset() {
  const searchParams = useSearchParams();
  const isStale = searchParams.has(STALE_SESSION_PARAM);
  const handled = useRef(false);

  useEffect(() => {
    if (!isStale || handled.current) return;
    handled.current = true;

    signOut({ redirect: false })
      .catch(() => {})
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete(STALE_SESSION_PARAM);
        window.history.replaceState(null, "", `${url.pathname}${url.search}`);
        toast.info("Your session is no longer valid. Please sign in again.");
      });
  }, [isStale]);

  return null;
}
