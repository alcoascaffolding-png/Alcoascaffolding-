"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Generic CRUD hook factory using TanStack Query.
 *
 * Usage:
 *   const { useList, useDetail, useStats, useCreate, useUpdate, useRemove } = createResourceHooks("customers");
 *
 * Each resource expects the following API shape:
 *   GET  /api/{resource}                    → { success, data: { items, total, page, limit, pages } }
 *   GET  /api/{resource}/stats              → { success, data: { ... } }
 *   GET  /api/{resource}/:id               → { success, data: { ... } }
 *   POST /api/{resource}                    → { success, data: { ... } }
 *   PATCH /api/{resource}/:id              → { success, data: { ... } }
 *   DELETE /api/{resource}/:id             → { success }
 */

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export function createResourceHooks(resource) {
  const baseKey = [resource];

  function useList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/${resource}${queryString ? `?${queryString}` : ""}`;

    return useQuery({
      queryKey: [...baseKey, "list", params],
      queryFn: () => apiFetch(url).then((d) => d.data),
    });
  }

  function useStats() {
    return useQuery({
      queryKey: [...baseKey, "stats"],
      queryFn: () => apiFetch(`/api/${resource}/stats`).then((d) => d.data),
    });
  }

  function useDetail(id, options = {}) {
    return useQuery({
      queryKey: [...baseKey, "detail", id],
      queryFn: () => apiFetch(`/api/${resource}/${id}`).then((d) => d.data),
      enabled: !!id && options.enabled !== false,
      ...options,
    });
  }

  function useCreate(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (body) => apiFetch(`/api/${resource}`, { method: "POST", body }),
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: baseKey });
        toast.success(options.successMessage || "Created successfully");
        options.onSuccess?.(data);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create");
        options.onError?.(err);
      },
    });
  }

  function useUpdate(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...body }) => apiFetch(`/api/${resource}/${id}`, { method: "PATCH", body }),
      onSuccess: (data, variables) => {
        qc.invalidateQueries({ queryKey: baseKey });
        qc.invalidateQueries({ queryKey: [...baseKey, "detail", variables.id] });
        toast.success(options.successMessage || "Updated successfully");
        options.onSuccess?.(data);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update");
        options.onError?.(err);
      },
    });
  }

  function useRemove(options = {}) {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => apiFetch(`/api/${resource}/${id}`, { method: "DELETE" }),
      onSuccess: (data, id) => {
        qc.invalidateQueries({ queryKey: baseKey });
        qc.removeQueries({ queryKey: [...baseKey, "detail", id] });
        toast.success(options.successMessage || "Deleted successfully");
        options.onSuccess?.(data);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete");
        options.onError?.(err);
      },
    });
  }

  function useCheckNew(lastCheck, options = {}) {
    return useQuery({
      queryKey: [...baseKey, "check-new", lastCheck],
      queryFn: () => apiFetch(`/api/${resource}/check-new?lastCheck=${lastCheck}`).then((d) => d.data),
      refetchInterval: options.interval || 30 * 1000, // default 30s polling
      enabled: options.enabled !== false,
    });
  }

  return { useList, useStats, useDetail, useCreate, useUpdate, useRemove, useCheckNew };
}

// Pre-built hooks for each resource
export const useCustomers = createResourceHooks("customers");
export const useQuotations = createResourceHooks("quotations");
export const useContactMessages = createResourceHooks("contact-messages");
export const useSalesOrders = createResourceHooks("sales-orders");
export const useSalesInvoices = createResourceHooks("sales-invoices");
export const useVendors = createResourceHooks("vendors");
export const usePurchaseOrders = createResourceHooks("purchase-orders");
export const usePurchaseInvoices = createResourceHooks("purchase-invoices");
export const useProducts = createResourceHooks("products");
export const useStockAdjustments = createResourceHooks("stock-adjustments");
export const useBankAccounts = createResourceHooks("bank-accounts");
export const useReceipts = createResourceHooks("receipts");
export const usePayments = createResourceHooks("payments");
