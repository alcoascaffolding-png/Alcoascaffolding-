import { NextResponse } from "next/server";

/**
 * Send a successful JSON response
 */
export function apiSuccess(data, status = 200, meta = {}) {
  return NextResponse.json({ success: true, data, ...meta }, { status });
}

/**
 * Send an error JSON response
 */
export function apiError(message, status = 500, details = null) {
  const body = { success: false, error: message };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

/**
 * Paginated list response
 */
export function apiList(items, total, page, limit) {
  return apiSuccess(
    { items, total, page, limit, pages: Math.ceil(total / limit) }
  );
}
