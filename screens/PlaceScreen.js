import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Mock Data Arrays
const CATEGORIES = [
  "All",
  "💊 Drugs",
  "🩺 Devices",
  "🧪 Lab Kits",
  "🏋 Fitness",
  "🧬 Wellness",
  "👶 Maternal",
];

const PRODUCTS = [
  {
    id: "1",
    tag: "Pharmacy",
    name: "Insulin Delivery Kit",
    price: "$15,200",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    tag: "Device",
    name: "Digital BP Monitor",
    price: "$32,000",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    tag: "Lab Kit",
    name: "Glucose Test Strips",
    price: "$8,500",
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    tag: "Supplement",
    name: "Vitamin D3 Bundle",
    price: "$6,400",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80",
  },
];

const PHARMACIES = [
  {
    id: "1",
    name: "MedPlus Nigeria",
    details: "Lagos · 47 branches",
    logo: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=80&q=80",
  },
  {
    id: "2",
    name: "HealthPlus Pharmacy",
    details: "Nationwide · 60+ stores",
    logo: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=80&q=80",
  },
];

export function PlaceScreen({ onOpenCart, onPharmacyShop }) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const { width } = useWindowDimensions();
  const brandPrimaryColor = theme.primary || "#3B82F6";

  // Responsive column logic
  const isTablet = width >= 768;
  const isWebLarge = Platform.OS === "web" && width >= 1024;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* ─── TOP BAR ─── */}
      <View
        className="flex-row justify-between items-center px-5 py-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <Text className="text-xl font-extrabold" style={{ color: theme.text }}>
          Health Market
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ─── SEARCH CONTAINER ─── */}
        <View className="px-5 mt-4">
          <View
            className="flex-row items-center rounded-xl px-3 border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <MaterialIcons name="search" size={20} color="#9A9A9A" />
            <TextInput
              placeholder="Search drugs, devices, supplements…"
              placeholderTextColor={theme.textMuted}
              className="flex-1 py-3 px-2 text-sm"
              style={{ color: theme.text }}
            />
          </View>
        </View>

        {/* ─── FEATURED HERO BANNER ─── */}
        <View className="px-5 mt-5">
          <View className="h-40 rounded-2xl overflow-hidden relative">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=80",
              }}
              className="absolute inset-0 w-full h-full"
              resizeMode="cover"
            />
            {/* Dark contrast gradient overlay */}
            <View className="absolute inset-0 bg-black/50" />

            <View className="absolute inset-0 p-5 justify-center">
              <Text className="text-[9px] font-extrabold tracking-widest text-emerald-400 mb-1 uppercase">
                FEATURED
              </Text>
              <Text className="text-lg font-black text-white tracking-tight mb-0.5">
                Home Health Kit
              </Text>
              <Text className="text-xs text-white/60 mb-2">
                Complete diagnostics bundle
              </Text>
              <Text className="text-lg font-black text-emerald-400">
                $24,500
              </Text>
            </View>
          </View>
        </View>

        {/* ─── HORIZONTAL CHIP FILTER ROW ─── */}
        <View className="mt-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: isActive
                      ? brandPrimaryColor
                      : theme.surface,
                    borderColor: isActive ? brandPrimaryColor : theme.border,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color: isActive
                        ? theme.dark
                          ? "#FFFFFF"
                          : theme.surface
                        : theme.text,
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── MAIN RESPONSIVE PRODUCT GRID ─── */}
        <View className="px-5 mt-6">
          <Text
            className="text-[10px] tracking-[1.2px] font-extrabold mb-4 uppercase"
            style={{
              color: theme.dark ? theme.textSecondary : theme.textMuted,
            }}
          >
            POPULAR PRODUCTS
          </Text>

          <View
            className={`flex-row flex-wrap justify-between`}
            style={{ gap: 12 }}
          >
            {PRODUCTS.map((prod) => (
              <View
                key={prod.id}
                style={{
                  width: isWebLarge ? "23.5%" : isTablet ? "31%" : "48%",
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                }}
                className="rounded-2xl overflow-hidden mb-1 flex-col"
              >
                {/* Image & Favorite Layer */}
                <View className="w-full h-32 relative bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    source={{ uri: prod.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <TouchableOpacity className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center border bg-white/90 border-neutral-200">
                    <Ionicons name="heart-outline" size={15} color="#0A0A0A" />
                  </TouchableOpacity>
                </View>

                {/* Information Body */}
                <View className="p-3 flex-1 justify-between">
                  <View>
                    <Text
                      className="text-[10px] uppercase font-bold tracking-wider"
                      style={{ color: theme.textMuted }}
                    >
                      {prod.tag}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-xs font-extrabold mt-0.5"
                      style={{ color: theme.text }}
                    >
                      {prod.name}
                    </Text>

                    <View className="flex-row items-center justify-between mt-2 mb-3">
                      <Text
                        className="text-xs font-black"
                        style={{ color: theme.textSecondary }}
                      >
                        {prod.price}
                      </Text>
                      <View className="flex-row items-center">
                        <MaterialIcons name="star" size={12} color="#FFB800" />
                        <Text
                          className="text-[10px] font-bold ml-0.5"
                          style={{ color: theme.textSecondary }}
                        >
                          {prod.rating}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Add to Cart Primary Action */}
                  <TouchableOpacity
                    className="w-full py-2 rounded-xl items-center justify-center border border-white"
                    style={{
                      backgroundColor: theme.dark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Text
                      className="text-[11px] font-bold"
                      style={{ color: brandPrimaryColor }}
                    >
                      Add to Cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─── VERIFIED PHARMACIES SECTOR ─── */}
        <View className="px-5 mt-8">
          <Text
            className="text-[10px] tracking-[1.2px] font-extrabold mb-4 uppercase"
            style={{
              color: theme.dark ? theme.textSecondary : theme.textMuted,
            }}
          >
            VERIFIED PHARMACIES
          </Text>

          <View
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            {PHARMACIES.map((pharm, index) => (
              <View
                key={pharm.id}
                className={`flex-row items-center p-4 ${index !== PHARMACIES.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: theme.border }}
              >
                <Image
                  source={{ uri: pharm.logo }}
                  className="w-11 h-11 rounded-xl"
                  resizeMode="cover"
                />

                <View className="flex-1 ml-3 justify-center">
                  <Text
                    className="text-sm font-extrabold"
                    style={{ color: theme.text }}
                  >
                    {pharm.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text
                      className="text-[11px] mr-1"
                      style={{ color: theme.textSecondary }}
                    >
                      {pharm.details}
                    </Text>
                    <MaterialIcons name="verified" size={12} color="#00C9A7" />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => onPharmacyShop?.(pharm.id)}
                  className="px-4 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: theme.text }}
                  >
                    Shop →
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
