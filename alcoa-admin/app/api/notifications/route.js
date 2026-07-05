import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { buildAdminNotifications } from "@/lib/notifications";
import {
  getUserNotificationState,
  applyNotificationState,
  dismissNotifications,
  markNotificationsRead,
} from "@/lib/notification-state";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const [notifications, state] = await Promise.all([
    buildAdminNotifications(),
    getUserNotificationState(session.user.id),
  ]);

  const filtered = applyNotificationState(notifications, state);
  const unreadCount = filtered.filter((n) => !n.read).length;

  return apiSuccess({ notifications: filtered, unreadCount });
});

export const PATCH = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();
  const { action, ids } = body;

  if (action === "dismiss") {
    await dismissNotifications(session.user.id, ids || []);
  } else if (action === "read") {
    await markNotificationsRead(session.user.id, ids || []);
  } else if (action === "dismiss_all") {
    const all = await buildAdminNotifications();
    await dismissNotifications(
      session.user.id,
      all.map((n) => n.id)
    );
  } else {
    return apiError("Invalid action", 400);
  }

  const [notifications, state] = await Promise.all([
    buildAdminNotifications(),
    getUserNotificationState(session.user.id),
  ]);
  const filtered = applyNotificationState(notifications, state);

  return apiSuccess({
    notifications: filtered,
    unreadCount: filtered.filter((n) => !n.read).length,
  });
});
