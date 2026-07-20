import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../context/UserContext";
import { Layout } from "../components/Layout";
import MainTabNavigator from "./MainTabNavigator";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { CartScreen } from "../screens/CartScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { ConsultBookingScreen, ConsultConfirmScreen } from "../screens/ConsultScreens";

const Stack = createNativeStackNavigator();

function NotificationsScreenWrapper({ navigation }) {
  return <NotificationsScreen onBackHome={() => navigation.goBack()} />;
}

function CartScreenWrapper({ navigation }) {
  return (
    <CartScreen
      onBackHome={() => navigation.goBack()}
      onOpenPlace={() => navigation.navigate("Tabs", { screen: "Marketplace" })}
    />
  );
}

function WishlistScreenWrapper({ navigation }) {
  return (
    <WishlistScreen
      onBackHome={() => navigation.goBack()}
      onOpenPlace={() => navigation.navigate("Tabs", { screen: "Marketplace" })}
    />
  );
}

function ConsultBookingScreenWrapper({ navigation }) {
  return (
    <ConsultBookingScreen
      onBack={() => navigation.goBack()}
      onProceed={() => navigation.navigate("ConsultConfirm")}
      onGoHome={() => navigation.navigate("Tabs", { screen: "Home" })}
    />
  );
}

function ConsultConfirmScreenWrapper({ navigation }) {
  return (
    <ConsultConfirmScreen
      onBack={() => navigation.navigate("ConsultBooking")}
      onDone={() => navigation.navigate("Tabs", { screen: "Home" })}
    />
  );
}

const TAB_NAMES = ["Home", "Health", "Community", "Marketplace", "Me"];

// Explicit, fully-qualified resolution for every id Layout.js's chrome can
// pass to onNavigate. Nested/cross-tab targets are spelled out rather than
// relying on bare `navigate(name)` bubble-up, since that isn't guaranteed to
// find a screen nested inside a currently-inactive tab.
function buildNavigateTargets(navigationRef) {
  const nav = () => navigationRef?.current;
  return {
    Home: () => nav()?.navigate("Tabs", { screen: "Home" }),
    Health: () => nav()?.navigate("Tabs", { screen: "Health" }),
    Community: () => nav()?.navigate("Tabs", { screen: "Community" }),
    Marketplace: () => nav()?.navigate("Tabs", { screen: "Marketplace" }),
    Me: () => nav()?.navigate("Tabs", { screen: "Me" }),
    MeHome: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "MeHome" } }),
    ProfileEdit: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "ProfileEdit" } }),
    Settings: () => nav()?.navigate("Tabs", { screen: "Me", params: { screen: "Settings" } }),
    CreatePost: () =>
      nav()?.navigate("Tabs", { screen: "Community", params: { screen: "CreatePost" } }),
    AppointmentsList: () =>
      nav()?.navigate("Tabs", { screen: "Health", params: { screen: "AppointmentsList" } }),
    Notifications: () => nav()?.navigate("Notifications"),
    Wishlist: () => nav()?.navigate("Wishlist"),
    Cart: () => nav()?.navigate("Cart"),
    ConsultBooking: () => nav()?.navigate("ConsultBooking"),
  };
}

export default function MainStack({ navigationRef, activeTab, setActiveTab }) {
  const { profile, handleLogout } = useUser();
  const navigateTargets = buildNavigateTargets(navigationRef);

  return (
    <Layout
      currentScreen={activeTab}
      onNavigate={(target) => {
        if (TAB_NAMES.includes(target)) {
          setActiveTab(target);
        }
        const resolve = navigateTargets[target];
        if (resolve) {
          resolve();
        } else {
          navigationRef?.current?.navigate(target);
        }
      }}
      userProfile={profile}
      onLogout={handleLogout}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={MainTabNavigator} />
        <Stack.Screen name="Notifications" component={NotificationsScreenWrapper} />
        <Stack.Screen name="Cart" component={CartScreenWrapper} />
        <Stack.Screen name="Wishlist" component={WishlistScreenWrapper} />
        <Stack.Screen name="ConsultBooking" component={ConsultBookingScreenWrapper} />
        <Stack.Screen name="ConsultConfirm" component={ConsultConfirmScreenWrapper} />
      </Stack.Navigator>
    </Layout>
  );
}
