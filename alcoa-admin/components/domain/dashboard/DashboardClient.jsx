"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users, FileText, MessageSquare, TrendingUp,
  AlertCircle, CheckCircle, Clock, ArrowUpRight, Package, Warehouse, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DashboardStatCardsSkeleton,
  DashboardChartSkeleton,
  DashboardActivityListSkeleton,
} from "@/components/loading/skeleton-kit";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

async function fetchDashboardStats() {
  const res = await fetch("/api/dashboard/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  const data = await res.json();
  return data.data;
}

async function fetchSalesOverview() {
  const res = await fetch("/api/dashboard/sales-overview?period=6months");
  if (!res.ok) throw new Error("Failed to fetch sales overview");
  const data = await res.json();
  return data.data;
}

async function fetchRecentActivities() {
  const res = await fetch("/api/dashboard/recent-activities");
  if (!res.ok) throw new Error("Failed to fetch activities");
  const data = await res.json();
  return data.data;
}

async function fetchInventorySummary() {
  const res = await fetch("/api/dashboard/inventory");
  if (!res.ok) throw new Error("Failed to fetch inventory summary");
  const data = await res.json();
  return data.data;
}

function StatCard({ title, value, description, icon: Icon, trend, color = "primary", href }) {
  const colorMap = {
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-chart-2 dark:text-orange-300",
    danger: "text-red-600 dark:text-red-400",
    accent: "text-brand-accent",
  };

  const inner = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorMap[color] || colorMap.primary}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

const statusBadgeMap = {
  new: { variant: "info", label: "New" },
  draft: { variant: "outline", label: "Draft" },
  sent: { variant: "warning", label: "Sent" },
  accepted: { variant: "success", label: "Accepted" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
  converted_to_sales_order: { variant: "success", label: "Converted to SO" },
  converted_to_invoice: { variant: "success", label: "Converted to Invoice" },
  converted: { variant: "success", label: "Converted" },
  in_progress: { variant: "warning", label: "In Progress" },
  delivered: { variant: "success", label: "Delivered" },
  read: { variant: "secondary", label: "Read" },
  responded: { variant: "success", label: "Responded" },
  closed: { variant: "secondary", label: "Closed" },
};

function StatusBadge({ status }) {
  const map = statusBadgeMap[status] || { variant: "secondary", label: status };
  return <Badge variant={map.variant}>{map.label}</Badge>;
}

export function DashboardClient() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats, refetchInterval: 5 * 60 * 1000 });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard-sales"],
    queryFn: fetchSalesOverview,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: fetchRecentActivities,
    refetchInterval: 2 * 60 * 1000,
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["dashboard-inventory"],
    queryFn: fetchInventorySummary,
    refetchInterval: 5 * 60 * 1000,
  });

  const invStats = inventory?.stats;
  const hasStockAlert = (stats?.products?.lowStock ?? 0) > 0 || (stats?.products?.outOfStock ?? 0) > 0;

  if (statsError) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load dashboard data. Please refresh the page.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasStockAlert && !statsLoading && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-900 dark:text-amber-100">Inventory attention needed</p>
            <p className="text-amber-800/90 dark:text-amber-200/80 text-xs mt-0.5">
              {(stats?.products?.lowStock ?? 0) > 0 && (
                <span>{stats.products.lowStock} product{stats.products.lowStock === 1 ? "" : "s"} running low. </span>
              )}
              {(stats?.products?.outOfStock ?? 0) > 0 && (
                <span>{stats.products.outOfStock} product{stats.products.outOfStock === 1 ? "" : "s"} out of stock.</span>
              )}
            </p>
          </div>
          <Link href="/products?stock=critical" className="text-xs font-medium text-amber-900 dark:text-amber-100 hover:underline shrink-0">
            Review
          </Link>
        </div>
      )}

      {/* Stat cards */}
      {statsLoading ? (
        <>
          <DashboardStatCardsSkeleton />
          <DashboardStatCardsSkeleton count={3} className="md:grid-cols-3 lg:grid-cols-3" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={stats?.customers?.total ?? 0}
            description={`${stats?.customers?.active ?? 0} active`}
            icon={Users}
            color="accent"
          />
          <StatCard
            title="Quotations"
            value={stats?.quotations?.total ?? 0}
            description={`${stats?.quotations?.pending ?? 0} pending`}
            icon={FileText}
            color="primary"
            href="/quotations?status=pending"
          />
          <StatCard
            title="New Messages"
            value={stats?.messages?.unread ?? 0}
            description={`${stats?.messages?.total ?? 0} total inquiries`}
            icon={MessageSquare}
            color={stats?.messages?.unread > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats?.revenue?.monthly ?? 0)}
            description="Last 30 days"
            icon={TrendingUp}
            color="success"
          />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Low Stock Products"
            value={stats?.products?.lowStock ?? 0}
            description={`${stats?.products?.outOfStock ?? 0} out of stock`}
            icon={Package}
            color={stats?.products?.lowStock > 0 ? "warning" : "success"}
            href="/products?stock=critical"
          />
          <StatCard
            title="Overdue Invoices"
            value={stats?.invoices?.overdue ?? 0}
            description={`${stats?.invoices?.paid ?? 0} paid of ${stats?.invoices?.total ?? 0}`}
            icon={Clock}
            color={stats?.invoices?.overdue > 0 ? "danger" : "success"}
          />
          <StatCard
            title="Invoice Collection"
            value={formatCurrency(stats?.invoices?.collected ?? 0)}
            description={`of ${formatCurrency(stats?.invoices?.totalValue ?? 0)} total`}
            icon={CheckCircle}
            color="primary"
          />
          </div>
        </>
      )}

      {/* Inventory overview */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Inventory Overview</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Manage products <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link href="/purchase-orders?from=low-stock" className="text-xs text-primary hover:underline">
              Create PO from low stock
            </Link>
          </div>
        </div>
        {inventoryLoading ? (
          <DashboardStatCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={invStats?.total ?? 0}
              description={`${invStats?.recentlyAdded ?? 0} added this month`}
              icon={Package}
              href="/products"
            />
            <StatCard
              title="Inventory Value"
              value={formatCurrency(invStats?.inventoryValue ?? 0)}
              description="Stock × purchase price"
              icon={Warehouse}
            />
            <StatCard
              title="Rental Units"
              value={invStats?.rentalUnits ?? 0}
              description="Items with rental pricing"
              icon={TrendingUp}
            />
            <StatCard
              title="Recent Adjustments"
              value={invStats?.recentAdjustments ?? 0}
              description="Last 30 days"
              icon={Clock}
              href="/stock-adjustments"
            />
          </div>
        )}

        {!inventoryLoading && (inventory?.lowStockItems?.length > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Low & Out-of-Stock Items</CardTitle>
                <CardDescription>Products that need replenishment</CardDescription>
              </div>
              <Link href="/products?stock=critical" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventory.lowStockItems.map((p) => (
                  <div key={p._id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.itemCode}</p>
                    </div>
                    <Badge variant={p.currentStock <= 0 ? "destructive" : "warning"}>
                      {p.currentStock <= 0 ? "Out" : `${p.currentStock} ${p.unit || "Nos"}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales overview chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trend (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <DashboardChartSkeleton className="min-h-[200px]" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={salesData || []}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v), "Revenue"]}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Invoice status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Status</CardTitle>
            <CardDescription>Payment collection overview</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <DashboardChartSkeleton className="min-h-[200px]" />
            ) : (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="text-lg font-bold">{stats?.invoices?.paid ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Overdue</p>
                      <p className="text-lg font-bold">{stats?.invoices?.overdue ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-chart-2" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Invoiced</p>
                      <p className="text-sm font-bold">{formatCurrency(stats?.invoices?.totalValue ?? 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Collected</p>
                      <p className="text-sm font-bold">{formatCurrency(stats?.invoices?.collected ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1">Collection rate</p>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${stats?.invoices?.totalValue
                          ? Math.min(100, ((stats.invoices.collected || 0) / stats.invoices.totalValue) * 100)
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Inquiries</CardTitle>
              <CardDescription>Latest contact messages</CardDescription>
            </div>
            <a href="/contact-messages" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <DashboardActivityListSkeleton />
            ) : (
              <div className="space-y-3">
                {(activities?.messages || []).slice(0, 5).map((msg) => (
                  <div key={msg._id} className="flex items-center justify-between gap-2 py-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{msg.name}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(msg.createdAt)}</p>
                    </div>
                    <StatusBadge status={msg.status} />
                  </div>
                ))}
                {!activities?.messages?.length && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No messages yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Quotations</CardTitle>
              <CardDescription>Latest quote activity</CardDescription>
            </div>
            <a href="/quotations" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <DashboardActivityListSkeleton />
            ) : (
              <div className="space-y-3">
                {(activities?.quotations || []).slice(0, 5).map((q) => (
                  <div key={q._id} className="flex items-center justify-between gap-2 py-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{q.quoteNumber}</p>
                      <p className="text-xs text-muted-foreground">{q.customerName} · {formatCurrency(q.totalAmount)}</p>
                    </div>
                    <StatusBadge status={q.status} />
                  </div>
                ))}
                {!activities?.quotations?.length && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No quotations yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
