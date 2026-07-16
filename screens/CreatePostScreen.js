import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

export function CreatePostScreen() {
  const { theme } = useTheme();
  const { user } = useUser();

  const userName =
    `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`.trim() ||
    user?.username ||
    "Amara Okonkwo";

  const userAvatar =
    user?.profile?.avatar ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80";

  // Screen layout state tracking
  const [activeTab, setActiveTab] = useState("Post");
  const [postText, setPostText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("#HeartHealth");

  const postTabs = ["Post", "Reel", "Poll", "Article"];
  const healthTopics = [
    "#HeartHealth",
    "#Diabetes",
    "#MentalHealth",
    "#Nutrition",
    "#Fitness",
  ];

  // Semantic styles driven dynamically by the application's underlying context engine
  const isDark = theme.dark;
  const textPrimaryColor = theme.text || (isDark ? "#FFFFFF" : "#0A0A0A");
  const textSecondaryColor =
    theme.textSecondary || (isDark ? "#A3A3A3" : "#545454");
  const textMutedColor = theme.textMuted || (isDark ? "#6B7280" : "#C8C8C8");
  const surfaceBackgroundColor =
    theme.surface || (isDark ? "#171717" : "#F5F5F5");
  const borderLightColor = isDark ? "#262626" : "#E5E5E5";
  const borderMediumColor = isDark ? "#404040" : "#D4D4D4";

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: theme.background || (isDark ? "#0A0A0A" : "#FFFFFF"),
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Top Bar Container */}
        <View
          className="flex-row items-center justify-between h-14 px-4 border-b"
          style={{ borderColor: borderLightColor }}
        >
          <TouchableOpacity activeOpacity={0.7} className="py-2 px-3">
            <Text
              className="text-[13.5px] font-semibold"
              style={{ color: textSecondaryColor }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            className="text-[14px] font-bold"
            style={{ color: textPrimaryColor }}
          >
            New Post
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            className="h-8 px-4 justify-center items-center rounded-full"
            style={{ backgroundColor: isDark ? "#FFFFFF" : "#0A0A0A" }}
          >
            <Text
              className="text-[13px] font-bold"
              style={{ color: isDark ? "#0A0A0A" : "#FFFFFF" }}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Post Type Tabs Section */}
          <View
            className="flex-row px-4 border-b"
            style={{ borderColor: borderLightColor }}
          >
            {postTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab)}
                  className="flex-1 items-center py-3 border-b-2"
                  style={{
                    borderColor: isActive
                      ? isDark
                        ? "#FFFFFF"
                        : "#0A0A0A"
                      : "transparent",
                  }}
                >
                  <Text
                    className="text-[12.5px]"
                    style={{
                      fontWeight: isActive ? "700" : "600",
                      color: isActive ? textPrimaryColor : textSecondaryColor,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Audience Selector Section */}
          <View
            className="flex-row items-center p-[18px] gap-3 border-b"
            style={{ borderColor: borderLightColor }}
          >
            <Image
              source={{
                uri: userAvatar,
              }}
              className="w-9 h-9 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-1 items-start">
              <Text
                className="text-[13px] font-bold mb-1"
                style={{ color: textPrimaryColor }}
              >
                {userName}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: surfaceBackgroundColor,
                  borderColor: borderMediumColor,
                }}
              >
                <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <Path
                    d="M1 8c0-2.2 2.2-4 5-4s5 1.8 5 4"
                    stroke={textPrimaryColor}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <Circle
                    cx="6"
                    cy="4"
                    r="2.2"
                    stroke={textPrimaryColor}
                    strokeWidth="1.2"
                  />
                </Svg>
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: textPrimaryColor }}
                >
                  Everyone
                </Text>
                <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <Path
                    d="M2.5 4L5 6.5 7.5 4"
                    stroke={textPrimaryColor}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Text Input Composition Canvas */}
          <View className="p-[18px] min-h-[120px]">
            <TextInput
              multiline
              placeholder="What's on your health mind today?"
              placeholderTextColor={textMutedColor}
              value={postText}
              onChangeText={setPostText}
              style={{ color: textPrimaryColor }}
              className="text-[15px] font-normal leading-6 min-h-[100px] text-start p-0 m-0"
              textAlignVertical="top"
            />
          </View>

          {/* Media Upload Container Preview Asset Box */}
          <TouchableOpacity
            activeOpacity={0.75}
            className="mx-[18px] mb-4 h-[130px] flex-col items-center justify-center gap-2 rounded-xl"
            style={{
              backgroundColor: surfaceBackgroundColor,
              borderStyle: "dashed",
              borderWidth: 1.5,
              borderColor: borderMediumColor,
            }}
          >
            <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <Rect
                x="2"
                y="4"
                width="24"
                height="20"
                rx="4"
                stroke={textSecondaryColor}
                strokeWidth="1.6"
              />
              <Circle
                cx="9"
                cy="11"
                r="2.5"
                stroke={textSecondaryColor}
                strokeWidth="1.4"
              />
              <Path
                d="M2 20l7-7 5 5 3-3 9 5"
                stroke={textSecondaryColor}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text
              className="text-[12px] font-semibold"
              style={{ color: textSecondaryColor }}
            >
              Add photo or video
            </Text>
          </TouchableOpacity>

          {/* Health Topic Tags Selector Flow Block */}
          <View className="px-[18px] mb-4">
            <Text
              className="text-[10px] font-bold tracking-widest mb-2.5"
              style={{ color: textSecondaryColor }}
            >
              ADD HEALTH TOPIC
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {healthTopics.map((topic) => {
                const isActive = selectedTopic === topic;
                return (
                  <TouchableOpacity
                    key={topic}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTopic(topic)}
                    className="px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: isActive
                        ? "#00A088"
                        : surfaceBackgroundColor,
                      borderColor: isActive ? "#00A088" : borderLightColor,
                    }}
                  >
                    <Text
                      className="text-[11px] font-bold"
                      style={{
                        color: isActive ? "#FFFFFF" : textSecondaryColor,
                      }}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                activeOpacity={0.7}
                className="px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: surfaceBackgroundColor,
                  borderColor: borderLightColor,
                }}
              >
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: textSecondaryColor }}
                >
                  + Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Options Structural Section Panel */}
          <View
            className="border-t p-[18px] flex-col gap-0.5"
            style={{ borderColor: borderLightColor }}
          >
            <Text
              className="text-[10px] font-bold tracking-widest mb-2.5"
              style={{ color: textSecondaryColor }}
            >
              POST OPTIONS
            </Text>

            {/* Row Item: Tag People */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-3 border-b"
              style={{ borderColor: borderLightColor }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: surfaceBackgroundColor }}
                >
                  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <Circle
                      cx="9"
                      cy="6.5"
                      r="3"
                      stroke={textPrimaryColor}
                      strokeWidth="1.4"
                    />
                    <Path
                      d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7"
                      stroke={textPrimaryColor}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <Text
                  className="text-[13.5px] font-semibold"
                  style={{ color: textPrimaryColor }}
                >
                  Tag people
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={borderMediumColor}
              />
            </TouchableOpacity>

            {/* Row Item: Location */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-3 border-b"
              style={{ borderColor: borderLightColor }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: surfaceBackgroundColor }}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={textPrimaryColor}
                  />
                </View>
                <Text
                  className="text-[13.5px] font-semibold"
                  style={{ color: textPrimaryColor }}
                >
                  Add location
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={borderMediumColor}
              />
            </TouchableOpacity>

            {/* Row Item: Doctor Tag Context */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-xl items-center justify-center bg-teal-50 dark:bg-teal-950/40">
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={20}
                    color="#00A088"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[13.5px] font-semibold"
                    style={{ color: textPrimaryColor }}
                  >
                    Tag a doctor
                  </Text>
                  <Text
                    className="text-[10.5px] mt-0.5"
                    style={{ color: textSecondaryColor }}
                  >
                    Adds medical context to your post
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={18}
                color={borderMediumColor}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Horizontal Sticky Toolbar */}
        <View
          className="border-t py-3 px-4 flex-row items-center gap-2.5"
          style={{
            borderColor: borderLightColor,
            backgroundColor:
              theme.background || (isDark ? "#0A0A0A" : "#FFFFFF"),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.2 : 0.04,
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {/* Action Bar Tab Buttons */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <Ionicons
                name="image-outline"
                size={14}
                color={textSecondaryColor}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: textSecondaryColor }}
              >
                Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <Ionicons
                name="videocam-outline"
                size={14}
                color={textSecondaryColor}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: textSecondaryColor }}
              >
                Video
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <MaterialCommunityIcons
                name="chart-gantt"
                size={14}
                color={textSecondaryColor}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: textSecondaryColor }}
              >
                Poll
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <MaterialCommunityIcons
                name="brain"
                size={14}
                color={textSecondaryColor}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: textSecondaryColor }}
              >
                Ask AI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
            >
              <FontAwesome
                name="stethoscope"
                size={13}
                color={textSecondaryColor}
              />
              <Text
                className="text-[11.5px] font-bold"
                style={{ color: textSecondaryColor }}
              >
                Medical
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
