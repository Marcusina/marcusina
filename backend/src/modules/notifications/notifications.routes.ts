import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  deleteNotification,
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.repository";

const router = Router();
// requireAuth applied per-route, not via router.use() - see the comment in
// appointments.routes.ts for why a blanket router.use(requireAuth) on a
// root-mounted router is a bug, not just a style choice.

router.get("/notifications/user", requireAuth, async (req, res, next) => {
  try {
    const notifications = await listMyNotifications(req.db!, req.user!.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

router.put("/notifications/:id/read", requireAuth, async (req, res, next) => {
  try {
    const notification = await markNotificationRead(req.db!, req.user!.id, req.params.id);
    if (!notification) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Notification not found" } });
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

router.put("/notifications/read-all", requireAuth, async (req, res, next) => {
  try {
    await markAllNotificationsRead(req.db!, req.user!.id);
    res.json({ data: { marked_all_read: true } });
  } catch (err) {
    next(err);
  }
});

router.delete("/notifications/:id/delete", requireAuth, async (req, res, next) => {
  try {
    const deleted = await deleteNotification(req.db!, req.user!.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Notification not found" } });
    res.json({ data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
