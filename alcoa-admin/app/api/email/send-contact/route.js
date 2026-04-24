import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactFormEmail } from "@/lib/email/resend";
import ContactMessage from "@/models/ContactMessage";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number required"),
  company: z.string().optional(),
  projectType: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export const POST = withErrorHandler(async (request) => {
  const ip = getClientIp(request);
  const body = await request.json();

  // Rate limit: 10 per hour per IP + email
  const identifier = `${ip}-${body.email || "unknown"}`;
  const { success: allowed, remaining } = await checkRateLimit(identifier, 10, "1 h");

  if (!allowed) {
    return apiError("Too many requests. Please try again later.", 429);
  }

  // Validate
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return apiError("Validation failed", 400, result.error.issues.map((i) => i.message));
  }

  const data = result.data;

  await connectDB();

  // Save to DB
  const message = await ContactMessage.create({
    type: "contact",
    ...data,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent") || "",
    emailSent: false,
  });

  // Send email
  try {
    await sendContactFormEmail(data);
    await ContactMessage.findByIdAndUpdate(message._id, { emailSent: true, emailSentAt: new Date() });
  } catch (emailError) {
    console.error("[Email] Failed to send contact email:", emailError.message);
    // Don't fail the request if email fails
  }

  return apiSuccess({ messageId: message._id, message: "Message received. We will get back to you shortly." });
});

export const OPTIONS = () => new Response(null, { status: 204 });
