import UserNotificationState from "@/models/UserNotificationState";

export async function getUserNotificationState(userId) {
  let state = await UserNotificationState.findOne({ user: userId }).lean();
  if (!state) {
    state = { dismissedIds: [], readIds: [], lastSeenAt: null };
  }
  return state;
}

export async function dismissNotifications(userId, ids = []) {
  if (!ids.length) return getUserNotificationState(userId);
  const state = await UserNotificationState.findOneAndUpdate(
    { user: userId },
    {
      $addToSet: { dismissedIds: { $each: ids }, readIds: { $each: ids } },
      $set: { lastSeenAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean();
  return state;
}

export async function markNotificationsRead(userId, ids = []) {
  if (!ids.length) return getUserNotificationState(userId);
  const state = await UserNotificationState.findOneAndUpdate(
    { user: userId },
    {
      $addToSet: { readIds: { $each: ids } },
      $set: { lastSeenAt: new Date() },
    },
    { upsert: true, new: true }
  ).lean();
  return state;
}

export function applyNotificationState(notifications, state) {
  const dismissed = new Set(state?.dismissedIds || []);
  const readIds = new Set(state?.readIds || []);

  return notifications
    .filter((n) => !dismissed.has(n.id))
    .map((n) => ({
      ...n,
      read: n.read || readIds.has(n.id),
    }));
}
