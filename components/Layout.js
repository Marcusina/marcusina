import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const SIDEBAR_WIDTH = 230;
const MOBILE_BREAKPOINT = 768;

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      backgroundColor: theme.background,
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      backgroundColor: theme.surface,
      borderRightWidth: 1,
      borderRightColor: theme.border,
      display: "flex",
    },
    sidebarHeader: {
      padding: 24,
      paddingBottom: 32,
      paddingLeft: 12,
    },
    sidebarHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    sidebarLogo: {
      width: 140,
      height: 40,
      paddingLeft: 1,
    },
    sidebarLogoText: {
      fontSize: 10,

      fontWeight: "800",
      color: theme.text,
    },
    sidebarNav: {
      flex: 1,
      paddingHorizontal: 16,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      marginBottom: 4,
    },
    navItemActive: {
      backgroundColor: theme.primaryLight,
    },
    navIconWrapper: {
      width: 32,
      alignItems: "center",
    },
    navLabel: {
      marginLeft: 8,
      fontSize: 15,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    navLabelActive: {
      color: theme.primary,
      fontWeight: "600",
    },
    sidebarFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    logoutItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: theme.errorLight,
    },
    logoutLabel: {
      marginLeft: 12,
      fontSize: 14,
      color: theme.error,
      fontWeight: "600",
    },
    userProfile: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.background,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: theme.primary,
      fontWeight: "700",
      fontSize: 16,
    },
    userInfo: {
      flex: 1,
      marginLeft: 12,
    },
    userName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    userEmail: {
      fontSize: 12,
      color: theme.textMuted,
    },
    safeHeader: {
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    mobileHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    mobileHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    mobileLogo: {
      width: 120,
      height: 32,
    },
    mobileLogoText: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    mainContent: {
      flex: 1,
      height: "100%",
    },
    webHeader: {
      height: 72,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      justifyContent: "center",
      paddingHorizontal: 32,
      zIndex: 10,
    },
    webHeaderContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: 1400,
      alignSelf: "center",
    },
    webHeaderLeft: {
      flex: 1,
    },
    webPageTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
    },
    webHeaderSearch: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surfaceSubtle,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      marginHorizontal: 32,
      maxWidth: 500,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchPlaceholder: {
      color: theme.textMuted,
      fontSize: 14,
    },
    webHeaderActions: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    iconButton: {
      position: "relative",
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.surface,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    logoutButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.background,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    notificationBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.error,
      borderWidth: 2,
      borderColor: theme.surface,
    },
    headerDivider: {
      width: 1,
      height: 32,
      backgroundColor: theme.divider,
      marginHorizontal: 16,
    },
    headerProfileButton: {
      marginLeft: 4,
    },
    headerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.primaryLight,
    },
    headerAvatarText: {
      color: theme.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    mainArea: {
      flex: 1,
    },
    webMainArea: {
      padding: 32,
    },
    contentContainer: {
      flex: 1,
    },
    webContentContainer: {
      maxWidth: 1400,
      width: "100%",
      alignSelf: "center",
    },
    bottomNavContainer: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    bottomNav: {
      flexDirection: "row",
      height: 64,
      backgroundColor: theme.surface,
      paddingTop: 8,
    },
    bottomNavItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomNavLabel: {
      fontSize: 11,
      marginTop: 4,
      color: theme.textMuted,
      fontWeight: "500",
    },
    bottomNavLabelActive: {
      color: theme.primary,
      fontWeight: "600",
    },
  });
}

export function Layout({
  children,
  currentScreen,
  onNavigate,
  userProfile,
  onLogout,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= MOBILE_BREAKPOINT;

  const navItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "groups", label: "Groups", icon: "group" },
    { id: "place", label: "Market", icon: "store" },
    { id: "consultBook", label: "Consult", icon: "medical-services" },
    { id: "profileHealth", label: "Profile", icon: "person" },
  ];

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderContent}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.sidebarLogo}
            resizeMode="contain"
          />
          <Text style={styles.sidebarLogoText}>MEDGRAM</Text>
        </View>
      </View>
      <ScrollView style={styles.sidebarNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentScreen === item.id && styles.navItemActive,
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <View style={styles.navIconWrapper}>
              <MaterialIcons
                name={item.icon}
                size={22}
                color={
                  currentScreen === item.id
                    ? theme.primary
                    : theme.textSecondary
                }
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === item.id && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sidebarFooter}>
        <TouchableOpacity style={styles.userProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0) || "M"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {userProfile?.name || "Medgram"}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userProfile?.email || ""}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutItem} onPress={onLogout}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomNav = () => (
    <SafeAreaView edges={["bottom"]} style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.bottomNavItem}
            onPress={() => onNavigate(item.id)}
          >
            <MaterialIcons
              name={item.icon}
              size={24}
              color={
                currentScreen === item.id ? theme.primary : theme.textMuted
              }
            />
            <Text
              style={[
                styles.bottomNavLabel,
                currentScreen === item.id && styles.bottomNavLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>
      {isDesktop && renderSidebar()}
      <View style={styles.mainContent}>
        {!isDesktop && (
          <SafeAreaView edges={["top"]} style={styles.safeHeader}>
            <View style={styles.mobileHeader}>
              <View style={styles.mobileHeaderContent}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.mobileLogo}
                  resizeMode="contain"
                />
                <Text style={styles.mobileLogoText}>MEDGRAM</Text>
              </View>
            </View>
          </SafeAreaView>
        )}
        {isDesktop && (
          <View style={styles.webHeader}>
            <View style={styles.webHeaderContent}>
              <View style={styles.webHeaderLeft}>
                <Text style={styles.webPageTitle}>
                  {navItems.find((i) => i.id === currentScreen)?.label ||
                    "Dashboard"}
                </Text>
              </View>
              <View style={styles.webHeaderSearch}>
                <MaterialIcons
                  name="search"
                  size={20}
                  color="#9CA3AF"
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPlaceholder}>Search anything...</Text>
              </View>
              <View style={styles.webHeaderActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons
                    name="notifications-none"
                    size={22}
                    color={theme.textSecondary}
                  />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons
                    name="heart"
                    size={22}
                    color={theme.textSecondary}
                  />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={22}
                    color="#4B5563"
                  />
                </TouchableOpacity>
                <View style={styles.headerDivider} />
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={onLogout}
                >
                  <MaterialIcons name="logout" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerProfileButton}>
                  <View style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>
                      {userProfile?.name?.charAt(0) || "M"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <ScrollView
          style={styles.mainArea}
          contentContainerStyle={[isDesktop && styles.webMainArea]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.contentContainer,
              isDesktop && styles.webContentContainer,
            ]}
          >
            {children}
          </View>
        </ScrollView>
        {!isDesktop && renderBottomNav()}
      </View>
    </View>
  );
}
