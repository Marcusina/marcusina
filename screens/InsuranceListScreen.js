import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { getMyInsurance } from "../api/insurance.api";
import { useCollapsibleHeader, SCREEN_HEADER_HEIGHT } from "../components/ScreenKit";

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
  const { headerStyle, scrollProps, headerHeight } = useCollapsibleHeader(SCREEN_HEADER_HEIGHT);
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
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: theme.background },
          headerStyle,
        ]}
      >
        <View className="flex-row items-center px-4 py-4 gap-3">
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
      </Animated.View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : !hasPlans || error ? (
        <Animated.ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            paddingTop: headerHeight + 24,
          }}
          {...scrollProps}
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
        </Animated.ScrollView>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: headerHeight, paddingHorizontal: 16, paddingVertical: 16 }}
          {...scrollProps}
        >
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
        </Animated.ScrollView>
      )}
    </View>
  );
}
