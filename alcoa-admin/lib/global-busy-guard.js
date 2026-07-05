/**
 * Process-wide in-flight keys — survives React remounts / duplicate hook instances.
 */
const globalBusyKeys = new Set();

export function isGloballyBusy(key) {
  return globalBusyKeys.has(String(key));
}

export function acquireGlobalBusy(key) {
  const k = String(key);
  if (globalBusyKeys.has(k)) return false;
  globalBusyKeys.add(k);
  return true;
}

export function releaseGlobalBusy(key) {
  globalBusyKeys.delete(String(key));
}
