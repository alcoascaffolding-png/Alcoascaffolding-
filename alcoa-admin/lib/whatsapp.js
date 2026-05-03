let twilioClient = null;
let twilioClientKey = "";

/** Trim, strip wrapping quotes, strip BOM — common .env / Vercel copy-paste mistakes. */
function normalizeEnvValue(value) {
  if (value == null) return "";
  let s = String(value).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (s.charCodeAt(0) === 0xfeff) {
    s = s.slice(1).trim();
  }
  return s;
}

function getTwilioCredentials() {
  const accountSid = normalizeEnvValue(process.env.TWILIO_ACCOUNT_SID);
  const authToken = normalizeEnvValue(process.env.TWILIO_AUTH_TOKEN);
  return { accountSid, authToken };
}

function getWhatsAppFrom() {
  const v = normalizeEnvValue(process.env.TWILIO_WHATSAPP_NUMBER);
  return v || "whatsapp:+14155238886";
}

function getClient() {
  const { accountSid, authToken } = getTwilioCredentials();

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  if (!accountSid.startsWith("AC")) {
    throw new Error(
      "TWILIO_ACCOUNT_SID must start with AC (copy the full Account SID from Twilio Console → Account Info)."
    );
  }

  const key = `${accountSid}:${authToken}`;
  if (!twilioClient || twilioClientKey !== key) {
    const twilio = require("twilio");
    twilioClient = twilio(accountSid, authToken);
    twilioClientKey = key;
  }
  return twilioClient;
}

/**
 * Send a WhatsApp message with an optional media URL
 * @param {string} to - Phone number including country code (e.g. "+971501234567")
 * @param {string} body - Message text
 * @param {string|null} mediaUrl - Public URL of media attachment (e.g. PDF)
 */
export async function sendWhatsAppMessage(to, body, mediaUrl = null) {
  const client = getClient();

  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const messageOptions = {
    from: getWhatsAppFrom(),
    to: toNumber,
    body,
  };

  if (mediaUrl) {
    // Twilio rejects localhost URLs
    if (mediaUrl.includes("localhost") || mediaUrl.includes("127.0.0.1")) {
      console.warn("[WhatsApp] Skipping localhost mediaUrl:", mediaUrl);
    } else {
      messageOptions.mediaUrl = [mediaUrl];
    }
  }

  const message = await client.messages.create(messageOptions);

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
  };
}
