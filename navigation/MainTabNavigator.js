import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeStack from "./stacks/HomeStack";
import HealthStack from "./stacks/HealthStack";
import CommunityStack from "./stacks/CommunityStack";
import MarketplaceStack from "./stacks/MarketplaceStack";
import MeStack from "./stacks/MeStack";

const Stack = createNativeStackNavigator();

// Home is the app's hub screen - it's the only one Layout.js draws its chrome
// (top bar / bottom nav / sidebar) around. Health, Community, Marketplace and
// Me are entered by pushing from Home and left with the native back
// gesture/back button, so this is a plain stack (not tabs): that gives every
// section-to-section transition a real animated push/pop instead of an
// instant tab switch.
export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeStack} />
      <Stack.Screen name="Health" component={HealthStack} />
      <Stack.Screen name="Community" component={CommunityStack} />
      <Stack.Screen name="Marketplace" component={MarketplaceStack} />
      <Stack.Screen name="Me" component={MeStack} />
    </Stack.Navigator>
  );
}
