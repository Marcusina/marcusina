import React from "react";
import { useUser } from "../context/UserContext";
import AuthNavigator from "./AuthNavigator";
import MainStack from "./MainStack";

// Leaf route name (from each stack's own root screen) -> the section name
// Layout's bottom nav / sidebar understands. All five root screens show that
// nav chrome; only Home also shows the top bar (logo/search/notifications/
// avatar) - the other four just use their own in-page header, so there's no
// separate bar floating above them. Every screen pushed deeper (a "sub page")
// is reached via a back button instead and renders its own collapsible
// header locally.
const MAIN_SECTION_ROUTES = {
  HomeIndex: "Home",
  HealthHub: "Health",
  CommunityFeed: "Community",
  MarketplaceIndex: "Marketplace",
  MeHome: "Me",
};

export default function RootNavigator({ navigationRef, currentRouteName }) {
  const { onboardingStep } = useUser();

  if (onboardingStep === "completed") {
    const activeSection = MAIN_SECTION_ROUTES[currentRouteName];
    return (
      <MainStack
        navigationRef={navigationRef}
        showChrome={!!activeSection}
        showTopBar={currentRouteName === "HomeIndex"}
        activeSection={activeSection || "Home"}
      />
    );
  }

  return <AuthNavigator navigationRef={navigationRef} />;
}
