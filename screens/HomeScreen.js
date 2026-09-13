import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedications } from "../api/meds.api";
import { getCart, addToCart } from "../api/cart.api";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useHeaderScroll } from "../context/HeaderScrollContext";

export function HomeScreen({ user, token, onOpenAppointments }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { scrollProps, headerHeight } = useHeaderScroll();
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

  const quickActions = [
    {
      label: "Book Visit",
      icon: "event-available",
      onPress: onOpenAppointments,
    },
    {
      label: "Ask AI",
      icon: "smart-toy",
      onPress: () => toast.info("AI health assistant is coming soon."),
    },
    {
      label: "Track Vitals",
      icon: "monitor-heart",
      onPress: () => toast.info("Vitals tracking is coming soon."),
    },
    {
      label: "Emergency",
      icon: "emergency",
      onPress: () => toast.info("Emergency mode is coming soon."),
    },
  ];

  const careTips = [
    {
      title: "5 signs of high blood pressure",
      tag: "Heart Health",
      image:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "Staying hydrated in hot weather",
      tag: "Wellness",
      image:
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "Why routine checkups matter",
      tag: "Prevention",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: "Managing medication schedules",
      tag: "Care Tips",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
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
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: isWebOrLarge ? 40 : 24,
        }}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        <View
          style={{ paddingTop: 16, paddingHorizontal: isWebOrLarge ? 0 : 20 }}
        >
          {/* Quick Actions */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
              gap: 10,
            }}
          >
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={item.onPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 16,
                  paddingVertical: 14,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.primaryLight,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={brandPrimaryColor}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text,
                    fontSize: 11,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Snapshot Section */}
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 1,
              color: theme.textMuted,
              marginBottom: 12,
            }}
          >
            TODAY'S SNAPSHOT
          </Text>

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
                    color: theme.warning,
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
                    color: theme.success,
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
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenAppointments}
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
            <View
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
            </View>
          </TouchableOpacity>

          {/* Care Tips Section */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.border,
              paddingTop: 20,
              marginTop: 4,
              marginBottom: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1,
                color: theme.textMuted,
              }}
            >
              CARE TIPS FOR YOU
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingBottom: 8, paddingRight: 16 }}
            style={{ marginBottom: 8 }}
          >
            {careTips.map((tip) => (
              <View
                key={tip.title}
                style={{
                  width: 220,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: tip.image }}
                  style={{ width: "100%", height: 110 }}
                  resizeMode="cover"
                />
                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      color: brandPrimaryColor,
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    {tip.tag.toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 13,
                      fontWeight: "600",
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {tip.title}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pharmacy & Shop Section */}
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.border,
              paddingTop: 20,
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1,
                color: theme.textMuted,
              }}
            >
              PHARMACY &amp; SHOP
            </Text>
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
                  backgroundColor: brandPrimaryColor,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                }}
                onPress={handleUploadPrescription}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
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
      </Animated.ScrollView>
    </View>
  );
}
