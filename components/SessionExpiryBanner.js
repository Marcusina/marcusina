import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";

export function SessionExpiryBanner() {
  const { user, handleRefreshToken } = useUser();
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!user || !user.last_login_at) {
      setShowBanner(false);
      return;
    }

    const checkExpiry = () => {
      const lastLogin = new Date(user.last_login_at).getTime();
      const diffMs = Date.now() - lastLogin;
      const cutoffMs = 23.5 * 60 * 60 * 1000; // 23.5 hours

      setShowBanner(diffMs > cutoffMs);
    };

    // Check immediately and then every minute
    checkExpiry();
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await handleRefreshToken();
      toast.success("Session extended successfully!");
    } catch (error) {
      const errorMsg =
        error.message || "Failed to extend session. Please login again.";
      toast.error(errorMsg);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!showBanner) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.warningLight,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          Your session will expire soon. Please extend your session to continue
          working.
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: theme.warning,
            backgroundColor: theme.surface,
          },
        ]}
        onPress={handleRefresh}
        disabled={isRefreshing}
        activeOpacity={0.8}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={theme.warning} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.warning }]}>
            Extend Session
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
    flexWrap: "wrap",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 200,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 110,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
