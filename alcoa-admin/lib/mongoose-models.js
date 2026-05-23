/**
 * Register Mongoose models used in `.populate()` across API routes.
 *
 * On Vercel each route is a separate serverless bundle — ref models must be
 * imported in that bundle or populate() throws MissingSchemaError.
 */
import Customer from "@/models/Customer";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";

export { Customer, Quotation, SalesOrder, SalesInvoice };
