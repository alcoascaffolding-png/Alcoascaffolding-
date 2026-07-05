/**
 * Run async work at most once per key at a time.
 * Lock is acquired synchronously (before any await) so double-clicks cannot race.
 */
const locks = new Set();
const flights = new Map();

export function singleFlight(key, fn) {
  const k = String(key);

  if (locks.has(k)) {
    const existing = flights.get(k);
    if (existing) return existing;
    locks.delete(k);
  }

  locks.add(k);

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      locks.delete(k);
      flights.delete(k);
    }
  })();

  flights.set(k, promise);
  return promise;
}

export function isSingleFlightActive(key) {
  return locks.has(String(key));
}
