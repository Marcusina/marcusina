import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
  useWindowDimensions,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/Logo";

export function HealthProfileScreen({ onBackHome, onEditProfile, onOpenSettings, profile, onLogout }) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const avatarInitial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "?";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: isWeb ? 20 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {/* Profile Header */}
          <View
            className={`items-center mt-5 mb-8 ${isWeb ? "flex-row justify-start mt-0" : ""}`}
          >
            <View className="relative mb-4 md:mb-0">
              <View
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.surface,
                }}
                className="w-[100px] h-[100px] rounded-full alignItems-center justify-center border-4"
              >
                <Text
                  style={{ color: theme.primary }}
                  className="text-[40px] font-bold"
                >
                  {avatarInitial}
                </Text>
              </View>
              <View
                style={{ backgroundColor: theme.primary }}
                className="absolute -bottom-1 px-2.5 py-1 rounded-xl align-self-center"
              >
                <Text className="color-white text-[10px] font-extrabold">
                  PREMIUM
                </Text>
              </View>
            </View>

            <View
              className={`items-center ${isWeb ? "items-start ml-8 flex-1" : ""}`}
            >
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-bold mb-1"
              >
                {profile.name || "User"}
              </Text>
              <Text style={{ color: theme.textMuted }} className="text-sm mb-4">
                Personal Health Account
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primaryLight,
                }}
                className="flex-row items-center px-4 py-2.5 rounded-xl border"
                onPress={onEditProfile}
              >
                <MaterialIcons
                  name="edit"
                  size={18}
                  color={theme.primary}
                  className="mr-1.5"
                />
                <Text
                  style={{ color: theme.primary }}
                  className="font-semibold text-sm"
                >
                  Edit Health Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          <View
            className={`flex-row justify-between gap-3 mb-8 ${isWeb ? "justify-start gap-5" : ""}`}
          >
            <StatCard
              icon="water_drop"
              value={profile.bloodType || "—"}
              label="Blood Type"
              isWeb={isWeb}
            />
            <StatCard
              icon="straighten"
              value={profile.height || "—"}
              label="Height (cm)"
              isWeb={isWeb}
            />
            <StatCard
              icon="monitor_weight"
              value={profile.weight || "—"}
              label="Weight (kg)"
              isWeb={isWeb}
            />
            {isWeb && (
              <StatCard
                icon="calendar_today"
                value="28y"
                label="Age"
                isWeb={isWeb}
              />
            )}
          </View>

          {/* Medical Records Section Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: theme.text }} className="text-xl font-bold">
              Medical Records
            </Text>
            <TouchableOpacity>
              <Text
                style={{ color: theme.primary }}
                className="text-sm font-semibold"
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Records Grid */}
          <View
            className={`gap-3 mb-8 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}
          >
            <RecordCard
              icon="description"
              title="Medical History"
              subtitle="No recent entries"
              isWeb={isWeb}
            />
            <RecordCard
              icon="medication"
              title="Prescriptions"
              subtitle={`${profile.prescriptions?.length || 0} active scripts`}
              isWeb={isWeb}
            />
            <RecordCard
              icon="science"
              title="Lab Results"
              subtitle="1 new result"
              isWeb={isWeb}
            />
            <RecordCard
              icon="vaccines"
              title="Vaccinations"
              subtitle="Up to date"
              isWeb={isWeb}
            />
          </View>

          {/* Recent Health Activity */}
          <Text
            style={{ color: theme.text }}
            className="text-xl font-bold mb-4"
          >
            Recent Health Activity
          </Text>
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="rounded-2xl p-8 border items-center"
          >
            {profile.recentActivity?.length > 0 ? (
              profile.recentActivity.map((activity, idx) => (
                <View
                  key={idx}
                  style={{ backgroundColor: theme.background }}
                  className="flex-row items-center p-3 rounded-xl mb-3 w-full"
                >
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#10B981"
                  />
                  <Text
                    style={{ color: theme.text }}
                    className="flex-1 text-sm font-medium ml-3"
                  >
                    {activity.title}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs">
                    {activity.date}
                  </Text>
                </View>
              ))
            ) : (
              <View className="items-center">
                <MaterialIcons name="history" size={40} color="#E5E7EB" />
                <Text
                  style={{ color: theme.textMuted }}
                  className="mt-3 text-sm"
                >
                  No recent health activity found.
                </Text>
              </View>
            )}
          </View>

          {/* Settings Card */}
          <Text
            style={{ color: theme.text }}
            className="text-xl font-bold mt-8 mb-4"
          >
            Settings
          </Text>
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="rounded-2xl p-5 border mt-4"
          >
            <View className="flex-col items-stretch">
              {/* Account Settings Link */}
              <TouchableOpacity
                onPress={onOpenSettings}
                className="flex-row items-center justify-between pb-3 mb-3 border-b"
                style={{ borderBottomColor: theme.border }}
              >
                <View className="flex-row items-center gap-3">
                  <MaterialIcons
                    name="settings"
                    size={24}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={{ color: theme.text }}
                    className="text-[15px] font-medium"
                  >
                    Account Settings
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View className="flex-row items-center gap-3 mb-3">
                <MaterialIcons
                  name="color-lens"
                  size={24}
                  color={theme.textSecondary}
                />
                <Text
                  style={{ color: theme.text }}
                  className="text-[15px] font-medium"
                >
                  App Theme
                </Text>
              </View>
              <View className="relative z-50">
                <TouchableOpacity
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                  className="flex-row items-center justify-between border rounded-xl px-4 py-3"
                  activeOpacity={0.8}
                >
                  <Text
                    style={{ color: theme.text }}
                    className="text-[15px] font-medium"
                  >
                    {themeMode === "system"
                      ? "System Default"
                      : themeMode === "light"
                        ? "Light"
                        : "Dark"}
                  </Text>
                  <MaterialIcons
                    name={dropdownOpen ? "arrow-drop-up" : "arrow-drop-down"}
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>

                {dropdownOpen && (
                  <View
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                      ...Platform.select({
                        web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
                      }),
                    }}
                    className="absolute top-[52px] left-0 right-0 border rounded-xl overflow-hidden z-50"
                  >
                    {["system", "light", "dark"].map((mode) => {
                      const isActive = themeMode === mode;
                      return (
                        <TouchableOpacity
                          key={mode}
                          onPress={() => {
                            setThemeMode(mode);
                            setDropdownOpen(false);
                          }}
                          style={{
                            backgroundColor: isActive
                              ? theme.surfaceSubtle
                              : "transparent",
                          }}
                          className="flex-row items-center justify-between px-4 py-3"
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              color: theme.text,
                              fontWeight: isActive ? "600" : "400",
                            }}
                            className={isActive ? "color-primary" : "text-sm"}
                          >
                            {mode === "system"
                              ? "System Default"
                              : mode === "light"
                                ? "Light"
                                : "Dark"}
                          </Text>
                          {isActive && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color={theme.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, isWeb }) {
  const { theme } = useTheme();
  return (
    <View
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className={`flex-1 rounded-2xl p-4 items-center border ${isWeb ? "flex-none min-w-[140px]" : ""}`}
    >
      <View
        style={{ backgroundColor: theme.background }}
        className="w-11 h-11 rounded-xl items-center justify-center mb-3"
      >
        <MaterialIcons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={{ color: theme.text }} className="text-xl font-bold mb-0.5">
        {value}
      </Text>
      <Text
        style={{ color: theme.textMuted }}
        className="text-[11px] font-medium"
      >
        {label}
      </Text>
    </View>
  );
}

function RecordCard({ icon, title, subtitle, isWeb }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className={`flex-row items-center rounded-2xl p-4 border ${isWeb ? "w-[48.5%]" : "w-full"}`}
    >
      <View
        style={{ backgroundColor: theme.primaryLight }}
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
      >
        <MaterialIcons name={icon} size={28} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text
          style={{ color: theme.text }}
          className="text-[15px] font-semibold mb-0.5"
        >
          {title}
        </Text>
        <Text style={{ color: theme.textMuted }} className="text-xs">
          {subtitle}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export function PublicProfileScreen({ onBackHome, onEditProfile, profile }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const avatarInitial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "?";

  return (
    <View className="flex-1 bg-transparent">
      {!isWeb && (
        <View className="flex-row justify-between items-center px-4 py-3">
          <Logo width={36} height={36} />
          <TouchableOpacity
            style={{ backgroundColor: theme.surfaceSubtle }}
            className="ml-4 p-2 rounded-xl"
          >
            <MaterialIcons name="more-vert" size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: isWeb ? 20 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {/* Profile Header Block */}
          <View
            className={`items-center mt-5 mb-8 ${isWeb ? "flex-row justify-start mt-0" : ""}`}
          >
            <View className="relative mb-4 md:mb-0">
              <View
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.surface,
                }}
                className="w-[100px] h-[100px] rounded-full items-center justify-center border-4"
              >
                <Text
                  style={{ color: theme.primary }}
                  className="text-[40px] font-bold"
                >
                  {avatarInitial}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.surface,
                }}
                className="absolute bottom-1 right-1 w-6 h-6 rounded-full items-center justify-center border-[3px]"
              >
                <MaterialIcons name="check" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View
              className={`items-center ${isWeb ? "items-start ml-8 flex-1" : ""}`}
            >
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-bold mb-1"
              >
                {profile.name || "User"}
              </Text>
              <Text
                style={{ color: theme.primary }}
                className="text-16 font-semibold mb-2"
              >
                {profile.handle || "@user_handle"}
              </Text>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm text-center md:text-left mb-5 max-w-[400px] leading-5"
              >
                {profile.bio || "No bio provided yet."}
              </Text>

              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  style={{ backgroundColor: theme.primary }}
                  className="px-8 py-3 rounded-xl"
                >
                  <Text
                    style={{
                      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
                    }}
                    className="font-bold text-[15px]"
                  >
                    Follow
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  className="px-8 py-3 rounded-xl border"
                >
                  <Text
                    style={{ color: theme.text }}
                    className="font-semibold text-[15px]"
                  >
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Social Count Row */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="flex-row justify-around py-5 rounded-2xl mb-8 border"
          >
            <View className="items-center">
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-bold"
              >
                {profile.followers || 0}
              </Text>
              <Text
                style={{ color: theme.textMuted }}
                className="text-[10px] font-bold tracking-widest mt-1"
              >
                FOLLOWERS
              </Text>
            </View>
            <View className="items-center">
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-bold"
              >
                {profile.following || 0}
              </Text>
              <Text
                style={{ color: theme.textMuted }}
                className="text-[10px] font-bold tracking-widest mt-1"
              >
                FOLLOWING
              </Text>
            </View>
            <View className="items-center">
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-bold"
              >
                {profile.posts || 0}
              </Text>
              <Text
                style={{ color: theme.textMuted }}
                className="text-[10px] font-bold tracking-widest mt-1"
              >
                POSTS
              </Text>
            </View>
          </View>

          {/* Communities Slider */}
          <Text
            style={{ color: theme.text }}
            className="text-xl font-bold mb-4"
          >
            Communities
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          >
            {profile.communities && profile.communities.length > 0 ? (
              profile.communities.map((community, i) => (
                <View
                  key={community._id || i}
                  style={{
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primaryLight,
                  }}
                  className="w-15 h-15 rounded-full items-center justify-center border"
                >
                  <Text
                    style={{ color: theme.primary }}
                    className="text-16 font-bold"
                  >
                    {community.name?.charAt(0) || "C"}
                  </Text>
                </View>
              ))
            ) : (
              <View
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primaryLight,
                }}
                className="w-15 h-15 rounded-full items-center justify-center border"
              >
                <MaterialIcons name="groups" size={24} color={theme.primary} />
              </View>
            )}
            <TouchableOpacity
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
              }}
              className="w-15 h-15 rounded-full items-center justify-center border border-dashed"
            >
              <MaterialIcons name="add" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export function ProfileScreen({ profile, onCancel, onSave }) {
  const { theme } = useTheme();
  const [edited, setEdited] = useState({ ...profile });
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;

  return (
    <View className="flex-1 bg-transparent">
      {!isWeb && (
        <View className="flex-row justify-between items-center px-5 py-3">
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-lg font-bold">
            Edit Profile
          </Text>
          <TouchableOpacity onPress={() => onSave(edited)}>
            <Text
              style={{ color: theme.primary }}
              className="text-16 font-bold"
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: isWeb ? 20 : 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {/* Web Custom Header Header */}
          {isWeb && (
            <View className="flex-row justify-between items-center mb-8">
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-extrabold"
              >
                Edit Profile Settings
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  }}
                  className="px-5 py-2.5 rounded-xl border"
                  onPress={onCancel}
                >
                  <Text
                    style={{ color: theme.textSecondary }}
                    className="font-semibold"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: theme.primary }}
                  className="px-5 py-2.5 rounded-xl"
                  onPress={() => onSave(edited)}
                >
                  <Text
                    style={{
                      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
                    }}
                    className="font-bold"
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Content Block */}
          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className={`rounded-2xl p-6 border ${isWeb ? "flex-row flex-wrap gap-5" : ""}`}
          >
            <View className={`mb-5 ${isWeb ? "w-[48.5%]" : "w-full"}`}>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Full Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px]"
                value={edited.name}
                onChangeText={(t) => setEdited({ ...edited, name: t })}
                placeholder="Enter your name"
              />
            </View>

            <View className={`mb-5 ${isWeb ? "w-[48.5%]" : "w-full"}`}>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Username Handle
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px]"
                value={edited.handle}
                onChangeText={(t) => setEdited({ ...edited, handle: t })}
                placeholder="@username"
              />
            </View>

            <View className="w-full mb-5">
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Bio
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px] h-[100px] h-24 align-top"
                value={edited.bio}
                onChangeText={(t) => setEdited({ ...edited, bio: t })}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={3}
              />
            </View>

            <View
              style={{ backgroundColor: theme.border }}
              className="w-full h-[1px] my-3"
            />
            <Text
              style={{ color: theme.text }}
              className="w-full text-16 font-bold mb-4 mt-2"
            >
              Health Information
            </Text>

            <View className={`mb-5 ${isWeb ? "w-[31%]" : "w-full"}`}>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Blood Type
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px]"
                value={edited.bloodType}
                onChangeText={(t) => setEdited({ ...edited, bloodType: t })}
                placeholder="e.g. O+"
              />
            </View>

            <View className={`mb-5 ${isWeb ? "w-[31%]" : "w-full"}`}>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Height (cm)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px]"
                value={edited.height}
                onChangeText={(t) => setEdited({ ...edited, height: t })}
                placeholder="e.g. 175"
                keyboardType="numeric"
              />
            </View>

            <View className={`mb-5 ${isWeb ? "w-[31%]" : "w-full"}`}>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold mb-2"
              >
                Weight (kg)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="rounded-xl px-4 py-3 border text-[15px]"
                value={edited.weight}
                onChangeText={(t) => setEdited({ ...edited, weight: t })}
                placeholder="e.g. 70"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Mobile Footer */}
          {!isWeb && (
            <View className="mt-6 mb-8">
              <TouchableOpacity
                style={{ backgroundColor: theme.primary }}
                className="py-3.5 rounded-xl items-center justify-center"
                onPress={() => onSave(edited)}
              >
                <Text
                  style={{
                    color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
                  }}
                  className="text-16 font-bold"
                >
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
