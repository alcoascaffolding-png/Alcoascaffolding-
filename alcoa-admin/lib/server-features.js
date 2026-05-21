/**
 * Feature flags evaluated on the server at request time.
 * Use this for API routes and for `/api/config/features` so Vercel works even when
 * `NEXT_PUBLIC_FEATURES` was missing at build (Next inlines NEXT_PUBLIC_* at compile time).
 */

import { isBlobReadWriteTokenConfigured } from "@/lib/storage/blob";

function isEnvTruthy(value) {
  if (value == null) return false;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/**
 * When true, send via Twilio WhatsApp API.
 * When false, upload PDF to Vercel Blob and return a wa.me prefilled link (no Twilio).
 * Unset or empty → true (keeps existing deployments on Twilio).
 */
export function isWhatsAppTwilioMode() {
  const raw = process.env.WHATSAPP_USE_TWILIO;
  if (raw === undefined || raw === null) return true;
  if (String(raw).trim() === "") return true;
  return isEnvTruthy(raw);
}

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

/** Code default when env WHATSAPP_UI_AND_API_ENABLED is unset */
const WHATSAPP_UI_AND_API_ENABLED_DEFAULT = true;

/**
 * Master switch for WhatsApp UI + APIs.
 * Set in .env / Vercel: WHATSAPP_UI_AND_API_ENABLED=true
 * Or change WHATSAPP_UI_AND_API_ENABLED_DEFAULT above.
 */
function isWhatsAppMasterSwitchOn() {
  const env = process.env.WHATSAPP_UI_AND_API_ENABLED;
  if (env !== undefined && env !== null && String(env).trim() !== "") {
    return isEnvTruthy(env);
  }
  return WHATSAPP_UI_AND_API_ENABLED_DEFAULT;
}

/**
 * True when WhatsApp send should be allowed (UI + API).
 * - Master: WHATSAPP_UI_AND_API_ENABLED (env or default above)
 * - Explicit: `whatsapp` in FEATURES, SERVER_FEATURES, or NEXT_PUBLIC_FEATURES; or
 * - Inferred: Twilio mode → Twilio + Blob; wa.me mode (WHATSAPP_USE_TWILIO=false) → Blob only.
 */
export function isWhatsAppFeatureAvailable() {
  if (!isWhatsAppMasterSwitchOn()) return false;

  if (combinedFeatureNames().has("whatsapp")) return true;
  if (isWhatsAppTwilioMode()) {
    return (
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      isBlobReadWriteTokenConfigured()
    );
  }
  return isBlobReadWriteTokenConfigured();
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
