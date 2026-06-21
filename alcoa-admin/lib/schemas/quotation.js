import { z } from "zod";

const quotationItemSchema = z.object({
  product: z.string().optional(),
  equipmentType: z.string().min(1).optional(),
  equipmentCode: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  size: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
  cbm: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().optional(),
  rentalDuration: z
    .object({
      value: z.coerce.number().optional(),
      unit: z.enum(["day", "week", "month"]).optional(),
    })
    .optional(),
  ratePerUnit: z.coerce.number().min(0),
  taxableAmount: z.coerce.number().min(0).optional(),
  vatPercentage: z.coerce.number().min(0).max(100).optional(),
  vatAmount: z.coerce.number().min(0).optional(),
  subtotal: z.coerce.number().min(0).optional(),
  itemImage: z.string().optional(),
});

const deliveryAddressSchema = z
  .object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    area: z.string().optional(),
    city: z.string().optional(),
    emirate: z.string().optional(),
    landmark: z.string().optional(),
  })
  .optional();

const quotationStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "approved",
  "rejected",
  "expired",
  "converted",
]);

export const quotationCreateSchema = z
  .object({
    customer: z.union([z.string(), z.object({ _id: z.string() })]).optional(),
    customerName: z.string().min(1, "Customer name is required"),
    customerAddress: z.string().optional(),
    customerEmail: z.string().email().optional().or(z.literal("")),
    customerPhone: z.string().optional(),
    customerTRN: z.string().optional(),
    contactPersonName: z.string().optional(),
    contactPersonDesignation: z.string().optional(),
    contactPersonEmail: z.string().email().optional().or(z.literal("")),
    contactPersonPhone: z.string().optional(),
    quoteDate: z.union([z.string(), z.date()]).optional(),
    validUntil: z.union([z.string(), z.date()]).optional(),
    quoteType: z.enum(["rental", "sales", "service", "both"]).optional(),
    status: quotationStatusSchema.optional(),
    subject: z.string().optional(),
    salesExecutive: z.string().optional(),
    preparedBy: z.string().optional(),
    customerPONumber: z.string().optional(),
    referenceNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    projectDuration: z.string().optional(),
    items: z.array(quotationItemSchema).min(1, "At least one line item is required"),
    deliveryCharges: z.coerce.number().min(0).optional(),
    installationCharges: z.coerce.number().min(0).optional(),
    pickupCharges: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).optional(),
    discountType: z.enum(["percentage", "fixed"]).optional(),
    vatPercentage: z.coerce.number().min(0).max(100).optional(),
    currency: z.string().optional(),
    deliveryAddress: deliveryAddressSchema,
    deliveryDate: z.union([z.string(), z.date()]).optional(),
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
    termsAndConditions: z.string().optional(),
    quoteNumber: z.string().optional(),
  })
  .passthrough();

export const quotationPatchSchema = quotationCreateSchema
  .partial()
  .extend({
    customerName: z.string().min(1).optional(),
    items: z.array(quotationItemSchema).min(1).optional(),
  });