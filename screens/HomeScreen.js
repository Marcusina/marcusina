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
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
} from "react-native-svg";
import { getMedications, getCart, addToCart } from "../api/meds.api";
import { useTheme } from "../context/ThemeContext";

export function HomeScreen({
  user,
  token,
  onOpenProfile,
  onConsult,
  onOpenGroups,
  onOpenPlace,
  onOpenPost,
  onOpenCreatePost,
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
            {/* 1st Item: Signed-In User Profile, patients cannot make posts */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="items-center w-16 md:w-20"
              onPress={onOpenCreatePost}
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
                // 2. Updated to fire onOpenPost with current item.id context target
                onPress={() => onOpenPost && onOpenPost(item.id)}
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
                          <Stop offset="0%" stopColor="#00C9A7" />
                          <Stop offset="100%" stopColor="#007AFF" />
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

          {/* ─── HEALTH PULSE WIDGET (FULLY SYSTEM THEME ISOLATED) ─── */}
          <View
            style={{
              backgroundColor: theme.surface, // Kept as theme.surface for both modes
              borderRadius: 16,
              padding: 18,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.2,
                    // Dynamically shifts text color based on surface mode
                    color: theme.dark ? theme.textSecondary : theme.textMuted,
                    marginBottom: 4,
                    fontWeight: "600",
                  }}
                >
                  YOUR HEALTH PULSE
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    // Uses the theme text color to automatically swap black/white text correctly
                    color: theme.text,
                    letterSpacing: -0.2,
                  }}
                >
                  Good morning, Amara 👋
                </Text>
              </View>

              {/* Live Pill Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: brandPrimaryColor, // Keeps branding primary color visible
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    color: brandPrimaryColor,
                    fontWeight: "600",
                  }}
                >
                  Live
                </Text>
              </View>
            </View>

            {/* Stats Horizontal Grid */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {/* Heart Rate */}
              <View
                style={{
                  flex: 1,
                  // Uses high contrast, low-opacity background boxes depending on light/dark modes
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: brandPrimaryColor,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  72
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.text,
                    fontWeight: "500",
                  }}
                >
                  BPM
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Heart Rate
                </Text>
              </View>

              {/* Blood Pressure */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.dark ? "#FFB800" : "#D97706", // Darker amber/orange text in light mode for proper contrast
                    fontSize: 17,
                    fontWeight: "800",
                  }}
                >
                  120/80
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.text,
                    fontWeight: "500",
                  }}
                >
                  mmHg
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Blood Pressure
                </Text>
              </View>

              {/* Oxygen */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.03)",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.dark ? "#34C759" : "#16A34A", // Darker emerald green in light mode for visibility
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  98%
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.text,
                    fontWeight: "500",
                  }}
                >
                  SpO₂
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Oxygen Sat.
                </Text>
              </View>
            </View>
          </View>

          {/* ─── UPCOMING APPOINTMENT MINI-BANNER ─── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: theme.dark ? theme.surface : "#1E293B",
              borderColor: theme.border,
              borderWidth: theme.dark ? 1 : 0,
              borderRadius: 14,
              padding: 12,
              alignItems: "center",
              marginBottom: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: "#FFFFFF" }}
              >
                15
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "700",
                  color: brandPrimaryColor,
                  letterSpacing: 0.5,
                }}
              >
                MAY
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginBottom: 2,
                }}
              >
                Dr. Chidi Eze · Cardiology
              </Text>
              <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                10:30 AM · Video Consultation
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(0,201,167,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: brandPrimaryColor,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: brandPrimaryColor,
                }}
              >
                Join
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── POST 1: IMAGE COMPONENT ─── */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                gap: 10,
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=80&q=80",
                }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Dr. Amaka Eze
                  </Text>
                  <Svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                    <Circle cx="7.5" cy="7.5" r="7.5" fill="#00C9A7" />
                    <Path
                      d="M4.5 7.5L6.5 9.5L10.5 5.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  Cardiologist · Lagos · 2h ago
                </Text>
              </View>
              <TouchableOpacity style={{ padding: 4 }}>
                <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <Circle cx="9" cy="4.5" r="1.4" fill="#9A9A9A" />
                  <Circle cx="9" cy="9" r="1.4" fill="#9A9A9A" />
                  <Circle cx="9" cy="13.5" r="1.4" fill="#9A9A9A" />
                </Svg>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                lineHeight: 18,
                marginBottom: 10,
              }}
            >
              High blood pressure is Africa's silent killer. Early detection and
              consistent management saves lives. Get screened at a
              Medgram-verified clinic near you. 🩺
              <Text style={{ color: brandPrimaryColor, fontWeight: "500" }}>
                {" "}
                #HeartHealth #MedGram #CardioNG
              </Text>
            </Text>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=700&q=80",
              }}
              style={{
                width: "100%",
                height: 196,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Path
                    d="M9.5 16.5S2 12 2 6.8C2 4.7 3.9 3 6.2 3 7.5 3 8.7 3.58 9.5 4.52 10.3 3.58 11.5 3 12.8 3 15.1 3 17 4.7 17 6.8c0 5.2-7.5 9.7-7.5 9.7Z"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  1.2k
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Path
                    d="M16.5 10C16.5 13.6 13.4 16.5 9.5 16.5c-.88 0-1.72-.16-2.5-.46L3 17l.97-3.85C3.36 12.3 3 11.2 3 10 3 6.4 5.9 3.5 9.5 3.5S17 6.4 17 10Z"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  84
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Circle
                    cx="15"
                    cy="4.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Circle
                    cx="15"
                    cy="14.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Circle
                    cx="4.5"
                    cy="9.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M13 5.3L6.5 8.8M6.5 10.2L13 13.7"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Share
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: "auto" }}>
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Path
                    d="M5 2h9a2 2 0 012 2v13l-6.5-3.5L3 17V4a2 2 0 012-2Z"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── POST 2: POLL COMPONENT ─── */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                gap: 10,
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&w=80&q=80",
                }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    WHO Africa
                  </Text>
                  <Svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                    <Circle cx="7.5" cy="7.5" r="7.5" fill="#007AFF" />
                    <Path
                      d="M4.5 7.5L6.5 9.5L10.5 5.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  Official Organisation · 5h ago
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              How often do you get a routine health checkup?
            </Text>

            {/* Poll Rows */}
            {[
              { label: "Every 6 months", pct: "38%", color: "#0e3054" },
              { label: "Once a year", pct: "32%", color: "#007AFF" },
              { label: "Only when sick", pct: "24%", color: "#FF9500" },
              { label: "Never", pct: "6%", color: "#FF3B30" },
            ].map((item, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.text,
                      fontWeight: "500",
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: theme.text,
                    }}
                  >
                    {item.pct}
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    width: "100%",
                    backgroundColor: theme.dark ? "#374151" : "#E5E7EB",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: "100%",
                      width: item.pct,
                      backgroundColor: item.color,
                    }}
                  />
                </View>
              </View>
            ))}
            <Text
              style={{
                fontSize: 10.5,
                color: theme.textSecondary,
                marginTop: 6,
              }}
            >
              4,209 votes · 18 hours left
            </Text>
          </View>

          {/* ─── POST 3: SURGEON POST COMPONENT ─── */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
                gap: 10,
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=80&q=80",
                }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Dr. Chidi Okoye
                  </Text>
                  <Svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                    <Circle cx="7.5" cy="7.5" r="7.5" fill="#00C9A7" />
                    <Path
                      d="M4.5 7.5L6.5 9.5L10.5 5.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  Cardiothoracic Surgeon · Abuja · 1d ago
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                lineHeight: 18,
                marginBottom: 10,
              }}
            >
              Successfully completed our 200th minimally invasive procedure at
              National Hospital Abuja. Proud of this extraordinary team. African
              healthcare is ascending. 🌍
            </Text>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=700&q=80",
              }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Path
                    d="M9.5 16.5S2 12 2 6.8C2 4.7 3.9 3 6.2 3 7.5 3 8.7 3.58 9.5 4.52 10.3 3.58 11.5 3 12.8 3 15.1 3 17 4.7 17 6.8c0 5.2-7.5 9.7-7.5 9.7Z"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  3.4k
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Path
                    d="M16.5 10C16.5 13.6 13.4 16.5 9.5 16.5c-.88 0-1.72-.16-2.5-.46L3 17l.97-3.85C3.36 12.3 3 11.2 3 10 3 6.4 5.9 3.5 9.5 3.5S17 6.4 17 10Z"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  211
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Svg width="18" height="18" viewBox="0 0 19 19" fill="none">
                  <Circle
                    cx="15"
                    cy="4.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Circle
                    cx="15"
                    cy="14.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Circle
                    cx="4.5"
                    cy="9.5"
                    r="2"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                  <Path
                    d="M13 5.3L6.5 8.8M6.5 10.2L13 13.7"
                    stroke={theme.textSecondary}
                    strokeWidth="1.5"
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── TRENDING IN HEALTH SECTION ─── */}
          <View style={{ paddingVertical: 18 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: theme.textSecondary,
                letterSpacing: 0.8,
                marginBottom: 14,
              }}
            >
              TRENDING IN HEALTH
            </Text>

            {[
              { tag: "#WorldHealthDay", posts: "12,400 posts" },
              { tag: "#MalariaFree2026", posts: "8,200 posts" },
              { tag: "#AfricanNurses", posts: "6,100 posts" },
            ].map((item, index, arr) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                  borderBottomColor: theme.border,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: brandPrimaryColor,
                    }}
                  >
                    {item.tag}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10.5,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {item.posts}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.dark
                      ? "#374151"
                      : "rgba(0,201,167,0.1)",
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#000000",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: theme.dark ? "#FFFFFF" : brandPrimaryColor,
                    }}
                  >
                    Follow
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

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
