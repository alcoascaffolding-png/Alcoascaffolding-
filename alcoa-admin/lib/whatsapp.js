let twilioClient = null;

function getClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not configured");
    }

    const twilio = require("twilio");
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

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
    from: WHATSAPP_FROM,
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
