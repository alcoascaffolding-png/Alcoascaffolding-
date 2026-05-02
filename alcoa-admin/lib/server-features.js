/**
 * Feature flags evaluated on the server at request time.
 * Use this for API routes and for `/api/config/features` so Vercel works even when
 * `NEXT_PUBLIC_FEATURES` was missing at build (Next inlines NEXT_PUBLIC_* at compile time).
 */

function parseFeatureCsv(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function combinedFeatureNames() {
  const names = new Set([
    ...parseFeatureCsv(process.env.FEATURES),
    ...parseFeatureCsv(process.env.SERVER_FEATURES),
    ...parseFeatureCsv(process.env.NEXT_PUBLIC_FEATURES),
  ]);
  return names;
}

/**
 * True when WhatsApp send should be allowed (UI + API).
 * - Explicit: `whatsapp` in FEATURES, SERVER_FEATURES, or NEXT_PUBLIC_FEATURES; or
 * - Inferred: Twilio + Blob are configured (same requirements as send-whatsapp).
 */
export function isWhatsAppFeatureAvailable() {
  if (combinedFeatureNames().has("whatsapp")) return true;
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.BLOB_READ_WRITE_TOKEN
  );
}

export function isPdfEmailFeatureFlagSet() {
  return combinedFeatureNames().has("pdf-email");
}

export function getUiFeaturePayload() {
  return {
    whatsapp: isWhatsAppFeatureAvailable(),
    pdfEmail: isPdfEmailFeatureFlagSet(),
  };
}
