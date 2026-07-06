"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users, FileText, MessageSquare, TrendingUp,
  AlertCircle, CheckCircle, Clock, ArrowUpRight, Package, Warehouse, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { ActivityListItem } from "@/components/domain/dashboard/ActivityListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DashboardStatCardsSkeleton,
  DashboardChartSkeleton,
  DashboardActivityListSkeleton,
} from "@/components/loading/skeleton-kit";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
  confirmed: { variant: "success", label: "Confirmed" },
  completed: { variant: "success", label: "Completed" },
  invoiced: { variant: "success", label: "Invoiced" },
  cancelled: { variant: "destructive", label: "Cancelled" },
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
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground -mt-1">
        Welcome back! Here is your business overview.
      </p>

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
      <DashboardSection title="Overview">
        {statsLoading ? (
          <>
            <DashboardStatCardsSkeleton />
            <DashboardStatCardsSkeleton count={3} className="md:grid-cols-3 lg:grid-cols-3" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Customers"
                value={stats?.customers?.total ?? 0}
                description={`${stats?.customers?.active ?? 0} active`}
                icon={Users}
                color="accent"
              />
              <MetricCard
                title="Quotations"
                value={stats?.quotations?.total ?? 0}
                description={`${stats?.quotations?.pending ?? 0} pending`}
                icon={FileText}
                color="primary"
                href="/quotations?status=pending"
              />
              <MetricCard
                title="New Messages"
                value={stats?.messages?.unread ?? 0}
                description={`${stats?.messages?.total ?? 0} total inquiries`}
                icon={MessageSquare}
                color={stats?.messages?.unread > 0 ? "warning" : "success"}
                href="/contact-messages?status=new"
              />
              <MetricCard
                title="Monthly Revenue"
                value={formatCurrency(stats?.revenue?.monthly ?? 0)}
                description="Last 30 days"
                icon={TrendingUp}
                color="success"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Low Stock Products"
                value={stats?.products?.lowStock ?? 0}
                description={`${stats?.products?.outOfStock ?? 0} out of stock`}
                icon={Package}
                color={stats?.products?.lowStock > 0 ? "warning" : "success"}
                href="/products?stock=critical"
              />
              <MetricCard
                title="Overdue Invoices"
                value={stats?.invoices?.overdue ?? 0}
                description={`${stats?.invoices?.paid ?? 0} paid of ${stats?.invoices?.total ?? 0}`}
                icon={Clock}
                color={stats?.invoices?.overdue > 0 ? "danger" : "success"}
                href="/sales-invoices?paymentStatus=overdue"
              />
              <MetricCard
                title="Invoice Collection"
                value={formatCurrency(stats?.invoices?.collected ?? 0)}
                description={`of ${formatCurrency(stats?.invoices?.totalValue ?? 0)} total`}
                icon={CheckCircle}
                color="primary"
              />
            </div>
          </>
        )}
      </DashboardSection>

      {/* Inventory overview */}
      <DashboardSection
        title="Inventory"
        action={
          <>
            <Link href="/products" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Manage products <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link href="/purchase-orders?from=low-stock" className="text-xs text-primary hover:underline">
              Create PO from low stock
            </Link>
          </>
        }
      >
        {inventoryLoading ? (
          <DashboardStatCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Products"
              value={invStats?.total ?? 0}
              description={`${invStats?.recentlyAdded ?? 0} added this month`}
              icon={Package}
              href="/products"
            />
            <MetricCard
              title="Inventory Value"
              value={formatCurrency(invStats?.inventoryValue ?? 0)}
              description="Stock × purchase price"
              icon={Warehouse}
            />
            <MetricCard
              title="Rental Units"
              value={invStats?.rentalUnits ?? 0}
              description="Items with rental pricing"
              icon={TrendingUp}
            />
            <MetricCard
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
              <div className="space-y-1">
                {inventory.lowStockItems.map((p) => (
                  <Link
                    key={p._id}
                    href={`/products/${p._id}`}
                    className="flex items-center justify-between gap-2 py-1.5 px-2 -mx-2 rounded-lg border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.itemCode}</p>
                    </div>
                    <Badge variant={p.currentStock <= 0 ? "destructive" : "warning"}>
                      {p.currentStock <= 0 ? "Out" : `${p.currentStock} ${p.unit || "Nos"}`}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardSection>

      {/* Charts row */}
      <DashboardSection title="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Revenue Overview"
          description="Monthly revenue trend (last 6 months)"
          action={
            <Link href="/sales-invoices" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Invoices <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          {salesLoading ? (
            <DashboardChartSkeleton className="min-h-[200px]" />
          ) : (salesData || []).length === 0 ? (
            <EmptyState compact title="No revenue data yet" description="Invoices will appear here once recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={salesData || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/60" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={40} />
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
        </ChartCard>

        <ChartCard
          title="Invoice Status"
          description="Payment collection overview"
          action={
            <Link href="/sales-invoices" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          {statsLoading ? (
            <DashboardChartSkeleton className="min-h-[200px]" />
          ) : (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/sales-invoices?paymentStatus=paid" className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold tabular-nums">{stats?.invoices?.paid ?? 0}</p>
                  </div>
                </Link>
                <Link href="/sales-invoices?paymentStatus=overdue" className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                    <p className="text-lg font-bold tabular-nums">{stats?.invoices?.overdue ?? 0}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2 rounded-lg p-2">
                  <Clock className="h-4 w-4 text-chart-2 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Invoiced</p>
                    <p className="text-sm font-bold tabular-nums">{formatCurrency(stats?.invoices?.totalValue ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg p-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Collected</p>
                    <p className="text-sm font-bold tabular-nums">{formatCurrency(stats?.invoices?.collected ?? 0)}</p>
                  </div>
                </div>
              </div>
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-muted-foreground">Collection rate</p>
                  <p className="text-xs font-medium tabular-nums">
                    {stats?.invoices?.totalValue
                      ? Math.min(100, Math.round(((stats.invoices.collected || 0) / stats.invoices.totalValue) * 100))
                      : 0}%
                  </p>
                </div>
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
        </ChartCard>
      </div>
      </DashboardSection>

      {/* Recent activities */}
      <DashboardSection title="Recent Activity">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Inquiries</CardTitle>
              <CardDescription>Latest contact messages</CardDescription>
            </div>
            <Link href="/contact-messages" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <DashboardActivityListSkeleton />
            ) : (
              <div className="space-y-1">
                {(activities?.messages || []).slice(0, 5).map((msg) => (
                  <ActivityListItem
                    key={msg._id}
                    href={`/contact-messages?id=${msg._id}`}
                    title={msg.name}
                    subtitle={formatRelativeTime(msg.createdAt)}
                    trailing={<StatusBadge status={msg.status} />}
                  />
                ))}
                {!activities?.messages?.length && (
                  <EmptyState
                    compact
                    icon="default"
                    title="No messages yet"
                    description="New inquiries from your website will appear here."
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/contact-messages">View messages</Link>
                      </Button>
                    }
                  />
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
            <Link href="/quotations" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <DashboardActivityListSkeleton />
            ) : (
              <div className="space-y-1">
                {(activities?.quotations || []).slice(0, 5).map((q) => (
                  <ActivityListItem
                    key={q._id}
                    href={`/quotations/${q._id}`}
                    title={q.quoteNumber}
                    subtitle={`${q.customerName} · ${formatCurrency(q.totalAmount)}`}
                    trailing={<StatusBadge status={q.status} />}
                  />
                ))}
                {!activities?.quotations?.length && (
                  <EmptyState
                    compact
                    icon="documents"
                    title="No quotations yet"
                    description="Create your first quote to start tracking sales."
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/quotations/new">New quotation</Link>
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent sales orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Sales Orders</CardTitle>
              <CardDescription>Latest order activity</CardDescription>
            </div>
            <Link href="/sales-orders" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <DashboardActivityListSkeleton />
            ) : (
              <div className="space-y-1">
                {(activities?.orders || []).slice(0, 5).map((order) => (
                  <ActivityListItem
                    key={order._id}
                    href={`/sales-orders/${order._id}`}
                    title={order.orderNumber}
                    subtitle={`${order.customerName} · ${formatCurrency(order.total)}`}
                    trailing={<StatusBadge status={order.status} />}
                  />
                ))}
                {!activities?.orders?.length && (
                  <EmptyState
                    compact
                    icon="documents"
                    title="No sales orders yet"
                    description="Orders created from quotations will appear here."
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/sales-orders/new">New sales order</Link>
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </DashboardSection>
    </div>
  );
}
