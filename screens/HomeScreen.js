import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
} from "react-native-svg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedications } from "../api/meds.api";
import { getCart, addToCart } from "../api/cart.api";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";

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
  const firstName = user?.profile?.first_name || user?.username || "User";

  // Responsive Breakpoints
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;
  const isWebOrLarge = (Platform.OS === "web" && width >= 768) || isDesktop;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const queryClient = useQueryClient();
  const brandPrimaryColor = theme.primary || "#3B82F6";

  // Use TanStack Query to fetch medications
  const searchQueryValue = selectedCategory || searchQuery;
  const { data: medicationsResponse, isLoading: isMedsLoading } = useQuery({
    queryKey: ["medications", searchQueryValue],
    queryFn: () => getMedications({ search: searchQueryValue }),
    enabled: !!token,
  });

  const medications = medicationsResponse?.data || [];

  // Use TanStack Query to fetch cart
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!token,
  });

  const cartCount =
    cartData?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Mutation to add to cart
  const addToCartMutation = useMutation({
    mutationFn: (medicationId) => addToCart(medicationId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add item to cart");
    },
  });

  // Responsive sizing for user avatars/stories
  const avatarSize = isWebOrLarge || isTablet ? 80 : 64;
  const strokeWidth = 2.5;
  const radius = (avatarSize - strokeWidth) / 2;
  const center = avatarSize / 2;

  // Dynamically calculate grid layouts for products
  const getGridConfig = () => {
    let numColumns = 2;
    if (isDesktop) numColumns = 4;
    else if (isTablet || width >= 768) numColumns = 3;

    const totalPadding = isWebOrLarge ? 0 : 40; // horizontal layout space padding
    const gap = 16;
    const availableWidth = width - totalPadding - gap * (numColumns - 1);
    const cardWidth = availableWidth / numColumns;

    return { cardWidth, gap };
  };

  const { cardWidth, gap: gridGap } = getGridConfig();

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handleAddToCart = (medicationId) => {
    if (!token) {
      toast.error("You must be logged in to add items to cart");
      return;
    }
    addToCartMutation.mutate(medicationId);
  };

  const handleUploadPrescription = () => {
    toast.info("Prescription upload will be available in the next update.");
  };

  const isLoading = isMedsLoading;

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
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: isWebOrLarge ? 40 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ paddingTop: 16, paddingHorizontal: isWebOrLarge ? 0 : 20 }}
        >
          {/* Stories Horizontal Row */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ borderBottomColor: theme.border, borderBottomWidth: 1 }}
            contentContainerStyle={{
              flexDirection: "row",
              paddingVertical: 16,
              marginBottom: 16,
              gap: isWebOrLarge || isTablet ? 24 : 16,
              paddingRight: 16,
            }}
          >
            {/* Create Post Action Avatar */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={{ itemsCenter: "center", width: avatarSize }}
              onPress={onOpenCreatePost}
            >
              <View
                style={{
                  backgroundColor: theme.border,
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {user?.profile?.profile_photo_url?.url ? (
                  <Image
                    source={{ uri: user.profile.profile_photo_url.url }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: avatarSize / 2,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: avatarSize / 2,
                      backgroundColor: "#E0E0E0", // Give it a nice fallback background color
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: avatarSize * 0.4, // Dynamically scales font size to the container
                        fontWeight: "bold",
                        color: "#555",
                      }}
                    >
                      {`${user?.profile?.first_name?.[0] || ""}${user?.profile?.last_name?.[0] || ""}`.toUpperCase()}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    backgroundColor: theme.text,
                    borderColor: theme.background,
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: isWebOrLarge || isTablet ? 24 : 20,
                    height: isWebOrLarge || isTablet ? 24 : 20,
                    borderRadius: 12,
                    borderWidth: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name="add"
                    size={isWebOrLarge || isTablet ? 14 : 12}
                    color={theme.background}
                  />
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.textSecondary,
                  fontSize: isWebOrLarge || isTablet ? 12 : 11,
                  fontWeight: "500",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                You
              </Text>
            </TouchableOpacity>

            {/* Stories List mapping */}
            {activeFeedUsers.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={{ alignItems: "center", width: avatarSize }}
                onPress={() => onOpenPost && onOpenPost(item.id)}
              >
                <View
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  >
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
                  <View
                    style={{
                      width: "86%",
                      height: "86%",
                      borderRadius: avatarSize / 2,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: item.avatar }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text,
                    fontSize: isWebOrLarge || isTablet ? 12 : 11,
                    fontWeight: "500",
                    marginTop: 8,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Health Pulse Widget */}
          <View
            style={{
              backgroundColor: theme.surface,
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
                    color: theme.text,
                    letterSpacing: -0.2,
                  }}
                >
                  Good morning, {firstName} 👋
                </Text>
              </View>
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
                    backgroundColor: brandPrimaryColor,
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
                  style={{ fontSize: 10, color: theme.text, fontWeight: "500" }}
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
              {/* BP */}
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
                    color: theme.dark ? "#FFB800" : "#D97706",
                    fontSize: 17,
                    fontWeight: "800",
                  }}
                >
                  120/80
                </Text>
                <Text
                  style={{ fontSize: 10, color: theme.text, fontWeight: "500" }}
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
                    color: theme.dark ? "#34C759" : "#16A34A",
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  98%
                </Text>
                <Text
                  style={{ fontSize: 10, color: theme.text, fontWeight: "500" }}
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

          {/* Upcoming Appointment Banner */}
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

          {/* Post 1 - Enhanced Responsive Image Aspect Ratio */}
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
              management saves lives. 🩺
              <Text style={{ color: brandPrimaryColor, fontWeight: "500" }}>
                {" "}
                #HeartHealth #MedGram
              </Text>
            </Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=700&q=80",
              }}
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
            {/* Post Interaction Row */}
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
                  />
                </Svg>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  84
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Post 2 - Poll Component */}
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
                    justifyBetween: "space-between",
                    marginBottom: 4,
                    justifyContent: "space-between",
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
          </View>

          {/* Post 3 - Surgeon Card */}
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
              National Hospital Abuja. 🌍
            </Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=700&q=80",
              }}
              style={{
                width: "100%",
                aspectRatio: 4 / 3,
                borderRadius: 12,
                marginBottom: 12,
              }}
              resizeMode="cover"
            />
          </View>

          {/* Trending Section */}
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

          {/* Hero Promo Banner (Flex Row Container on Large Wide Displays) */}
          <View
            style={{
              flexDirection: isWebOrLarge ? "row" : "column",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 16,
                padding: 24,
                flex: 1,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    theme.primaryLight || "rgba(59, 130, 246, 0.1)",
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
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Quick processing & home delivery within 2 hours.
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  backgroundColor: theme.dark ? brandPrimaryColor : "#FFFFFF",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  borderWidth: 1,
                  borderColor: "#000000",
                }}
                onPress={handleUploadPrescription}
              >
                <Text
                  style={{
                    color: theme.dark ? "#FFFFFF" : "#111827",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Upload Now
                </Text>
              </TouchableOpacity>
            </View>

            {isWebOrLarge && (
              <View style={{ flex: 1, flexDirection: "row", gap: 16 }}>
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    flex: 1,
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name="local-shipping"
                    size={24}
                    color={brandPrimaryColor}
                  />
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 24,
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    2hr
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Express Delivery
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    flex: 1,
                    borderRadius: 16,
                    padding: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons
                    name="verified"
                    size={24}
                    color={brandPrimaryColor}
                  />
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 24,
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    100%
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    Genuine Meds
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Shop Categories Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: theme.text, fontSize: 18, fontWeight: "bold" }}
            >
              Shop by Category
            </Text>
            <TouchableOpacity onPress={() => handleCategorySelect(null)}>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Categories Slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingBottom: 16 }}
          >
            {categories.map((item) => {
              const isActive = selectedCategory === item.value;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={{ alignItems: "center" }}
                  onPress={() => handleCategorySelect(item.value)}
                >
                  <View
                    style={{
                      backgroundColor: isActive
                        ? theme.primary
                        : theme.primaryLight,
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
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
                      fontSize: 14,
                      fontWeight: isActive ? "700" : "500",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Products Dynamic Responsive Grid */}
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            {selectedCategory
              ? `${selectedCategory} Products`
              : searchQuery
                ? "Search Results"
                : "Popular Products"}
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginTop: 20 }}
            />
          ) : medications.length > 0 ? (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: gridGap }}
            >
              {medications.map((item) => (
                <View
                  key={item._id}
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 4,
                    width: cardWidth,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.background,
                      aspectRatio: 1,
                      borderRadius: 12,
                      marginBottom: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {item.image_url && item.image_url.length > 0 ? (
                      <Image
                        source={{ uri: item.image_url[0].url }}
                        style={{ width: "100%", height: "100%" }}
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
                  <View style={{ position: "absolute", top: 18, left: 18 }}>
                    <Text
                      style={{
                        color: theme.primary,
                        backgroundColor: theme.primaryLight,
                        fontSize: 10,
                        fontWeight: "bold",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        overflow: "hidden",
                      }}
                    >
                      {item.requires_prescription ? "Prescription Req." : "OTC"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                    numberOfLines={2}
                  >
                    {item.medication_name}
                  </Text>
                  <Text
                    style={{
                      color: theme.textMuted || "#9CA3AF",
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                    numberOfLines={1}
                  >
                    {item.generic_name}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      $10.00
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: theme.primary,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => handleAddToCart(item._id)}
                    >
                      <MaterialIcons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 40,
                width: "100%",
              }}
            >
              <MaterialIcons
                name="search-off"
                size={64}
                color={theme.textMuted || "#D1D5DB"}
              />
              <Text
                style={{
                  color: theme.textSecondary,
                  marginTop: 12,
                  fontSize: 16,
                }}
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
