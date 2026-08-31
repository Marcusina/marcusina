import type { PoolClient } from "pg";

export interface NotificationRow {
  id: string;
  notification_type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

// notifications has no RLS policy (it's not PHI, see 900_rls.sql) - unlike
// appointments' repository, this WHERE clause is load-bearing, not a
// defense-in-depth extra. Dropping it would leak every user's notifications.
export function listMyNotifications(db: PoolClient, userId: string) {
  return db
    .query<NotificationRow>("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [userId])
    .then((r) => r.rows);
}

// userId scoping here is likewise load-bearing, not defense-in-depth - the
// same as listMyNotifications.
export function markNotificationRead(db: PoolClient, userId: string, id: string) {
  return db
    .query<NotificationRow>(
      "UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markAllNotificationsRead(db: PoolClient, userId: string) {
  return db.query("UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL", [userId]);
}

export function deleteNotification(db: PoolClient, userId: string, id: string) {
  return db
    .query("DELETE FROM notifications WHERE id = $1 AND user_id = $2", [id, userId])
    .then((r) => (r.rowCount ?? 0) > 0);
}
