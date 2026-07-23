// api/notifications.api.js
import apiClient from './apiClient';

/**
 * Get the current user's notifications.
 */
export const getNotifications = async () => {
  return await apiClient('/notifications/user', {
    method: 'GET',
  });
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationRead = async (notificationId) => {
  return await apiClient(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  return await apiClient('/notifications/read-all', {
    method: 'PUT',
  });
};

/**
 * Delete a specific notification.
 */
export const deleteNotification = async (notificationId) => {
  return await apiClient(`/notifications/${notificationId}/delete`, {
    method: 'DELETE',
  });
};
