import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import {
  WelcomeScreen,
  LoginScreen,
  ProfileBasicsScreen,
  EmailVerifyScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyEmailLinkScreen,
  ReactivateAccountScreen,
  DeactivateAccountScreen,
  VerifyDeviceScreen,
} from "../screens/AuthScreens";
import {
  SelectRoleScreen,
  CreateBasicProfileScreen,
  VerifyPhoneScreen,
  CreateRoleSpecificProfileScreen,
  SelectCurrencyScreen,
} from "../screens/OnboardingScreens";

const Stack = createNativeStackNavigator();

// Screens driven purely by context's onboarding waterfall (see
// UserContext.fetchUserAndCheckOnboarding), not by a direct in-screen
// navigation call. The effect below keeps the navigator in sync whenever
// onboardingStep changes out from under it.
const ONBOARDING_STEP_TO_SCREEN = {
  "verify-device": "VerifyDevice",
  "select-role": "SelectRole",
  "verify-phone": "VerifyPhone",
  "create-basic-profile": "CreateBasicProfile",
  "create-role-specific-profile": "CreateRoleSpecificProfile",
  "select-currency": "SelectCurrency",
};

function WelcomeScreenWrapper({ navigation }) {
  return (
    <WelcomeScreen
      onCreateAccount={() => navigation.navigate("ProfileBasics")}
      onSignIn={() => navigation.navigate("Login")}
    />
  );
}

function LoginScreenWrapper({ navigation }) {
  const { loginWithToken, setOnboardingStep, setPendingEmail } = useUser();
  return (
    <LoginScreen
      onSignUp={() => navigation.navigate("ProfileBasics")}
      onLoginSuccess={async (userData, userToken) => {
        await loginWithToken(userToken, userData);
        // RootNavigator swaps to MainStack automatically once onboardingStep
        // resolves to "completed"; if steps remain, the effect below drives
        // navigation to the right step screen.
      }}
      onEmailVerifyNeeded={(email) =>
        navigation.navigate("EmailVerify", { email, verificationSource: "login" })
      }
      onDeviceVerifyNeeded={(email) => {
        // Keep email in context too, not just route params - handleVerifyDevice
        // / handleResendDeviceOtp fall back to this if params ever get lost.
        setPendingEmail(email);
        setOnboardingStep("verify-device");
        navigation.navigate("VerifyDevice", { email });
      }}
      onForgotPassword={() => navigation.navigate("ForgotPassword")}
      onBack={() => navigation.navigate("Welcome")}
    />
  );
}

function ProfileBasicsScreenWrapper({ navigation }) {
  const { loginWithToken, setProfile, profile } = useUser();
  return (
    <ProfileBasicsScreen
      onBack={() => navigation.navigate("Welcome")}
      onSignIn={() => navigation.navigate("Login")}
      onRegisterSuccess={(data) => {
        const updated = { ...profile, ...data };
        setProfile(updated);
        navigation.navigate("EmailVerify", {
          email: data.email,
          verificationSource: "registration",
        });
      }}
      onLoginSuccess={async (userData, userToken) => {
        await loginWithToken(userToken, userData);
      }}
    />
  );
}

function EmailVerifyScreenWrapper({ route, navigation }) {
  const { email, verificationSource } = route.params || {};
  return (
    <EmailVerifyScreen
      email={email}
      onBack={() =>
        navigation.navigate(
          verificationSource === "login" ? "Login" : "ProfileBasics",
        )
      }
      onVerified={() => navigation.navigate("Login")}
    />
  );
}

function ForgotPasswordScreenWrapper({ navigation }) {
  return <ForgotPasswordScreen onBack={() => navigation.navigate("Login")} />;
}

function ResetPasswordScreenWrapper({ route, navigation }) {
  return (
    <ResetPasswordScreen
      token={route.params?.token}
      onBack={() => navigation.navigate("Login")}
    />
  );
}

function VerifyEmailLinkScreenWrapper({ route, navigation }) {
  return (
    <VerifyEmailLinkScreen
      token={route.params?.token}
      onBack={() => navigation.navigate("Login")}
    />
  );
}

function ReactivateAccountScreenWrapper({ route, navigation }) {
  return (
    <ReactivateAccountScreen
      token={route.params?.token}
      onBack={() => navigation.navigate("Login")}
    />
  );
}

function DeactivateAccountScreenWrapper({ route, navigation }) {
  return (
    <DeactivateAccountScreen
      token={route.params?.token}
      onBack={() => navigation.navigate("Login")}
    />
  );
}

function VerifyDeviceScreenWrapper({ route, navigation }) {
  const { setOnboardingStep, pendingEmail } = useUser();
  return (
    <VerifyDeviceScreen
      email={route.params?.email || pendingEmail}
      onBack={() => {
        setOnboardingStep("splash");
        navigation.navigate("Login");
      }}
      onVerified={() => setOnboardingStep("completed")}
    />
  );
}

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
      }}
    >
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ marginTop: 12, color: theme.textSecondary }}>
        Initializing...
      </Text>
    </View>
  );
}

export default function AuthNavigator({ navigationRef }) {
  const { onboardingStep, isLoading } = useUser();

  useEffect(() => {
    const targetScreen = ONBOARDING_STEP_TO_SCREEN[onboardingStep];
    if (targetScreen) {
      // merge: true is essential here - without it, this navigate() call
      // (which passes no params) replaces any params an explicit caller just
      // set (e.g. LoginScreen's onDeviceVerifyNeeded navigating to
      // VerifyDevice with { email }), wiping them back to undefined.
      navigationRef?.current?.navigate(targetScreen, undefined, { merge: true });
    }
  }, [onboardingStep, navigationRef]);

  // While the initial token/onboarding check is in flight, only the Loading
  // screen is registered - VerifyEmailLink/ResetPassword/etc. deep-link
  // targets intentionally wait (see App.js's pendingAuthNavigation queue)
  // until this resolves and the real screen list below mounts.
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreenWrapper} />
      <Stack.Screen name="Login" component={LoginScreenWrapper} />
      <Stack.Screen name="ProfileBasics" component={ProfileBasicsScreenWrapper} />
      <Stack.Screen name="EmailVerify" component={EmailVerifyScreenWrapper} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreenWrapper} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreenWrapper} />
      <Stack.Screen name="VerifyEmailLink" component={VerifyEmailLinkScreenWrapper} />
      <Stack.Screen name="ReactivateAccount" component={ReactivateAccountScreenWrapper} />
      <Stack.Screen name="DeactivateAccount" component={DeactivateAccountScreenWrapper} />
      <Stack.Screen name="VerifyDevice" component={VerifyDeviceScreenWrapper} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="CreateBasicProfile" component={CreateBasicProfileScreen} />
      <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
      <Stack.Screen
        name="CreateRoleSpecificProfile"
        component={CreateRoleSpecificProfileScreen}
      />
      <Stack.Screen name="SelectCurrency" component={SelectCurrencyScreen} />
    </Stack.Navigator>
  );
}
