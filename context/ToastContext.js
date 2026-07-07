import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "./ThemeContext";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const { theme } = useTheme();
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast.visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  const hideToast = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  };

  const getIconAndColor = () => {
    switch (toast.type) {
      case "success":
        return { name: "check-circle", color: "#10B981" };
      case "error":
        return { name: "error", color: "#EF4444" };
      case "warning":
        return { name: "warning", color: "#F59E0B" };
      case "info":
      default:
        return { name: "info", color: theme.primary || "#00C9A7" };
    }
  };

  const iconInfo = getIconAndColor();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: theme.mode === "dark" ? "rgba(24, 24, 27, 0.95)" : "rgba(255, 255, 255, 0.95)",
              borderColor: theme.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <MaterialIcons name={iconInfo.name} size={22} color={iconInfo.color} style={styles.icon} />
          <Text style={[styles.message, { color: theme.text }]} numberOfLines={2}>
            {toast.message}
          </Text>
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn} hitSlop={12}>
            <MaterialIcons name="close" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

let globalShowToast = null;

export const toast = {
  show: (message, type = "info") => {
    if (globalShowToast) {
      globalShowToast(message, type);
    } else {
      console.warn("ToastProvider not loaded yet. Msg:", message);
    }
  },
  success: (message) => toast.show(message, "success"),
  error: (message) => toast.show(message, "error"),
  warning: (message) => toast.show(message, "warning"),
  info: (message) => toast.show(message, "info"),
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 12,
    padding: 2,
  },
});
