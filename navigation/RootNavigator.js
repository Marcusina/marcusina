import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import AuthNavigator from "./AuthNavigator";
import MainStack from "./MainStack";

export default function RootNavigator({ navigationRef }) {
  const { onboardingStep } = useUser();
  const [activeTab, setActiveTab] = useState("Home");

  if (onboardingStep === "completed") {
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
