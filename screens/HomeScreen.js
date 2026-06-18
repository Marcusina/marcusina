import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { getMedications, getCart, addToCart } from "../api/meds.api";
import { useTheme } from "../context/ThemeContext";

export function HomeScreen({
  user,
  token,
  onOpenProfile,
  onConsult,
  onOpenGroups,
  onOpenPlace,
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;

  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Crucial variable declaration to prevent the ReferenceError
  const brandPrimaryColor = theme.primary || "#3B82F6";

  // Responsive Sizing Values for the Feed Circles
  // Small Screens: 64px (w-16) | Tablet/Desktop: 80px (md:w-20)
  const isLargeScreen = width >= 768;
  const avatarSize = isLargeScreen ? 80 : 64;
  const strokeWidth = 2.5;
  const radius = (avatarSize - strokeWidth) / 2;
  const center = avatarSize / 2;

  const fetchMedications = useCallback(
    async (search = "", category = null) => {
      if (!token) return;
      try {
        const query = category || search;
        const response = await getMedications(token, { search: query });
        setMedications(response.data || []);
      } catch (error) {
        console.error("Failed to fetch medications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  const fetchCartCount = useCallback(async () => {
    if (!token) return;
    try {
      const cart = await getCart(token);
      const count =
        cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchMedications();
    fetchCartCount();
  }, [fetchMedications, fetchCartCount]);

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      fetchMedications(searchQuery, null);
    } else {
      setSelectedCategory(category);
      fetchMedications("", category);
    }
  };

  const handleAddToCart = async (medicationId) => {
    if (!token) {
      Alert.alert("Error", "You must be logged in to add items to cart");
      return;
    }
    try {
      await addToCart(token, medicationId, 1);
      fetchCartCount();
      Alert.alert("Success", "Item added to cart");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to add item to cart");
    }
  };

  const handleUploadPrescription = () => {
    Alert.alert(
      "Coming Soon",
      "Prescription upload will be available in the next update.",
    );
  };

  const activeFeedUsers = [
    {
      id: "1",
      name: "Dr. Sarah",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "2",
      name: "Dr. James",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "3",
      name: "Health Hub",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "4",
      name: "Dr. Amara",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "5",
      name: "Care Group",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "6",
      name: "Dr. Novak",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  ];

  const categories = [
    { label: "Pain Relief", icon: "healing", value: "Analgesic" },
    { label: "Vitamins", icon: "spa", value: "Vitamin" },
    { label: "Antibiotics", icon: "biotech", value: "Antibiotic" },
    { label: "First Aid", icon: "medical-services", value: "First Aid" },
    { label: "Baby", icon: "child-care", value: "Baby" },
  ];

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: isWeb ? 40 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`pt-4 ${isWeb ? "px-0" : "px-5"}`}>
          {/* ======================================================= */}
          {/* INSTAGRAM-STYLE CIRCULAR POSTS FEED RAIL               */}
          {/* ======================================================= */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ borderBottomColor: theme.border }}
            className="flex-row py-4 mb-4 border-b"
            contentContainerStyle={{
              gap: isLargeScreen ? 24 : 16,
              paddingRight: 16,
            }}
          >
            {/* 1st Item: Signed-In User Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="items-center w-16 md:w-20"
              onPress={onOpenProfile}
            >
              <View
                style={{ backgroundColor: theme.border }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full items-center justify-center relative"
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                  }}
                  className="w-full h-full rounded-full"
                />
                <View
                  style={{
                    backgroundColor: theme.text,
                    borderColor: theme.background,
                  }}
                  className="absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 items-center justify-center"
                >
                  <MaterialIcons
                    name="add"
                    size={isLargeScreen ? 14 : 12}
                    color={theme.background}
                  />
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={{ color: theme.textSecondary }}
                className="text-[11px] md:text-xs font-medium mt-2 text-center w-full"
              >
                You
              </Text>
            </TouchableOpacity>

            {/* Other Profiles with SVG Linear Gradient Rings */}
            {activeFeedUsers.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                className="items-center w-16 md:w-20 relative"
                onPress={onOpenPlace}
              >
                <View className="w-16 h-16 md:w-20 md:h-20 items-center justify-center relative">
                  {/* Native SVG Vector Gradient Layout Ring */}
                  <View className="absolute inset-0">
                    <Svg
                      width={avatarSize}
                      height={avatarSize}
                      viewBox={`0 0 ${avatarSize} ${avatarSize}`}
                    >
                      <Defs>
                        <LinearGradient
                          id={`instaGradient-${item.id}`}
                          x1="0%"
                          y1="100%"
                          x2="100%"
                          y2="0%"
                        >
                          <Stop offset="0%" stopColor="#F58529" />
                          <Stop offset="25%" stopColor="#DD2A7B" />
                          <Stop offset="60%" stopColor="#8134AF" />
                          <Stop offset="100%" stopColor="#515BD4" />
                        </LinearGradient>
                      </Defs>
                      <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={`url(#instaGradient-${item.id})`}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />
                    </Svg>
                  </View>

                  {/* Inner Content Avatar Mask */}
                  <View className="w-[88%] h-[88%] rounded-full overflow-hidden items-center justify-center bg-transparent">
                    <Image
                      source={{ uri: item.avatar }}
                      className="w-full h-full rounded-full"
                    />
                  </View>
                </View>

                <Text
                  numberOfLines={1}
                  style={{ color: theme.text }}
                  className="text-[11px] md:text-xs font-medium mt-2 text-center w-full"
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* ======================================================= */}

          {/* HERO PROMO BANNER (FULLY SYSTEM THEME RESPONSIVE) */}
          <View className={`mb-6 ${isWeb ? "flex-row gap-5" : "flex-col"}`}>
            <View
              style={{
                backgroundColor: theme.surface, // Dynamic card surface color (typically gray/dark-gray in dark mode)
                borderWidth: 1,
                borderColor: theme.border, // Dynamic border styling
                borderRadius: 16,
                padding: 24,
                position: "relative",
                overflow: "hidden",
                flex: 1,
                flexGrow: isWeb ? 2 : 1,
              }}
            >
              {/* Small Tag Pill Badge */}
              <View
                style={{
                  backgroundColor:
                    theme.primaryLight || "rgba(59, 130, 246, 0.1)", // Subtle dynamic theme tint
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 9999,
                  alignSelf: "flex-start",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: brandPrimaryColor,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  QuickProcess
                </Text>
              </View>

              {/* Main Card Title Heading */}
              <Text
                style={{
                  color: theme.text,
                  fontSize: 24,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Upload Prescription
              </Text>

              {/* Subtitle Body Description Text */}
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  marginBottom: 20,
                  maxWidth: isWeb ? "70%" : "85%",
                }}
              >
                Quick processing & home delivery within 2 hours.
              </Text>

              {/* Interactive Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  backgroundColor: theme.dark ? brandPrimaryColor : "#FFFFFF", // Flips button background color dynamically
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  borderWidth: 1, // Defines the border thickness
                  borderColor: "#000000", // Forces a solid black border line
                }}
                onPress={handleUploadPrescription}
              >
                <Text
                  style={{
                    color: theme.dark ? "#FFFFFF" : "#111827", // Forces dark text on dark theme, white text on light theme
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Upload Now
                </Text>
              </TouchableOpacity>
            </View>

            {isWeb && (
              <View className="flex-1 gap-4">
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  className="flex-1 rounded-2xl p-4 items-center justify-center border"
                >
                  <MaterialIcons
                    name="local-shipping"
                    size={24}
                    color={brandPrimaryColor}
                  />
                  <Text
                    style={{ color: theme.text }}
                    className="text-2xl font-bold mt-2"
                  >
                    2hr
                  </Text>
                  <Text
                    style={{ color: theme.textSecondary }}
                    className="text-xs mt-0.5"
                  >
                    Express Delivery
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  className="flex-1 rounded-2xl p-4 items-center justify-center border"
                >
                  <MaterialIcons
                    name="verified"
                    size={24}
                    color={brandPrimaryColor}
                  />
                  <Text
                    style={{ color: theme.text }}
                    className="text-2xl font-bold mt-2"
                  >
                    100%
                  </Text>
                  <Text
                    style={{ color: theme.textSecondary }}
                    className="text-xs mt-0.5"
                  >
                    Genuine Meds
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Shop Categories Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: theme.text }} className="text-lg font-bold">
              Shop by Category
            </Text>
            <TouchableOpacity onPress={() => handleCategorySelect(null)}>
              <Text
                style={{ color: theme.primary }}
                className="text-sm font-semibold"
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories Slider Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row mb-6"
            contentContainerStyle={{ gap: 20, paddingBottom: 8 }}
          >
            {categories.map((item) => {
              const isActive = selectedCategory === item.value;
              return (
                <TouchableOpacity
                  key={item.label}
                  className="items-center"
                  onPress={() => handleCategorySelect(item.value)}
                >
                  <View
                    style={{
                      backgroundColor: isActive
                        ? theme.primary
                        : theme.primaryLight,
                    }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-2"
                  >
                    <MaterialIcons
                      name={item.icon || "category"}
                      size={24}
                      color={isActive ? "#FFFFFF" : theme.primary}
                    />
                  </View>
                  <Text
                    style={{
                      color: isActive ? theme.primary : theme.textSecondary,
                    }}
                    className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Products Grid Title */}
          <Text
            style={{ color: theme.text }}
            className="text-lg font-bold mb-4"
          >
            {selectedCategory
              ? `${selectedCategory} Products`
              : searchQuery
                ? "Search Results"
                : "Popular Products"}
          </Text>

          {/* Products Dynamic Grid Section */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              className="mt-5"
            />
          ) : medications.length > 0 ? (
            <View className="flex-row flex-wrap justify-between mt-2">
              {medications.map((item) => (
                <View
                  key={item._id}
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  className={`border rounded-2xl p-3 mb-4 ${isWeb ? "w-[23%]" : "w-[48%]"}`}
                >
                  <View
                    style={{ backgroundColor: theme.background }}
                    className="aspect-square rounded-xl mb-3 items-center justify-center relative overflow-hidden"
                  >
                    {item.image_url && item.image_url.length > 0 ? (
                      <Image
                        source={{ uri: item.image_url[0].url }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcons
                        name="image"
                        size={40}
                        color={theme.textMuted || "#E5E7EB"}
                      />
                    )}
                  </View>
                  <View className="absolute top-5 left-5">
                    <Text
                      style={{
                        color: theme.primary,
                        backgroundColor: theme.primaryLight,
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-md overflow-hidden"
                    >
                      {item.requires_prescription ? "Prescription Req." : "OTC"}
                    </Text>
                  </View>
                  <Text
                    style={{ color: theme.text }}
                    className="text-sm font-semibold mb-1 h-10"
                    numberOfLines={2}
                  >
                    {item.medication_name}
                  </Text>
                  <Text
                    style={{ color: theme.textMuted || "#9CA3AF" }}
                    className="text-xs mb-3"
                    numberOfLines={1}
                  >
                    {item.generic_name}
                  </Text>
                  <View className="flex-row justify-between items-center mt-auto">
                    <Text
                      style={{ color: theme.text }}
                      className="text-base font-bold"
                    >
                      $10.00
                    </Text>
                    <TouchableOpacity
                      style={{ backgroundColor: theme.primary }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                      onPress={() => handleAddToCart(item._id)}
                    >
                      <MaterialIcons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-10 w-full">
              <MaterialIcons
                name="search-off"
                size={64}
                color={theme.textMuted || "#D1D5DB"}
              />
              <Text
                style={{ color: theme.textSecondary }}
                className="mt-3 text-base"
              >
                No medications found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
