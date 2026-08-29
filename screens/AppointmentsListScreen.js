import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { getAppointments } from "../api/appointments.api";

export const STATUS_COLORS = {
  scheduled: "#3B82F6",
  confirmed: "#10B981",
  in_progress: "#F59E0B",
  completed: "#6B7280",
  cancelled: "#EF4444",
  no_show: "#EF4444",
};

export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const JOINABLE_STATUSES = ["scheduled", "confirmed", "in_progress"];

export function AppointmentsListScreen({ onBack, navigation }) {
  const { theme } = useTheme();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  const hasAppointments = Array.isArray(appointments) && appointments.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="flex-row items-center px-4 py-4 border-b gap-3"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="p-1.5 rounded-full"
          style={{ backgroundColor: theme.surfaceSubtle }}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1" style={{ color: theme.text }}>
          Appointments
        </Text>
        {navigation ? (
          <TouchableOpacity
            onPress={() => navigation.navigate("BookAppointment")}
            className="p-1.5 rounded-full"
            style={{ backgroundColor: theme.surfaceSubtle }}
          >
            <MaterialIcons name="add" size={22} color={theme.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : !hasAppointments || error ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="event-available" size={40} color={theme.primary} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            No appointments yet
          </Text>
          <Text
            className="text-sm text-center max-w-[280px]"
            style={{ color: theme.textSecondary }}
          >
            Appointments you book or that are booked with you will show up here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {appointments.map((item) => {
            const statusColor = STATUS_COLORS[item.status] || theme.textMuted;
            const providerName = item.provider_id
              ? `${item.provider_id.profile?.first_name || ""} ${item.provider_id.profile?.last_name || ""}`.trim() ||
                item.provider_id.username ||
                "Provider"
              : "Provider";
            const isTappable = !!navigation;
            const Wrapper = isTappable ? TouchableOpacity : View;

            return (
              <Wrapper
                key={item._id}
                {...(isTappable
                  ? {
                      activeOpacity: 0.7,
                      onPress: () =>
                        navigation.navigate("AppointmentDetail", { appointmentId: item._id }),
                    }
                  : {})}
                className="p-4 rounded-2xl border mb-3"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text
                    className="text-[15px] font-bold flex-1 pr-2"
                    style={{ color: theme.text }}
                  >
                    {providerName}
                  </Text>
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${statusColor}20` }}
                  >
                    <Text
                      className="text-[10px] font-bold uppercase"
                      style={{ color: statusColor }}
                    >
                      {item.status?.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                  {item.appointment_type} &middot; {formatDate(item.scheduled_start_time)}
                </Text>
                {item.consultation_reason ? (
                  <Text className="text-xs" numberOfLines={2} style={{ color: theme.textMuted }}>
                    {item.consultation_reason}
                  </Text>
                ) : null}
              </Wrapper>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
