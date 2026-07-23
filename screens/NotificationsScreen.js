import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../api/notifications.api";

const NOTIFICATION_CONFIGS = {
  appointment_reminder: { name: "event", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
  message: { name: "chat-bubble-outline", color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  prescription_ready: { name: "healing", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
  lab_result: { name: "assignment", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  payment_due: { name: "payment", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  system_announcement: { name: "campaign", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
  health_alert: { name: "warning", color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
};

export function NotificationsScreen({ onBackHome }) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch notifications using TanStack
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  // Mark notification read
  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark as read");
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to mark all as read");
    },
  });

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete notification");
    },
  });

  const handleMarkAsRead = (id, isRead) => {
    if (isRead) return;
    markReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const isActionLoading = markReadMutation.isLoading || markAllReadMutation.isLoading || deleteMutation.isLoading;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
          width: "100%",
          height: "100%",
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 12, color: theme.textSecondary, fontWeight: "500" }}>
          Loading Notifications...
        </Text>
      </View>
    );
  }

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.is_read).length : 0;
  const hasNotifications = Array.isArray(notifications) && notifications.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderColor: theme.border }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onBackHome} className="p-1.5 rounded-full" style={{ backgroundColor: theme.surfaceSubtle }}>
            <MaterialIcons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={isActionLoading}
            className="px-3 py-1.5 rounded-xl border"
            style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          >
            <Text className="text-xs font-bold" style={{ color: theme.primary }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!hasNotifications || error ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="notifications-none" size={40} color={theme.primary} />
          </View>
          <Text className="text-lg font-bold text-center mb-2" style={{ color: theme.text }}>
            No notifications yet
          </Text>
          <Text className="text-sm text-center mb-8 max-w-[280px]" style={{ color: theme.textSecondary }}>
            We'll notify you when you get updates on prescriptions, chat messages, and appointments.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {notifications.map((item) => {
            const config = NOTIFICATION_CONFIGS[item.notification_type] || {
              name: "notifications",
              color: theme.primary,
              bg: "rgba(0,0,0,0.05)",
            };

            return (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleMarkAsRead(item._id, item.is_read)}
                disabled={isActionLoading}
                activeOpacity={0.8}
                className="flex-row p-4 rounded-2xl border mb-3 items-center justify-between"
                style={{
                  backgroundColor: item.is_read ? theme.surface : theme.surfaceSubtle,
                  borderColor: item.is_read ? theme.border : theme.primary,
                  borderLeftWidth: item.is_read ? 1 : 4,
                }}
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: config.bg }}
                  >
                    <MaterialIcons name={config.name} size={20} color={config.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-0.5">
                      <Text className="text-[14px] font-bold flex-1 pr-2" numberOfLines={1} style={{ color: theme.text }}>
                        {item.title}
                      </Text>
                      <Text className="text-[10px] font-semibold" style={{ color: theme.textMuted }}>
                        {formatTime(item.created_at)}
                      </Text>
                    </View>
                    <Text className="text-xs" numberOfLines={2} style={{ color: theme.textSecondary }}>
                      {item.content}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  disabled={isActionLoading}
                  className="p-1.5"
                >
                  <MaterialIcons name="close" size={16} color={theme.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
