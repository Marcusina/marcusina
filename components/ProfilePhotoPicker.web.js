import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";

export function ProfilePhotoPicker({ imageUri, onImageSelected }) {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size exceeds the 2MB limit.");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      onImageSelected(file, url);
    }
  };

  return (
    <View className="items-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => fileInputRef.current?.click()}
        className="w-28 h-28 rounded-full border-[1.5px] border-dashed items-center justify-center overflow-hidden"
        style={{ borderColor: theme.primary, backgroundColor: theme.surfaceSubtle }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full" style={{ resizeMode: "cover" }} />
        ) : (
          <Text className="text-[32px]">📷</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => fileInputRef.current?.click()} className="mt-2.5">
        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
          {imageUri ? "Change Profile Photo" : "Upload Profile Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
