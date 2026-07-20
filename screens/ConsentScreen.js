import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { getMyConsents, revokeConsent } from "../api/consent.api";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConsentScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const {
    data: consents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["consents", user?._id],
    queryFn: () => getMyConsents(user._id),
    enabled: !!user?._id,
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => revokeConsent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents", user?._id] });
      toast.success("Consent revoked");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to revoke consent");
    },
  });

  const hasConsents = Array.isArray(consents) && consents.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        className="flex-row items-center px-4 py-4 border-b gap-3"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          className="p-1.5 rounded-full"
          style={{ backgroundColor: theme.surfaceSubtle }}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: theme.text }}>
          Consent &amp; Privacy
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : !hasConsents || error ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-teal-500/10">
            <MaterialIcons name="verified-user" size={40} color={theme.primary} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: theme.text }}
          >
            No consent records yet
          </Text>
          <Text
            className="text-sm text-center max-w-[280px]"
            style={{ color: theme.textSecondary }}
          >
            Data-sharing permissions you've granted will show up here so you
            can review or revoke them at any time.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {consents.map((item) => (
            <View
              key={item._id}
              className="p-4 rounded-2xl border mb-3"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <Text
                  className="text-[15px] font-bold flex-1 pr-2 capitalize"
                  style={{ color: theme.text }}
                >
                  {item.consent_type?.replace(/_/g, " ")}
                </Text>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: item.granted
                      ? `${theme.success}20`
                      : `${theme.textMuted}20`,
                  }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase"
                    style={{ color: item.granted ? theme.success : theme.textMuted }}
                  >
                    {item.granted ? "Active" : "Revoked"}
                  </Text>
                </View>
              </View>
              <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                {item.consent_purpose}
                {item.granted_at ? ` · Granted ${formatDate(item.granted_at)}` : ""}
              </Text>
              {item.granted ? (
                <TouchableOpacity
                  onPress={() => revokeMutation.mutate(item._id)}
                  disabled={revokeMutation.isLoading}
                  className="self-start px-3 py-1.5 rounded-xl border"
                  style={{ borderColor: theme.error }}
                >
                  <Text className="text-xs font-bold" style={{ color: theme.error }}>
                    Revoke
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
