import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import Logo from "./Logo";

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
      gap: 1,
    },
    sidebarLogo: {
      width: 70,
      height: 40,
      paddingLeft: 1,
    },
    sidebarLogoText: {
      fontSize: 20,

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
      gap: 0.5,
    },
    mobileLogo: {
      width: 40,
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
    mobileHeaderActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    mobileIconButton: {
      position: "relative",
      padding: 6,
      borderRadius: 8,
      marginLeft: 4,
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
    mobileNotificationBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.error,
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
    navFabWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      top: -12,
    },
    navFab: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    fabOverlayContainer: {
      position: "absolute",
      inset: 0,
      justifyContent: "flex-end",
      zIndex: 200,
    },
    fabBackdrop: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    fabSheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 10,
    },
    fabHandle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    fabTitle: {
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.25,
      marginBottom: 16,
    },
    fabGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    fabItem: {
      width: "31%",
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 6,
      alignItems: "center",
      borderWidth: 0.5,
    },
    fabItemIcon: {
      marginBottom: 6,
    },
    fabItemTitle: {
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 2,
    },
    fabItemDesc: {
      fontSize: 9.5,
      textAlign: "center",
    },
    drawerOverlayContainer: {
      position: "absolute",
      inset: 0,
      flexDirection: "row",
      justifyContent: "flex-end",
      zIndex: 200,
    },
    drawerBackdrop: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.48)",
    },
    drawerPane: {
      width: "82%",
      height: "100%",
      shadowColor: "#000",
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 10,
    },
    drawerHeader: {
      paddingTop: 52,
      paddingHorizontal: 20,
      paddingBottom: 22,
    },
    drawerCloseButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    drawerUserRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 18,
    },
    drawerAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 2.5,
      borderColor: "#00C9A7",
    },
    drawerUserName: {
      fontSize: 17,
      fontWeight: "800",
      color: "#FFFFFF",
      letterSpacing: -0.25,
    },
    drawerUserSub: {
      fontSize: 11,
      color: "rgba(255, 255, 255, 0.44)",
      marginTop: 2,
    },
    drawerPillRow: {
      flexDirection: "row",
      gap: 7,
      marginTop: 9,
    },
    drawerPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      borderWidth: 0.5,
    },
    drawerPillText: {
      fontSize: 10,
      fontWeight: "600",
    },
    drawerStats: {
      flexDirection: "row",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      borderRadius: 14,
      overflow: "hidden",
    },
    drawerStat: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRightWidth: 0.5,
      borderRightColor: "rgba(255, 255, 255, 0.08)",
    },
    drawerStatVal: {
      fontSize: 17,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    drawerStatLbl: {
      fontSize: 8.5,
      color: "rgba(255, 255, 255, 0.38)",
      marginTop: 2,
      letterSpacing: 0.4,
      fontWeight: "600",
    },
    drawerSectionTitle: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.4,
      paddingTop: 18,
      paddingHorizontal: 20,
      paddingBottom: 6,
    },
    drawerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      paddingVertical: 13,
      paddingHorizontal: 20,
    },
    drawerItemIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    drawerItemLabel: {
      flex: 1,
    },
    drawerItemTitle: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 1,
    },
    drawerItemDesc: {
      fontSize: 11,
    },
    drawerDivider: {
      height: 0.5,
      marginHorizontal: 20,
    },
    drawerBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
    },
    drawerBadgeText: {
      fontSize: 10,
      fontWeight: "700",
    },
    themeContainer: {
      flexDirection: "row",
      backgroundColor: theme.surfaceSubtle,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 20,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    themeOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    themeOptionActive: {
      backgroundColor: theme.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: theme.border,
    },
    themeOptionText: {
      fontSize: 12,
      fontWeight: "500",
    },
    themeOptionTextActive: {
      fontWeight: "700",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "85%",
      maxWidth: 360,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    modalIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.errorLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 8,
      textAlign: "center",
    },
    modalDescription: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
    modalActions: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalBtnCancel: {
      backgroundColor: theme.surfaceSubtle,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalBtnConfirm: {
      backgroundColor: theme.error,
    },
    modalBtnTextCancel: {
      fontSize: 14,
      fontWeight: "600",
    },
    modalBtnTextConfirm: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
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
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= MOBILE_BREAKPOINT;
  const [fabOpen, setFabOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const desktopNavItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "groups", label: "Spaces", icon: "group" },
    { id: "place", label: "Market", icon: "store" },
    { id: "consultBook", label: "Consult", icon: "medical-services" },
    { id: "profileHealth", label: "Profile", icon: "person" },
  ];

  const mobileNavItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "groups", label: "Spaces", icon: "group" },
    { id: "createPost", label: "Create", icon: "add", isFab: true },
    { id: "place", label: "Market", icon: "store" },
    { id: "consultBook", label: "Consult", icon: "medical-services" },
  ];

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderContent}>
          <Logo width={40} height={40} style={{ marginRight: 6 }} />
          <Text style={styles.sidebarLogoText}>MEDGRAM</Text>
        </View>
      </View>
      <ScrollView style={styles.sidebarNav}>
        {desktopNavItems.map((item) => (
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
        <TouchableOpacity
          style={styles.logoutItem}
          onPress={() => setShowLogoutConfirm(true)}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomNav = () => (
    <SafeAreaView edges={["bottom"]} style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        {mobileNavItems.map((item) => {
          if (item.isFab) {
            return (
              <View key={item.id} style={styles.navFabWrap}>
                <TouchableOpacity
                  onPress={() => setFabOpen(true)}
                  style={[
                    styles.navFab,
                    {
                      backgroundColor:
                        theme.mode === "dark" ? theme.primary : "#000000",
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    color={theme.mode === "dark" ? "#000000" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.bottomNavItem}
              onPress={() => onNavigate(item.id)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={item.icon}
                size={22}
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
          );
        })}
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
                <Logo width={30} height={30} style={{ marginRight: 6 }} />
                <Text style={styles.mobileLogoText}>MEDGRAM</Text>
              </View>
              {/* Actions row: notifications, wishlist, cart, and drawer toggle */}
              <View style={styles.mobileHeaderActions}>
                <TouchableOpacity style={styles.mobileIconButton}>
                  <MaterialIcons
                    name="search"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileIconButton}>
                  <MaterialIcons
                    name="notifications-none"
                    size={20}
                    color={theme.textSecondary}
                  />
                  <View style={styles.mobileNotificationBadge} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileIconButton}>
                  <Ionicons
                    name="heart"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mobileIconButton}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerProfileButton}
                  onPress={() => setDrawerOpen(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>
                      {userProfile?.name?.charAt(0) || "M"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        )}
        {isDesktop && (
          <View style={styles.webHeader}>
            <View style={styles.webHeaderContent}>
              <View style={styles.webHeaderLeft}>
                <Text style={styles.webPageTitle}>
                  {desktopNavItems.find((i) => i.id === currentScreen)?.label ||
                    "Dashboard"}
                </Text>
              </View>
              <View style={styles.webHeaderActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons
                    name="search"
                    size={22}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
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
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={22}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerProfileButton}
                  onPress={() => setDrawerOpen(true)}
                  activeOpacity={0.8}
                >
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

      {/* FAB Overlay Bottom Sheet */}
      {!isDesktop && fabOpen && (
        <View style={styles.fabOverlayContainer}>
          <TouchableOpacity
            style={styles.fabBackdrop}
            activeOpacity={1}
            onPress={() => setFabOpen(false)}
          />
          <View style={[styles.fabSheet, { backgroundColor: theme.surface }]}>
            <View
              style={[styles.fabHandle, { backgroundColor: theme.borderDark }]}
            />
            <Text style={[styles.fabTitle, { color: theme.text }]}>
              What do you want to do?
            </Text>

            <View style={styles.fabGrid}>
              {[
                {
                  label: "Post",
                  desc: "Share health update",
                  icon: "create",
                  screen: "createPost",
                },
                {
                  label: "Connect",
                  desc: "Link external apps",
                  icon: "link",
                  screen: "home",
                },
                {
                  label: "Ask AI",
                  desc: "AI health assistant",
                  icon: "chat",
                  screen: "home",
                },
                {
                  label: "Reel",
                  desc: "Record health reel",
                  icon: "videocam",
                  screen: "home",
                },
                {
                  label: "Poll",
                  desc: "Run a health poll",
                  icon: "poll",
                  screen: "createPost",
                },
                {
                  label: "Record",
                  desc: "Voice health log",
                  icon: "mic",
                  screen: "home",
                },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.fabItem,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    setFabOpen(false);
                    onNavigate(item.screen);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.fabItemIcon}>
                    <MaterialIcons
                      name={item.icon}
                      size={22}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.fabItemTitle, { color: theme.text }]}>
                    {item.label}
                  </Text>
                  <Text
                    style={[styles.fabItemDesc, { color: theme.textMuted }]}
                  >
                    {item.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
      {/* Profile Side Drawer */}
      {drawerOpen && (
        <View style={styles.drawerOverlayContainer}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <View
            style={[
              styles.drawerPane,
              {
                backgroundColor: theme.surface,
                width: isDesktop ? "50%" : "82%",
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.drawerHeader,
                {
                  backgroundColor:
                    theme.mode === "dark" ? "#000000" : "#0A0A0A",
                },
              ]}
            >
              {/* Close Button */}
              <TouchableOpacity
                style={styles.drawerCloseButton}
                onPress={() => setDrawerOpen(false)}
                activeOpacity={0.8}
              >
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.drawerUserRow}>
                <Image
                  source={{
                    uri:
                      userProfile?.avatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                  }}
                  style={styles.drawerAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerUserName}>
                    {userProfile?.name || "Medgram User"}
                  </Text>
                  <Text style={styles.drawerUserSub}>
                    @
                    {userProfile?.name?.toLowerCase().replace(/\s+/g, "") ||
                      "user"}{" "}
                    · Patient
                  </Text>
                  <View style={styles.drawerPillRow}>
                    <View
                      style={[
                        styles.drawerPill,
                        {
                          backgroundColor: "rgba(0,201,167,0.15)",
                          borderColor: "rgba(0,201,167,0.3)",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.drawerPillText, { color: "#00C9A7" }]}
                      >
                        O+ Blood
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.drawerPill,
                        {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderColor: "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.drawerPillText,
                          { color: "rgba(255,255,255,0.5)" },
                        ]}
                      >
                        MG-2025-NG
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.drawerStats}>
                <View style={styles.drawerStat}>
                  <Text style={styles.drawerStatVal}>124</Text>
                  <Text style={styles.drawerStatLbl}>FOLLOWING</Text>
                </View>
                <View style={styles.drawerStat}>
                  <Text style={styles.drawerStatVal}>1.2k</Text>
                  <Text style={styles.drawerStatLbl}>FOLLOWERS</Text>
                </View>
                <View style={[styles.drawerStat, { borderRightWidth: 0 }]}>
                  <Text style={[styles.drawerStatVal, { color: "#00C9A7" }]}>
                    82
                  </Text>
                  <Text style={styles.drawerStatLbl}>HEALTH SCORE</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <Text
                style={[styles.drawerSectionTitle, { color: theme.textMuted }]}
              >
                MY ACCOUNT
              </Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigate("profileHealth");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#E8F5E9" },
                  ]}
                >
                  <MaterialIcons
                    name="person-outline"
                    size={20}
                    color="#0A0A0A"
                  />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    My Profile
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    View public profile &amp; posts
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigate("profileEdit");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#E3F2FD" },
                  ]}
                >
                  <MaterialIcons name="settings" size={20} color="#0A0A0A" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Account Management
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Manage your account details
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigate("profileHealth");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#FFF3E0" },
                  ]}
                >
                  <MaterialIcons
                    name="display-settings"
                    size={20}
                    color="#0A0A0A"
                  />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Settings
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    App preferences &amp; display
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#FCE4EC" },
                  ]}
                >
                  <MaterialIcons name="security" size={20} color="#0A0A0A" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Security
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Password, 2FA, login activity
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <Text
                style={[styles.drawerSectionTitle, { color: theme.textMuted }]}
              >
                APPEARANCE
              </Text>

              <View style={styles.themeContainer}>
                {[
                  { mode: "light", label: "Light", icon: "wb-sunny" },
                  { mode: "dark", label: "Dark", icon: "nights-stay" },
                  { mode: "system", label: "System", icon: "brightness-auto" },
                ].map((item) => {
                  const isActive = themeMode === item.mode;
                  return (
                    <TouchableOpacity
                      key={item.mode}
                      style={[
                        styles.themeOption,
                        isActive && styles.themeOptionActive,
                      ]}
                      onPress={() => setThemeMode(item.mode)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={16}
                        color={isActive ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.themeOptionText,
                          {
                            color: isActive
                              ? theme.primary
                              : theme.textSecondary,
                          },
                          isActive && styles.themeOptionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <Text
                style={[styles.drawerSectionTitle, { color: theme.textMuted }]}
              >
                INTEGRATIONS
              </Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#E8EAF6" },
                  ]}
                >
                  <MaterialIcons name="share" size={20} color="#0A0A0A" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Connections
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Linked devices &amp; integrations
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#E0F7FA" },
                  ]}
                >
                  <MaterialIcons name="devices" size={20} color="#0A0A0A" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Device Info
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Connected health hardware
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <Text
                style={[styles.drawerSectionTitle, { color: theme.textMuted }]}
              >
                HEALTH &amp; BILLING
              </Text>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigate("healthHub");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#E0F2F1" },
                  ]}
                >
                  <MaterialIcons
                    name="health-and-safety"
                    size={20}
                    color="#0A0A0A"
                  />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Health Hub
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Records, care, identity &amp; insights
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                  onNavigate("appointments");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#F3E5F5" },
                  ]}
                >
                  <MaterialIcons name="event" size={20} color="#0A0A0A" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Appointments
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Upcoming &amp; past bookings
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <View
                    style={[
                      styles.drawerBadge,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Text
                      style={[styles.drawerBadgeText, { color: theme.primary }]}
                    >
                      1 Soon
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={theme.textMuted}
                  />
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#FFFDE7" },
                  ]}
                >
                  <MaterialIcons name="star" size={20} color="#FFB800" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text style={[styles.drawerItemTitle, { color: theme.text }]}>
                    Premium
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Upgrade your health experience
                  </Text>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <View
                    style={[styles.drawerBadge, { backgroundColor: "#FFF8E1" }]}
                  >
                    <Text
                      style={[styles.drawerBadgeText, { color: "#FFB800" }]}
                    >
                      PRO
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={theme.textMuted}
                  />
                </View>
              </TouchableOpacity>
              <View
                style={[
                  styles.drawerDivider,
                  { backgroundColor: theme.border },
                ]}
              />

              <TouchableOpacity
                onPress={() => {
                  setDrawerOpen(false);
                  setShowLogoutConfirm(true);
                }}
                activeOpacity={0.7}
                style={[styles.drawerItem, { marginTop: 24, marginBottom: 40 }]}
              >
                <View
                  style={[
                    styles.drawerItemIconWrap,
                    { backgroundColor: "#FFEBEE" },
                  ]}
                >
                  <MaterialIcons name="logout" size={20} color="#FF3B30" />
                </View>
                <View style={styles.drawerItemLabel}>
                  <Text
                    style={[
                      styles.drawerItemTitle,
                      { color: "#FF3B30", fontWeight: "700" },
                    ]}
                  >
                    Logout
                  </Text>
                  <Text
                    style={[styles.drawerItemDesc, { color: theme.textMuted }]}
                  >
                    Sign out of your account
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutConfirm}
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconWrap}>
              <MaterialIcons name="logout" size={28} color={theme.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Log Out
            </Text>
            <Text
              style={[styles.modalDescription, { color: theme.textSecondary }]}
            >
              Are you sure you want to log out of Medgram? You will need to sign
              back in to access your health dashboard.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowLogoutConfirm(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modalBtnTextCancel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnTextConfirm}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
