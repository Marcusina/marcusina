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
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunities,
  getMyCommunities,
  joinCommunity,
} from "../api/community.api";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

const SUGGESTED_COMMUNITIES = [
  {
    id: "1",
    name: "Hypertension Warriors NG",
    members: "14.2k members",
    image:
      "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    name: "Mama & Baby Health",
    members: "9.8k members",
    image:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    name: "Men's Health Africa",
    members: "7.3k members",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    name: "Sickle Cell Warriors",
    members: "5.6k members",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80",
  },
];

export function GroupsScreen({
  token,
  onBackHome,
  onOpenConsult,
  onOpenProfile,
}) {
  const { theme, themeMode } = useTheme();
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const queryClient = useQueryClient();

  const brandPrimaryColor = theme.primary || "#3B82F6";

  const [searchQuery, setSearchQuery] = useState("");

  // Use TanStack Query to fetch my communities
  const { data: myCommunities = [], isLoading: isMyCommunitiesLoading } = useQuery({
    queryKey: ["myCommunities", token],
    queryFn: () => getMyCommunities(token),
    enabled: !!token,
  });

  // Use TanStack Query to fetch suggested/all communities
  const { data: allRes, isLoading: isAllCommunitiesLoading } = useQuery({
    queryKey: ["allCommunities", token, searchQuery],
    queryFn: () => getCommunities(token, { search: searchQuery, limit: 10 }),
    enabled: !!token,
  });

  const suggestedGroups = React.useMemo(() => {
    const myIds = new Set(myCommunities.map((c) => c._id));
    return (allRes?.data || []).filter((c) => !myIds.has(c._id));
  }, [allRes, myCommunities]);

  const joinMutation = useMutation({
    mutationFn: (communityId) => joinCommunity(token, communityId),
    onSuccess: () => {
      showToast("Joined group successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["myCommunities", token] });
      queryClient.invalidateQueries({ queryKey: ["allCommunities", token] });
    },
    onError: (error) => {
      showToast(error.message || "Failed to join group", "error");
    },
  });

  const handleJoinGroup = (communityId) => {
    joinMutation.mutate(communityId);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleCreateGroup = () => {
    showToast("Group creation will be available in the next update.", "info");
  };

  const isLoading = isMyCommunitiesLoading || isAllCommunitiesLoading;
  const isSearching = isAllCommunitiesLoading && searchQuery.trim().length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* ─── TOP BAR ─── */}
      {!isWeb && (
        <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: theme.text }}
          >
            Groups
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: isWeb ? 40 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`px-5 ${isWeb ? "max-w-7xl mx-auto w-full" : ""}`}>
          {/* ─── SEARCH CONTAINER ─── */}
          <View className="mt-4 mb-2">
            <View
              className="flex-row items-center rounded-xl px-4 border"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                paddingVertical: Platform.OS === "ios" ? 10 : 2,
              }}
            >
              <MaterialIcons
                name="search"
                size={20}
                color="#9CA3AF"
                className="mr-2"
              />
              <TextInput
                className="flex-1 text-base"
                style={{ color: theme.text }}
                placeholder="Search groups..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#9CA3AF"
              />
              {isSearching && (
                <ActivityIndicator size="small" color={brandPrimaryColor} />
              )}
            </View>
          </View>

          {/* ─── CHOSEN HERO / FEATURED LIVE GROUP ACCENT BANNER ─── */}
          <View className="mb-6 mt-2">
            <View
              className="rounded-2xl p-5 relative overflow-hidden border"
              style={{
                backgroundColor: theme.surface, // Kept as theme.surface for unified look
                borderColor: theme.border,
                borderWidth: 1,
              }}
            >
              {/* Background Banner Image Layer */}
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
                }}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: theme.dark ? 0.08 : 0.12 }}
                resizeMode="cover"
              />

              {/* Header Status Row */}
              <View className="flex-row items-center space-x-2 mb-3">
                <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <Text
                  className="text-[9px] font-semibold tracking-[1.2px] uppercase"
                  style={{
                    color: theme.dark ? theme.textSecondary : theme.textMuted,
                  }}
                >
                  FEATURED HUB
                </Text>
                <Text
                  className="text-[10px]"
                  style={{
                    color: theme.dark ? theme.textSecondary : theme.textMuted,
                  }}
                >
                  • Active Discussion
                </Text>
              </View>

              {/* Main Headline */}
              <Text
                className="text-lg font-extrabold mb-1.5 tracking-tight"
                style={{
                  color: theme.text, // Automatically scales correctly across systems
                  lineHeight: 23,
                }}
              >
                Mental Health Support Alliance
              </Text>

              {/* Description Paragraph */}
              <Text
                className="text-xs mb-4"
                style={{
                  color: theme.dark ? theme.textMuted : theme.textSecondary,
                }}
              >
                Connect safely with certified psychiatrists & clinicians from
                LUTH.
              </Text>

              {/* Bottom Control Layer */}
              <View className="flex-row items-center justify-between">
                {/* Profile Avatars Cluster */}
                <View className="flex-row items-center">
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80",
                    }}
                    className="w-7 h-7 rounded-full border-2"
                    style={{ borderColor: theme.surface }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80",
                    }}
                    className="w-7 h-7 rounded-full border-2 -ml-2"
                    style={{ borderColor: theme.surface }}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=40&q=80",
                    }}
                    className="w-7 h-7 rounded-full border-2 -ml-2"
                    style={{ borderColor: theme.surface }}
                  />
                  <View
                    className="w-7 h-7 rounded-full justify-center items-center -ml-2 border-2"
                    style={{
                      backgroundColor: theme.dark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      borderColor: theme.surface,
                    }}
                  >
                    <Text
                      className="text-[9px] font-bold"
                      style={{
                        color: theme.dark
                          ? theme.textSecondary
                          : brandPrimaryColor,
                      }}
                    >
                      +2.4k
                    </Text>
                  </View>
                </View>

                {/* Primary Action Button Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCreateGroup}
                  className="px-4 py-2 rounded-full border border-white"
                  style={{
                    backgroundColor: theme.dark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: brandPrimaryColor,
                    }}
                  >
                    Explore Hub →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ─── SUGGESTED GROUPS (HORIZONTAL ROW) ─── */}
          <View className="flex-row justify-between items-center mt-2 mb-3">
            <Text className="text-base font-bold" style={{ color: theme.text }}>
              Suggested Groups
            </Text>
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Text
                className="text-sm font-semibold"
                style={{ color: brandPrimaryColor }}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={brandPrimaryColor}
                className="p-5"
              />
            ) : suggestedGroups.length > 0 ? (
              suggestedGroups.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  className="items-center mr-5 w-20"
                  onPress={() => handleJoinGroup(item._id)}
                >
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor: theme.dark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    }}
                  >
                    <MaterialIcons
                      name="group"
                      size={24}
                      color={brandPrimaryColor}
                    />
                  </View>
                  <Text
                    className="text-xs text-center w-full font-medium"
                    style={{ color: theme.textSecondary }}
                    numberOfLines={1}
                  >
                    {item.community_name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                No new suggestions found
              </Text>
            )}
          </ScrollView>

          {/* ─── MY COMMUNITIES (VERTICAL LIST ROW) ─── */}
          <View className="flex-row justify-between items-center mt-6 mb-3">
            <Text className="text-base font-bold" style={{ color: theme.text }}>
              My Communities
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  theme.primaryLight || "rgba(59, 130, 246, 0.1)",
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: brandPrimaryColor }}
              >
                {myCommunities.length} Joined
              </Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={brandPrimaryColor}
              className="mt-10"
            />
          ) : myCommunities.length > 0 ? (
            <View
              className={`space-y-3 ${isWeb ? "flex-row flex-wrap gap-5 space-y-0" : ""}`}
            >
              {myCommunities.map((community) => (
                <View
                  key={community._id}
                  className={`flex-row items-center p-3 rounded-xl border-b ${isWeb ? "w-[48%]" : "w-full"}`}
                  style={{ borderColor: theme.border }}
                >
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=80&q=80",
                    }}
                    className="w-10 h-10 rounded-lg mr-3"
                  />
                  <View className="flex-1 mr-2">
                    <Text
                      numberOfLines={1}
                      className="text-[13px] font-bold mb-0.5"
                      style={{ color: theme.text }}
                    >
                      {community.community_name}
                    </Text>
                    <Text
                      className="text-[10px]"
                      style={{ color: theme.textMuted }}
                    >
                      {community.member_count} members •{" "}
                      {community.post_count > 0
                        ? `${community.post_count} posts`
                        : "Up to date"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: theme.dark
                        ? theme.surface
                        : "rgba(0,0,0,0.03)",
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      className="text-[11px] font-bold"
                      style={{ color: brandPrimaryColor }}
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-14">
              <MaterialIcons name="group-off" size={54} color="#D1D5DB" />
              <Text
                className="mt-3 text-sm text-center font-medium"
                style={{ color: theme.textMuted }}
              >
                You haven't joined any communities yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-4">
        {/* Section Header Label */}
        <Text
          className="text-base font-bold mb-3 mt-[22px]"
          style={{ color: theme.text }}
        >
          Suggested Communities
        </Text>

        {/* Horizontal Row Wrapper */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
        >
          {SUGGESTED_COMMUNITIES.map((item) => (
            <View
              key={item.id}
              className="w-[140px] rounded-2xl overflow-hidden border"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderWidth: 1,
              }}
            >
              {/* Image Wrap Container */}
              <View className="w-full h-[85px] relative bg-neutral-200 dark:bg-neutral-800">
                <Image
                  source={{ uri: item.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Image Darkening Overlay Layer */}
                <View
                  className="absolute inset-0 bg-black/10"
                  style={{ opacity: theme.dark ? 0.4 : 0.1 }}
                />
              </View>

              {/* Card Body Context */}
              <View className="p-3 justify-between flex-1">
                <View className="mb-2">
                  <Text
                    numberOfLines={2}
                    className="text-[11.5px] font-extrabold"
                    style={{ color: theme.text, lineHeight: 15 }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-[10px] mt-0.5"
                    style={{ color: theme.textSecondary }}
                  >
                    {item.members}
                  </Text>
                </View>

                {/* Action Interactive Join Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onJoinPress?.(item.id)}
                  className="w-full py-1.5 rounded-xl items-center justify-center border border-white"
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
                    Join
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ─── FLOATING ACTION BUTTON ─── */}
      <TouchableOpacity
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: theme.dark ? brandPrimaryColor : "#FFFFFF",
          shadowColor: theme.dark ? "#000000" : brandPrimaryColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.dark ? 0.5 : 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
        onPress={handleCreateGroup}
      >
        <MaterialIcons
          name="add"
          size={28}
          color={theme.dark ? "#FFFFFF" : "#111827"}
        />
      </TouchableOpacity>
    </View>
  );
}
