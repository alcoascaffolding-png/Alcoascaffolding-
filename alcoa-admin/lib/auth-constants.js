/**
 * Auth values shared by the proxy, server components, and the browser.
 * Keep this free of secrets and runtime-specific imports — it is bundled for the client.
 */

/**
 * Set on /login when a server component rejected a cookie the proxy still considers
 * valid (deactivated user, changed password, wiped dev database). The login page clears
 * the cookie; until then the proxy must not redirect /login back to the dashboard.
 */
export const STALE_SESSION_PARAM = "stale";
