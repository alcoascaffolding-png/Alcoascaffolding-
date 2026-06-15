/**
 * Register Mongoose models used in `.populate()` across API routes.
 *
 * On Vercel each route is a separate serverless bundle — ref models must be
 * imported in that bundle or populate() throws MissingSchemaError:
 *   "Schema hasn't been registered for model \"Customer\""
 *
 * Import `{ Customer, ... }` from here (not only the parent model) in any
 * module that calls `.populate("customer")`.
 */
import Customer from "@/models/Customer";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import DeliveryNote from "@/models/DeliveryNote";

export { Customer, Quotation, SalesOrder, SalesInvoice, DeliveryNote };
