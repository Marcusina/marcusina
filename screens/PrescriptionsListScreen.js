import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { getUserPrescriptions } from "../api/auth.api";

const STATUS_COLORS = {
  pending: "#F59E0B",
  sent_to_pharmacy: "#3B82F6",
  dispensed: "#10B981",
  partially_dispensed: "#10B981",
  cancelled: "#EF4444",
  expired: "#6B7280",
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PrescriptionsListScreen({ onBack }) {
  const { theme } = useTheme();
  const { token, user } = useUser();

  const {
    data: prescriptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["prescriptions", user?._id],
    queryFn: () => getUserPrescriptions(token, user._id),
    enabled: !!user?._id,
  });

  const hasPrescriptions = Array.isArray(prescriptions) && prescriptions.length > 0;

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
        <Text className="text-xl font-bold" style={{ color: theme.text }}>
          Prescriptions
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : !hasPrescriptions || error ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="healing" size={40} color={theme.primary} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            No prescriptions yet
          </Text>
          <Text
            className="text-sm text-center max-w-[280px]"
            style={{ color: theme.textSecondary }}
          >
            Prescriptions written for you will show up here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {prescriptions.map((item) => {
            const statusColor = STATUS_COLORS[item.status] || theme.textMuted;
            return (
              <View
                key={item._id}
                className="p-4 rounded-2xl border mb-3"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text
                    className="text-[15px] font-bold flex-1 pr-2"
                    style={{ color: theme.text }}
                  >
                    {item.prescription_number || "Prescription"}
                  </Text>
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${statusColor}20` }}
                  >
                    <Text
                      className="text-[10px] font-bold uppercase"
                      style={{ color: statusColor }}
                    >
                      {item.status?.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                  Prescribed {formatDate(item.prescription_date)}
                  {item.expires_at ? ` · Expires ${formatDate(item.expires_at)}` : ""}
                </Text>
                {item.patient_instructions ? (
                  <Text className="text-xs" numberOfLines={2} style={{ color: theme.textMuted }}>
                    {item.patient_instructions}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
