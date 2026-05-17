import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendQuoteRequestEmail } from "@/lib/email/resend";
import ContactMessage from "@/models/ContactMessage";
import { z } from "zod";

const quoteSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7),
  company: z.string().optional(),
  projectType: z.string().optional(),
  projectHeight: z.string().optional(),
  coverageArea: z.string().optional(),
  duration: z.string().optional(),
  startDate: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export const POST = withErrorHandler(async (request) => {
  const ip = getClientIp(request);
  const body = await request.json();

  const identifier = `${ip}-${body.email || "unknown"}`;
  const { success: allowed } = await checkRateLimit(identifier, 10, "1 h");

  if (!allowed) {
    return apiError("Too many requests. Please try again later.", 429);
  }

  const result = quoteSchema.safeParse(body);
  if (!result.success) {
    return apiError("Validation failed", 400, result.error.issues.map((i) => i.message));
  }

  const data = result.data;

  await connectDB();

  const message = await ContactMessage.create({
    type: "quote",
    ...data,
    priority: "high",
    ipAddress: ip,
    userAgent: request.headers.get("user-agent") || "",
    emailSent: false,
  });

  try {
    await sendQuoteRequestEmail(data);
    await ContactMessage.findByIdAndUpdate(message._id, { emailSent: true, emailSentAt: new Date() });
  } catch (emailError) {
    console.error("[Email] Failed to send quote email:", emailError.message);
  }

  return apiSuccess({ messageId: message._id, message: "Quote request received. We will prepare your quotation shortly." });
});

export const OPTIONS = () => new Response(null, { status: 204 });
