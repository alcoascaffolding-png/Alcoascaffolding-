import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import ContactMessage from "@/models/ContactMessage";
import PurchaseOrder from "@/models/PurchaseOrder";
import StockAdjustment from "@/models/StockAdjustment";
import { markOverdueSalesInvoices, markOverduePurchaseInvoices } from "@/lib/mark-overdue-invoices";
import { lowStockQuery, outOfStockQuery } from "@/lib/inventory-utils";

/**
 * Build computed in-app notifications from live database state.
 * These are ephemeral (not persisted) — refreshed on each request.
 */
export async function buildAdminNotifications() {
  await Promise.all([markOverdueSalesInvoices(), markOverduePurchaseInvoices()]);

  const [
    lowStockProducts,
    outOfStockProducts,
    pendingQuotations,
    overdueInvoices,
    unreadMessages,
    pendingPOs,
    recentOrders,
    recentAdjustments,
  ] = await Promise.all([
    Product.find(lowStockQuery())
      .select("name itemCode currentStock minStock")
      .sort({ currentStock: 1 })
      .limit(5)
      .lean(),
    Product.find(outOfStockQuery())
      .select("name itemCode currentStock")
      .sort({ name: 1 })
      .limit(5)
      .lean(),
    Quotation.countDocuments({ status: { $in: ["draft", "sent"] } }),
    SalesInvoice.countDocuments({ paymentStatus: "overdue" }),
    ContactMessage.countDocuments({ status: "new" }),
    PurchaseOrder.countDocuments({ status: { $in: ["draft", "sent", "confirmed"] } }),
    SalesOrder.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("salesOrderNumber customerName status createdAt")
      .lean(),
    StockAdjustment.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("adjustmentNumber productName adjustmentType quantity createdAt")
      .lean(),
  ]);

  const lowStockCount = await Product.countDocuments(lowStockQuery());

  const outOfStockCount = await Product.countDocuments(outOfStockQuery());

  const notifications = [];

  if (outOfStockCount > 0) {
    notifications.push({
      id: "inventory-out-of-stock",
      type: "danger",
      category: "inventory",
      title: `${outOfStockCount} product${outOfStockCount === 1 ? "" : "s"} out of stock`,
      description: outOfStockProducts.map((p) => p.name).join(", ") || "Review inventory levels",
      href: "/products?stock=out",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (lowStockCount > 0) {
    notifications.push({
      id: "inventory-low-stock",
      type: "warning",
      category: "inventory",
      title: `${lowStockCount} product${lowStockCount === 1 ? "" : "s"} running low`,
      description: lowStockProducts.map((p) => `${p.name} (${p.currentStock})`).join(", "),
      href: "/products?stock=low",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (overdueInvoices > 0) {
    notifications.push({
      id: "invoices-overdue",
      type: "danger",
      category: "accounts",
      title: `${overdueInvoices} overdue invoice${overdueInvoices === 1 ? "" : "s"}`,
      description: "Follow up on outstanding customer payments",
      href: "/sales-invoices",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (pendingQuotations > 0) {
    notifications.push({
      id: "quotations-pending",
      type: "info",
      category: "sales",
      title: `${pendingQuotations} pending quotation${pendingQuotations === 1 ? "" : "s"}`,
      description: "Draft or sent quotes awaiting action",
      href: "/quotations?status=pending",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (unreadMessages > 0) {
    notifications.push({
      id: "messages-unread",
      type: "info",
      category: "leads",
      title: `${unreadMessages} new contact message${unreadMessages === 1 ? "" : "s"}`,
      description: "Customer inquiries waiting for review",
      href: "/contact-messages",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  if (pendingPOs > 0) {
    notifications.push({
      id: "purchase-orders-pending",
      type: "warning",
      category: "purchases",
      title: `${pendingPOs} pending purchase order${pendingPOs === 1 ? "" : "s"}`,
      description: "Open vendor orders need attention",
      href: "/purchase-orders",
      createdAt: new Date().toISOString(),
      read: false,
    });
  }

  for (const order of recentOrders) {
    notifications.push({
      id: `sales-order-${order._id}`,
      type: "info",
      category: "sales",
      title: `Sales order ${order.salesOrderNumber}`,
      description: `${order.customerName || "Customer"} · ${order.status}`,
      href: `/sales-orders/${order._id}`,
      createdAt: order.createdAt,
      read: true,
    });
  }

  for (const adj of recentAdjustments) {
    notifications.push({
      id: `stock-adj-${adj._id}`,
      type: "info",
      category: "inventory",
      title: `Stock adjustment ${adj.adjustmentNumber}`,
      description: `${adj.productName} · ${adj.adjustmentType} ${adj.quantity}`,
      href: "/stock-adjustments",
      createdAt: adj.createdAt,
      read: true,
    });
  }

  // Sort: unread alerts first, then by date desc
  notifications.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return notifications;
}

/**
 * Dashboard inventory summary (extended widgets).
 */
export async function fetchInventoryDashboardSummary() {
  await connectDB();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [productStats, lowStockItems, recentProducts, recentAdjustments] = await Promise.all([
    Product.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$minStock", 0] },
                    { $lte: ["$currentStock", "$minStock"] },
                    { $gt: ["$currentStock", 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStock: { $sum: { $cond: [{ $lte: ["$currentStock", 0] }, 1, 0] } },
          inventoryValue: {
            $sum: { $multiply: [{ $ifNull: ["$currentStock", 0] }, { $ifNull: ["$purchasePrice", 0] }] },
          },
          rentalUnits: {
            $sum: {
              $cond: [{ $gt: [{ $ifNull: ["$rentalPrice", 0] }, 0] }, { $ifNull: ["$currentStock", 0] }, 0],
            },
          },
          recentlyAdded: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
        },
      },
    ]),
    Product.find({
      isActive: { $ne: false },
      $or: [
        { currentStock: { $lte: 0 } },
        { $expr: { $and: [{ $gt: ["$minStock", 0] }, { $lte: ["$currentStock", "$minStock"] }] } },
      ],
    })
      .select("name itemCode currentStock minStock unit")
      .sort({ currentStock: 1 })
      .limit(8)
      .lean(),
    Product.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select("name itemCode createdAt currentStock")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    StockAdjustment.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select("adjustmentNumber productName adjustmentType quantity createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const stats = productStats[0] || {
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
    rentalUnits: 0,
    recentlyAdded: 0,
  };

  const recentAdjustmentCount = await StockAdjustment.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return {
    stats: { ...stats, recentAdjustments: recentAdjustmentCount },
    lowStockItems,
    recentProducts,
    recentAdjustments,
  };
}
