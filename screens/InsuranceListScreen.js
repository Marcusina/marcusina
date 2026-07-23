import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { getMyInsurance } from "../api/insurance.api";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InsuranceListScreen({ onBack }) {
  const { theme } = useTheme();
  const { token, user } = useUser();

  const {
    data: plans = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["insurance", user?._id],
    queryFn: () => getMyInsurance(token, user._id),
    enabled: !!user?._id,
  });

  const hasPlans = Array.isArray(plans) && plans.length > 0;

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
          Insurance
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : !hasPlans || error ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="shield" size={40} color={theme.primary} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            No insurance on file
          </Text>
          <Text
            className="text-sm text-center max-w-[280px]"
            style={{ color: theme.textSecondary }}
          >
            Insurance plans linked to your account will show up here.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {plans.map((item) => (
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
                  {item.insurance_provider_id?.provider_name || "Insurance Plan"}
                </Text>
                {item.is_primary ? (
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${theme.primary}20` }}
                  >
                    <Text
                      className="text-[10px] font-bold uppercase"
                      style={{ color: theme.primary }}
                    >
                      Primary
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs mb-1" style={{ color: theme.textSecondary }}>
                Policy {item.policy_number || "N/A"}
              </Text>
              {item.policy_end_date ? (
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Valid until {formatDate(item.policy_end_date)}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
