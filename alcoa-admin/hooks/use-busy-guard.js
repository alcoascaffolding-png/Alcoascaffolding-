"use client";

import { useRef, useState, useCallback } from "react";
import {
  acquireGlobalBusy,
  releaseGlobalBusy,
} from "@/lib/global-busy-guard";

/**
 * Synchronous in-flight guard — blocks duplicate clicks before React re-renders.
 * Uses a module-level set so parallel hook instances cannot double-fire APIs.
 */
export function useBusyGuard() {
  const inFlightRef = useRef(false);
  const [busyKey, setBusyKey] = useState(null);

  const run = useCallback(async (key, fn) => {
    const guardKey = String(key ?? "__default__");
    if (inFlightRef.current || !acquireGlobalBusy(guardKey)) return;

    inFlightRef.current = true;
    setBusyKey(key ?? true);
    try {
      return await fn();
    } finally {
      inFlightRef.current = false;
      releaseGlobalBusy(guardKey);
      setBusyKey(null);
    }
  }, []);

  const isBusy = useCallback(
    (key) => {
      if (!inFlightRef.current) return false;
      if (key == null) return true;
      return busyKey === key;
    },
    [busyKey]
  );

  return {
    run,
    isBusy,
    busyKey,
    isAnyBusy: busyKey != null,
  };
}

/** Wrap an async handler so only one invocation runs at a time. */
export function useGuardedCallback(fn) {
  const inFlightRef = useRef(false);

  return useCallback(
    async (...args) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        return await fn(...args);
      } finally {
        inFlightRef.current = false;
      }
    },
    [fn]
  );
}
