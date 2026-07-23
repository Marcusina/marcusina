import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./stacks/HomeStack";
import HealthStack from "./stacks/HealthStack";
import CommunityStack from "./stacks/CommunityStack";
import MarketplaceStack from "./stacks/MarketplaceStack";
import MeStack from "./stacks/MeStack";

const Tab = createBottomTabNavigator();

// Layout.js (the app's existing chrome) renders the real bottom nav UI as a
// wrapping shell around this navigator, so the built-in tab bar is hidden -
// createBottomTabNavigator is used purely for its per-tab state preservation
// (each tab keeps its own nested stack position when switching away and back).
export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={() => null}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Health" component={HealthStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="Me" component={MeStack} />
    </Tab.Navigator>
  );
}
