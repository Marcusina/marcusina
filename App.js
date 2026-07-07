import "./global.css";
import { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Platform, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/apiClient";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider, toast } from "./context/ToastContext";
import { UserProvider, useUser } from "./context/UserContext";
import {
  getCurrentUser,
  updateProfile,
  getUserProfile,
  getPatientProfile,
  getUserPrescriptions,
  getUserCommunities,
  googleLogin,
  logout,
  verifyEmail,
  reactivateAccount,
  deactivateAccount,
} from "./api/auth.api";
import {
  getToken,
  saveToken,
  removeToken,
  getProfile,
  saveProfile,
} from "./utils/storage";
import {
  LoginScreen,
  ProfileBasicsScreen,
  EmailVerifyScreen,
  PhoneVerifyScreen,
  VerificationChoiceScreen,
  ProfileCustomizeScreen,
  NameStepScreen,
  ContactStepScreen,
  LocationStepScreen,
  SuccessScreen,
  WelcomeScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerifyDeviceScreen,
  VerifyEmailLinkScreen,
  ReactivateAccountScreen,
  DeactivateAccountScreen,
} from "./screens/AuthScreens";
import {
  SelectRoleScreen,
  CreateBasicProfileScreen,
  VerifyPhoneScreen,
  CreateRoleSpecificProfileScreen,
  SelectCurrencyScreen,
} from "./screens/OnboardingScreens";
import { SettingsScreen } from "./screens/SettingsScreen";
import { HomeScreen } from "./screens/HomeScreen";
import {
  HealthProfileScreen,
  PublicProfileScreen,
  ProfileScreen,
} from "./screens/ProfileScreen";
import { GroupsScreen } from "./screens/GroupsScreen";
import { PlaceScreen } from "./screens/PlaceScreen";
import { PostScreen } from "./screens/PostScreen";
import { CreatePostScreen } from "./screens/CreatePostScreen";
import {
  ConsultBookingScreen,
  ConsultConfirmScreen,
} from "./screens/ConsultScreens";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const {
    user,
    token,
    isLoading: userLoading,
    onboardingStep,
    setOnboardingStep,
    handleLogin,
    handleLogout,
    refreshUser,
    loginWithToken,
  } = useUser();

  const { theme } = useTheme();
  const verificationStarted = useRef(false);

  const [selectedPostId, setSelectedPostId] = useState("short-2");
  const [screen, setScreen] = useState("splash");
  const [verificationSource, setVerificationSource] = useState("registration"); // 'registration' or 'login'
  const [regEmail, setRegEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    handle: "",
    bio: "",
    bloodType: "",
    height: "",
    weight: "",
    role: "patient",
    prescriptions: [],
    communities: [],
    followers: 0,
    following: 0,
    posts: 0,
    recentActivity: [],
  });

  // Load saved profile on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedProfile = await getProfile();
        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (e) {
        console.error("Error loading saved data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedData();
  }, []);

  // Synchronize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        name:
          `${user.profile?.first_name || ""} ${user.profile?.last_name || ""}`.trim() ||
          user.username ||
          "User",
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        location: user.profile?.location_address || prev.location,
        bio: user.profile?.bio || prev.bio,
        role: user.role?.role_type || prev.role,
      }));
    }
  }, [user]);

  // Handle Google Redirect on Web
  useEffect(() => {
    if (Platform.OS === "web" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");
      const state = params.get("state");
      if (idToken) {
        window.location.hash = "";

        if (
          state &&
          (state.startsWith("exp://") || state.startsWith("medgram://"))
        ) {
          console.log("[Google Auth] Redirecting back to mobile app:", state);
          window.location.href = `${state}?id_token=${idToken}`;
          return;
        }

        const performGoogleLogin = async () => {
          setIsLoading(true);
          try {
            console.log("[Google Auth] Found id_token in redirect URL");
            const response = await googleLogin(idToken);
            const userData = response.user || response.data?.user;
            const userToken = response.token || response.data?.token;

            await handleLoginSuccess(userData, userToken);
          } catch (error) {
            console.error("Google login from redirect failed:", error);
            toast.error(error.message || "Google authentication failed");
          } finally {
            setIsLoading(false);
          }
        };
        performGoogleLogin();
      }
    }
  }, []);

  // Handle Email Verification, Reactivation, Deactivation & Reset Password on Web
  useEffect(() => {
    if (Platform.OS === "web") {
      if (verificationStarted.current) return;

      const queryParams = new URLSearchParams(window.location.search);
      const tokenParam = queryParams.get("token");
      const path = window.location.pathname;

      const hasVerify =
        path.includes("verify-email") ||
        window.location.href.includes("verify-email");
      const hasReactivate =
        path.includes("reactivate") ||
        window.location.href.includes("reactivate");
      const hasReset =
        path.includes("reset-password") ||
        window.location.href.includes("reset-password");
      const hasDeactivate =
        path.includes("deactivate-account") ||
        window.location.href.includes("deactivate-account");

      if (
        (hasVerify || hasReactivate || hasReset || hasDeactivate) &&
        tokenParam
      ) {
        verificationStarted.current = true;
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        setResetToken(tokenParam);

        if (hasVerify) {
          setScreen("verifyEmailLink");
        } else if (hasReactivate) {
          setScreen("reactivateAccount");
        } else if (hasDeactivate) {
          setScreen("deactivateAccount");
        } else if (hasReset) {
          setScreen("resetPassword");
        }
      }
    }
  }, []);

  // Handle incoming deep links (Mobile)
  useEffect(() => {
    if (Platform.OS !== "web") {
      const handleDeepLink = (event) => {
        if (event.url) {
          console.log("[Deep Link Received]", event.url);
          const matchGoogle = event.url.match(/[?&]id_token=([^&]+)/);
          const matchVerifyEmail =
            event.url.match(/verify-email\?token=([^&]+)/) ||
            event.url.match(/[?&]token=([^&]+)/);
          const matchReactivate =
            event.url.match(/reactivate-account\?token=([^&]+)/) ||
            event.url.match(/reactivate\?token=([^&]+)/);
          const matchDeactivate =
            event.url.match(/deactivate-account\?token=([^&]+)/) ||
            event.url.match(/deactivate\?token=([^&]+)/);

          if (matchGoogle && matchGoogle[1]) {
            const idToken = matchGoogle[1];

            const performGoogleLogin = async () => {
              setIsLoading(true);
              try {
                console.log("[Google Auth] Performing deep link Google login");
                const response = await googleLogin(idToken);
                const userData = response.user || response.data?.user;
                const userToken = response.token || response.data?.token;

                await handleLoginSuccess(userData, userToken);
              } catch (error) {
                console.error("Google login from deep link failed:", error);
                toast.error(error.message || "Google authentication failed");
              } finally {
                setIsLoading(false);
              }
            };
            performGoogleLogin();
          } else if (
            matchVerifyEmail &&
            matchVerifyEmail[1] &&
            event.url.includes("verify-email")
          ) {
            setResetToken(matchVerifyEmail[1]);
            setScreen("verifyEmailLink");
          } else if (
            matchReactivate &&
            matchReactivate[1] &&
            (event.url.includes("reactivate-account") ||
              event.url.includes("reactivate"))
          ) {
            setResetToken(matchReactivate[1]);
            setScreen("reactivateAccount");
          } else if (
            matchDeactivate &&
            matchDeactivate[1] &&
            (event.url.includes("deactivate-account") ||
              event.url.includes("deactivate"))
          ) {
            setResetToken(matchDeactivate[1]);
            setScreen("deactivateAccount");
          } else if (
            event.url.includes("reset-password") &&
            event.url.match(/[?&]token=([^&]+)/)
          ) {
            const rToken = event.url.match(/[?&]token=([^&]+)/)[1];
            setResetToken(rToken);
            setScreen("resetPassword");
          }
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  const handleLoginSuccess = async (userData, userToken) => {
    await loginWithToken(userToken);
    setScreen("home");
  };

  useEffect(() => {
    if (onboardingStep === "completed") {
      setScreen("home");
    }
  }, [onboardingStep]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token && user) {
        try {
          let fullProfile = { ...profile };

          // Fetch User Profile
          try {
            const userProfile = await getUserProfile(token, user._id);
            if (userProfile) {
              fullProfile = {
                ...fullProfile,
                name: `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim(),
                bio: userProfile.bio || fullProfile.bio,
                location: userProfile.location_address || fullProfile.location,
                email: user.email || fullProfile.email,
                phone: user.phone_number || fullProfile.phone,
              };
            }
          } catch (err) {
            console.log("No user profile found yet or error fetching");
          }

          // Fetch Patient Profile
          try {
            const patientProfile = await getPatientProfile(token, user._id);
            if (patientProfile) {
              fullProfile = {
                ...fullProfile,
                bloodType: patientProfile.blood_group || fullProfile.bloodType,
                height: patientProfile.height_cm
                  ? patientProfile.height_cm.toString()
                  : fullProfile.height,
                weight: patientProfile.weight_kg
                  ? patientProfile.weight_kg.toString()
                  : fullProfile.weight,
              };
            }
          } catch (err) {
            console.log("No patient profile found yet or error fetching");
          }

          // Fetch User Prescriptions
          try {
            const prescriptionsData = await getUserPrescriptions(
              token,
              user._id,
            );
            fullProfile = {
              ...fullProfile,
              prescriptions: Array.isArray(prescriptionsData)
                ? prescriptionsData
                : [],
            };
          } catch (err) {
            console.log("No prescriptions found or error fetching");
          }

          // Fetch User Communities
          try {
            const communitiesData = await getUserCommunities(token);
            fullProfile = {
              ...fullProfile,
              communities: Array.isArray(communitiesData)
                ? communitiesData
                : [],
            };
          } catch (err) {
            console.log("No communities found or error fetching");
          }

          setProfile(fullProfile);
          await saveProfile(fullProfile);
        } catch (error) {
          console.error("Failed to fetch auxiliary user data:", error);
        }
      }
    };
    fetchUserData();
  }, [token, user]);

  let content = null;

  if (onboardingStep === "completed") {
    // Authenticated Completed flow
    if (screen === "home" || screen === "splash") {
      content = (
        <HomeScreen
          user={user}
          token={token}
          onOpenProfile={() => setScreen("profileHealth")}
          onOpenGroups={() => setScreen("groups")}
          onConsult={() => setScreen("consultBook")}
          onOpenPlace={() => setScreen("place")}
          onOpenPost={(id) => {
            setSelectedPostId(id);
            setScreen("post");
          }}
          onOpenCreatePost={() => setScreen("createPost")}
        />
      );
    } else if (screen === "profileHealth") {
      content = (
        <HealthProfileScreen
          onBackHome={() => setScreen("home")}
          onEditProfile={() => setScreen("profileEdit")}
          onOpenSettings={() => setScreen("settings")}
          profile={profile}
          onLogout={handleLogout}
        />
      );
    } else if (screen === "profilePublic") {
      content = (
        <PublicProfileScreen
          onBackHome={() => setScreen("home")}
          onEditProfile={() => setScreen("profileEdit")}
          profile={profile}
        />
      );
    } else if (screen === "profileEdit") {
      content = (
        <ProfileScreen
          profile={profile}
          onCancel={() => setScreen("profilePublic")}
          onSave={async (updated) => {
            try {
              if (token) {
                await updateProfile(token, updated);
              }
              setProfile(updated);
              await saveProfile(updated);
              setScreen("profilePublic");
            } catch (error) {
              console.error("Failed to update profile:", error);
              toast.error(error.message || "Failed to update profile");
            }
          }}
        />
      );
    } else if (screen === "consultBook") {
      content = (
        <ConsultBookingScreen
          onBack={() => setScreen("home")}
          onProceed={() => setScreen("consultConfirm")}
          onGoHome={() => setScreen("home")}
        />
      );
    } else if (screen === "consultConfirm") {
      content = (
        <ConsultConfirmScreen
          onBack={() => setScreen("consultBook")}
          onDone={() => setScreen("home")}
        />
      );
    } else if (screen === "groups") {
      content = (
        <GroupsScreen
          token={token}
          onBackHome={() => setScreen("home")}
          onOpenConsult={() => setScreen("consultBook")}
          onOpenProfile={() => setScreen("profileHealth")}
        />
      );
    } else if (screen === "place") {
      content = (
        <PlaceScreen
          onBackHome={() => setScreen("home")}
          onOpenConsult={() => setScreen("consultBook")}
          onOpenGroups={() => setScreen("groups")}
          onOpenProfile={() => setScreen("profileHealth")}
        />
      );
    } else if (screen === "post") {
      content = (
        <PostScreen
          initialPostId={selectedPostId}
          onBackHome={() => setScreen("home")}
          onOpenConsult={() => setScreen("consultBook")}
          onOpenGroups={() => setScreen("groups")}
          onOpenProfile={() => setScreen("profileHealth")}
        />
      );
    } else if (screen === "createPost") {
      content = (
        <CreatePostScreen
          onBackHome={() => setScreen("home")}
          onOpenConsult={() => setScreen("consultBook")}
          onOpenGroups={() => setScreen("groups")}
          onOpenProfile={() => setScreen("profileHealth")}
        />
      );
    } else if (screen === "settings") {
      content = <SettingsScreen onBack={() => setScreen("profileHealth")} />;
    } else if (screen === "deactivateAccount") {
      content = (
        <DeactivateAccountScreen
          token={resetToken}
          onBack={() => setScreen("settings")}
        />
      );
    }
  } else {
    // Onboarding flow or guest/welcome flow
    if (onboardingStep === "verify-device") {
      content = (
        <VerifyDeviceScreen
          email={regEmail}
          onBack={() => setOnboardingStep("login")}
          onVerified={() => setOnboardingStep("completed")}
        />
      );
    } else if (onboardingStep === "select-role") {
      content = <SelectRoleScreen />;
    } else if (onboardingStep === "create-basic-profile") {
      content = <CreateBasicProfileScreen />;
    } else if (onboardingStep === "verify-phone") {
      content = <VerifyPhoneScreen />;
    } else if (onboardingStep === "create-role-specific-profile") {
      content = <CreateRoleSpecificProfileScreen />;
    } else if (onboardingStep === "select-currency") {
      content = <SelectCurrencyScreen />;
    } else {
      if (screen === "forgotPassword") {
        content = <ForgotPasswordScreen onBack={() => setScreen("login")} />;
      } else if (screen === "resetPassword") {
        content = (
          <ResetPasswordScreen
            token={resetToken}
            onBack={() => setScreen("login")}
          />
        );
      } else if (screen === "verifyEmailLink") {
        content = (
          <VerifyEmailLinkScreen
            token={resetToken}
            onBack={() => setScreen("login")}
          />
        );
      } else if (screen === "reactivateAccount") {
        content = (
          <ReactivateAccountScreen
            token={resetToken}
            onBack={() => setScreen("login")}
          />
        );
      } else if (screen === "deactivateAccount") {
        content = (
          <DeactivateAccountScreen
            token={resetToken}
            onBack={() => setScreen("login")}
          />
        );
      } else if (screen === "login") {
        content = (
          <LoginScreen
            onSignUp={() => setScreen("profileBasics")}
            onLoginSuccess={handleLoginSuccess}
            onEmailVerifyNeeded={(email) => {
              setRegEmail(email);
              setVerificationSource("login");
              setScreen("emailVerify");
            }}
            onDeviceVerifyNeeded={(email) => {
              setRegEmail(email);
              setOnboardingStep("verify-device");
            }}
            onForgotPassword={() => setScreen("forgotPassword")}
            onBack={() => setScreen("splash")}
          />
        );
      } else if (screen === "profileBasics") {
        content = (
          <ProfileBasicsScreen
            onBack={() => setScreen("splash")}
            onSignIn={() => setScreen("login")}
            onRegisterSuccess={(data) => {
              setRegEmail(data.email);
              setVerificationSource("registration");
              const updated = { ...profile, ...data };
              setProfile(updated);
              saveProfile(updated);
              setScreen("emailVerify");
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      } else if (screen === "emailVerify") {
        content = (
          <EmailVerifyScreen
            email={regEmail}
            onBack={() =>
              setScreen(
                verificationSource === "login" ? "login" : "profileBasics",
              )
            }
            onVerified={() => {
              setScreen("login");
            }}
          />
        );
      } else {
        content = (
          <WelcomeScreen
            onCreateAccount={() => setScreen("profileBasics")}
            onSignIn={() => setScreen("login")}
          />
        );
      }
    }
  }

  const isAuthScreen = onboardingStep !== "completed";

  return (
    <>
      {userLoading || isLoading ? (
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
      ) : !isAuthScreen ? (
        <Layout
          currentScreen={screen === "splash" ? "home" : screen}
          onNavigate={(target) => setScreen(target)}
          userProfile={profile}
          onLogout={handleLogout}
        >
          {content}
        </Layout>
      ) : (
        content || (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Loading App...</Text>
          </View>
        )
      )}
    </>
  );
}
