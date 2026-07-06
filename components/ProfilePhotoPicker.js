import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function ProfilePhotoPicker({ imageUri, onImageSelected }) {
  const { theme } = useTheme();
  return (
    <View className="items-center mb-6">
      <TouchableOpacity
        activeOpacity={0.8}
        className="w-28 h-28 rounded-full border-[1.5px] border-dashed items-center justify-center overflow-hidden"
        style={{ borderColor: theme.primary, backgroundColor: theme.surfaceSubtle }}
      >
        <Text className="text-[32px]">📷</Text>
      </TouchableOpacity>
      <Text className="text-xs mt-2" style={{ color: theme.textSecondary }}>
        Photo upload is supported on Web version
      </Text>
    </View>
  );
}
