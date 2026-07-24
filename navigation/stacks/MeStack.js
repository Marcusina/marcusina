import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../../context/UserContext";
import { toast } from "../../context/ToastContext";
import {
  HealthProfileScreen,
  PublicProfileScreen,
  ProfileScreen,
} from "../../screens/ProfileScreen";
import { SettingsScreen } from "../../screens/SettingsScreen";
import ConsentScreen from "../../screens/ConsentScreen";

const Stack = createNativeStackNavigator();

function HealthProfileScreenWrapper({ navigation }) {
  const { profile, handleLogout } = useUser();
  return (
    <HealthProfileScreen
      onBackHome={() => navigation.navigate("Home")}
      onEditProfile={() => navigation.navigate("ProfileEdit")}
      onOpenSettings={() => navigation.navigate("Settings")}
      onOpenIdentity={() => navigation.navigate("DigitalHealthId")}
      onOpenWallet={() => navigation.navigate("WalletHome")}
      onOpenCareCircle={() => navigation.navigate("CareCircleList")}
      onOpenOrganizations={() => navigation.navigate("OrganizationContextSwitcher")}
      onOpenIncomingRequests={() => navigation.navigate("IncomingRequestsQueue")}
      onOpenAvailability={() => navigation.navigate("AvailabilityManager")}
      profile={profile}
      onLogout={handleLogout}
    />
  );
}

function PublicProfileScreenWrapper({ navigation }) {
  const { profile } = useUser();
  return (
    <PublicProfileScreen
      onBackHome={() => navigation.navigate("MeHome")}
      onEditProfile={() => navigation.navigate("ProfileEdit")}
      profile={profile}
    />
  );
}

function ProfileScreenWrapper({ navigation }) {
  const { profile, updateProfileAndSave } = useUser();
  return (
    <ProfileScreen
      profile={profile}
      onCancel={() => navigation.navigate("PublicProfile")}
      onSave={async (updated) => {
        try {
          await updateProfileAndSave(updated);
          navigation.navigate("PublicProfile");
        } catch (error) {
          console.error("Failed to update profile:", error);
          toast.error(error.message || "Failed to update profile");
        }
      }}
    />
  );
}

function SettingsScreenWrapper({ navigation }) {
  return <SettingsScreen onBack={() => navigation.navigate("MeHome")} />;
}

export default function MeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeHome" component={HealthProfileScreenWrapper} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreenWrapper} />
      <Stack.Screen name="ProfileEdit" component={ProfileScreenWrapper} />
      <Stack.Screen name="Settings" component={SettingsScreenWrapper} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
    </Stack.Navigator>
  );
}
