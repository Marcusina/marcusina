import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import AuthNavigator from "./AuthNavigator";
import MainStack from "./MainStack";

// TEMPORARY DEV BYPASS - skips the auth/onboarding flow entirely so the app
// opens straight into MainStack for UI review, even with no real login/backend
// session. Flip back to false (or delete this block) before shipping.
const DEV_BYPASS_AUTH = true;

export default function RootNavigator({ navigationRef }) {
  const { onboardingStep } = useUser();
  const [activeTab, setActiveTab] = useState("Home");

  if (DEV_BYPASS_AUTH || onboardingStep === "completed") {
    return (
      <MainStack
        navigationRef={navigationRef}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  return <AuthNavigator navigationRef={navigationRef} />;
}
