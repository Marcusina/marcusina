import React from "react";
import { View, Text, TouchableOpacity, TextInput, Platform, useWindowDimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Small set of shared building blocks for the simple UI-only "list/detail"
// screens across newer modules (Identity, Referrals, Health Record, Wallet)
// so each domain file isn't re-declaring the same header/empty-state/form
// boilerplate.

export function useIsWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 768;
}

export function ScreenHeader({ title, onBack, isWeb, right }) {
  const { theme } = useTheme();
  if (isWeb) {
    return (
      <View className="flex-row items-center justify-between mt-5 mb-6">
        <TouchableOpacity onPress={onBack} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={18} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold ml-1.5">
            Back
          </Text>
        </TouchableOpacity>
        <Text style={{ color: theme.text }} className="text-2xl font-extrabold">
          {title}
        </Text>
        <View className="w-16 items-end">{right}</View>
      </View>
    );
  }
  return (
    <View
      style={{ backgroundColor: theme.surface, borderBottomColor: theme.border }}
      className="flex-row items-center justify-between px-4 py-4 border-b gap-3"
    >
      <TouchableOpacity
        onPress={onBack}
        className="p-1.5 rounded-full"
        style={{ backgroundColor: theme.surfaceSubtle }}
      >
        <MaterialIcons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <Text style={{ color: theme.text }} className="text-lg font-bold flex-1" numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export function SectionLabel({ children }) {
  const { theme } = useTheme();
  return (
    <Text
      style={{ color: theme.textMuted }}
      className="text-[11px] font-bold tracking-widest uppercase mb-2 mt-6"
    >
      {children}
    </Text>
  );
}

export function Chip({ label }) {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.primaryLight }} className="px-3 py-1.5 rounded-full mr-2 mb-2">
      <Text style={{ color: theme.primary }} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}

export function StatusBadge({ label, color }) {
  const { theme } = useTheme();
  const c = color || theme.textMuted;
  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: `${c}20` }}>
      <Text className="text-[10px] font-bold uppercase" style={{ color: c }}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({ icon, title, description }) {
  const { theme } = useTheme();
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: theme.primaryLight }}>
        <MaterialIcons name={icon} size={40} color={theme.primary} />
      </View>
      <Text style={{ color: theme.text }} className="text-lg font-bold text-center mb-2">
        {title}
      </Text>
      {description ? (
        <Text style={{ color: theme.textSecondary }} className="text-sm text-center max-w-[280px]">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function FormField({ label, value, onChangeText, placeholder, last, keyboardType, multiline }) {
  const { theme } = useTheme();
  return (
    <View className={last ? "" : "mb-4"}>
      <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-2">
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: theme.background,
          borderColor: theme.border,
          color: theme.text,
        }}
        className={`rounded-xl px-4 py-3 border text-[15px] ${multiline ? "h-24" : ""}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

export function NavRow({ icon, label, description, onPress, right }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className="flex-row items-center rounded-2xl p-4 border mb-3"
    >
      <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text style={{ color: theme.text }} className="text-[14px] font-bold">
          {label}
        </Text>
        {description ? (
          <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
            {description}
          </Text>
        ) : null}
      </View>
      {right !== undefined ? right : <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />}
    </TouchableOpacity>
  );
}
