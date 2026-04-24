"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, FileText, MessageSquare, TrendingUp,
  AlertCircle, CheckCircle, Clock, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

function StatCard({ title, value, description, icon: Icon, trend, color = "primary" }) {
  const colorMap = {
    primary: "text-primary",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    accent: "text-brand-accent",
  };

  return (
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
}

const statusBadgeMap = {
  new: { variant: "info", label: "New" },
  draft: { variant: "outline", label: "Draft" },
  sent: { variant: "warning", label: "Sent" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
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
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : (
          <>
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
          </>
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
              <Skeleton className="h-48 w-full" />
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
              <Skeleton className="h-48 w-full" />
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
                    <Clock className="h-4 w-4 text-amber-500" />
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
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
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
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
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
