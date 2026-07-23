import "./global.css";
import { useState, useEffect, useRef } from "react";
import { Platform, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/apiClient";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider, toast } from "./context/ToastContext";
import {
  getCurrentUser,
  updateProfile,
  getUserProfile,
  getPatientProfile,
  getUserPrescriptions,
  getUserCommunities,
  googleLogin,
  logout,
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
} from "./screens/AuthScreens";
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
import {
  HealthHubScreen,
  AppointmentsScreen,
  AppointmentDetailScreen,
} from "./screens/HealthScreens";
import { Layout } from "./components/Layout";

export default function App() {
  const [selectedPostId, setSelectedPostId] = useState("short-2");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [screen, setScreen] = useState("splash");
  const [verificationSource, setVerificationSource] = useState("registration"); // 'registration' or 'login'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [regEmail, setRegEmail] = useState("");
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

  // Load saved token and profile on mount
  useEffect(() => {
    if (pendingAuthNavigation && !userLoading) {
      navigationRef.current?.navigate(
        pendingAuthNavigation.screen,
        pendingAuthNavigation.params,
      );
      setPendingAuthNavigation(null);
    }
  }, [pendingAuthNavigation, userLoading]);

  // Handle Google Redirect on Web
  useEffect(() => {
    if (Platform.OS === "web" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");
      const state = params.get("state");
      if (idToken) {
        window.history.replaceState(null, "", window.location.pathname);

        if (
          state &&
          (state.startsWith("exp://") || state.startsWith("medgram://"))
        ) {
          console.log("[Google Auth] Redirecting back to mobile app:", state);
          window.location.href = `${state}?id_token=${idToken}`;
          return;
        }

        const performGoogleLogin = async () => {
          try {
            console.log("[Google Auth] Found id_token in redirect URL");
            const response = await googleLogin(idToken);
            const userData = response.user || response.data?.user;
            const userToken = response.token || response.data?.token;

            await loginWithToken(userToken, userData);
          } catch (error) {
            console.error("Google login from redirect failed:", error);
            toast.error(error.message || "Google authentication failed");
          }
        };
        performGoogleLogin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        if (hasVerify) {
          setPendingAuthNavigation({ screen: "VerifyEmailLink", params: { token: tokenParam } });
        } else if (hasReactivate) {
          setPendingAuthNavigation({ screen: "ReactivateAccount", params: { token: tokenParam } });
        } else if (hasDeactivate) {
          setPendingAuthNavigation({ screen: "DeactivateAccount", params: { token: tokenParam } });
        } else if (hasReset) {
          setPendingAuthNavigation({ screen: "ResetPassword", params: { token: tokenParam } });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              try {
                console.log("[Google Auth] Performing deep link Google login");
                const response = await googleLogin(idToken);
                const userData = response.user || response.data?.user;
                const userToken = response.token || response.data?.token;

                await loginWithToken(userToken, userData);
              } catch (error) {
                console.error("Google login from deep link failed:", error);
                toast.error(error.message || "Google authentication failed");
              }
            };
            performGoogleLogin();
          } else if (
            matchVerifyEmail &&
            matchVerifyEmail[1] &&
            event.url.includes("verify-email")
          ) {
            setPendingAuthNavigation({ screen: "VerifyEmailLink", params: { token: matchVerifyEmail[1] } });
          } else if (
            matchReactivate &&
            matchReactivate[1] &&
            (event.url.includes("reactivate-account") ||
              event.url.includes("reactivate"))
          ) {
            setPendingAuthNavigation({ screen: "ReactivateAccount", params: { token: matchReactivate[1] } });
          } else if (
            matchDeactivate &&
            matchDeactivate[1] &&
            (event.url.includes("deactivate-account") ||
              event.url.includes("deactivate"))
          ) {
            setPendingAuthNavigation({ screen: "DeactivateAccount", params: { token: matchDeactivate[1] } });
          } else if (
            event.url.includes("reset-password") &&
            event.url.match(/[?&]token=([^&]+)/)
          ) {
            const rToken = event.url.match(/[?&]token=([^&]+)/)[1];
            setPendingAuthNavigation({ screen: "ResetPassword", params: { token: rToken } });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSuccess = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await saveToken(userToken);

    if (userData) {
      const updatedProfile = {
        ...profile,
        name: userData.name || profile.name,
        email: userData.email || profile.email,
        phone: userData.phone || profile.phone,
        location: userData.location || profile.location,
        handle: userData.handle || profile.handle,
        bio: userData.bio || profile.bio,
        bloodType: userData.bloodType || profile.bloodType,
        height: userData.height || profile.height,
        weight: userData.weight || profile.weight,
        role: userData.role || profile.role || "patient",
      };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
    setScreen("home");
  };

  const handleLogout = async () => {
    try {
      // Always call the backend logout endpoint (cookies on Web, headers on Mobile)
      await logout(token);
    } catch (e) {
      console.error("Backend logout error:", e);
    } finally {
      try {
        setToken(null);
        setUser(null);
        await removeToken();
        setScreen("splash");
      } catch (e) {
        console.error("Logout error:", e);
      }
    }
  };

  console.log("[App] Rendering screen:", screen);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);

          if (userData && userData._id) {
            let fullProfile = { ...profile };

            // Fetch User Profile
            try {
              const userProfile = await getUserProfile(token, userData._id);
              if (userProfile) {
                fullProfile = {
                  ...fullProfile,
                  name: `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim(),
                  bio: userProfile.bio || fullProfile.bio,
                  location:
                    userProfile.location_address || fullProfile.location,
                  email: userData.email || fullProfile.email,
                  phone: userData.phone_number || fullProfile.phone,
                };
              }
            } catch (err) {
              console.log("No user profile found yet or error fetching");
            }

            // Fetch Patient Profile
            try {
              const patientProfile = await getPatientProfile(
                token,
                userData._id,
              );
              if (patientProfile) {
                fullProfile = {
                  ...fullProfile,
                  bloodType:
                    patientProfile.blood_group || fullProfile.bloodType,
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
                userData._id,
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
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          if (
            error.message.includes("Unauthorized") ||
            error.message.includes("token")
          ) {
            setToken(null);
            setUser(null);
            await removeToken();
            setScreen("login");
          }
        }
      }
    };
    fetchUserData();
  }, [token]);

  let content = null;

  if (screen === "splash") {
    content = (
      <WelcomeScreen
        onCreateAccount={() => setScreen("profileBasics")}
        onSignIn={() => setScreen("login")}
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
        onBack={() => setScreen("splash")}
      />
    );
  } else if (screen === "profileBasics") {
    content = (
      <ProfileBasicsScreen
        onBack={() => setScreen("splash")}
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
  } else if (screen === "verificationChoice") {
    content = (
      <VerificationChoiceScreen
        onBack={() => setScreen("profileBasics")}
        onChooseEmail={() => setScreen("emailVerify")}
        onChoosePhone={() => setScreen("phoneVerify")}
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
          if (verificationSource === "login") {
            // User came from login, go back to login to retry
            setScreen("login");
          } else {
            // User came from registration, proceed to next step
            // If doctor, skip most of the patient onboarding for now or show success
            if (profile.role === "doctor") {
              setScreen("success");
            } else {
              setScreen("profileCustomize");
            }
          }
        }}
      />
    );
  } else if (screen === "phoneVerify") {
    content = (
      <PhoneVerifyScreen
        onBack={() => setScreen("verificationChoice")}
        onVerified={() => setScreen("profileCustomize")}
      />
    );
  } else if (screen === "profileCustomize") {
    content = (
      <ProfileCustomizeScreen
        onBack={() => setScreen("phoneVerify")}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen("name");
        }}
        onSkip={() => setScreen("name")}
      />
    );
  } else if (screen === "name") {
    content = (
      <NameStepScreen
        onBack={() => setScreen("profileCustomize")}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen("contact");
        }}
        onSkip={() => setScreen("success")}
      />
    );
  } else if (screen === "contact") {
    content = (
      <ContactStepScreen
        onBack={() => setScreen("name")}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen("location");
        }}
        onSkip={() => setScreen("success")}
      />
    );
  } else if (screen === "location") {
    content = (
      <LocationStepScreen
        onBack={() => setScreen("contact")}
        onComplete={async (data) => {
          const finalProfile = { ...profile, ...data };
          setProfile(finalProfile);
          await saveProfile(finalProfile);
          try {
            // If we have a token (user is registered/logged in), save to DB
            if (token) {
              await updateProfile(token, finalProfile);
            }
          } catch (error) {
            console.error("Failed to save onboarding data:", error);
          }
          setScreen("success");
        }}
      />
    );
  } else if (screen === "success") {
    content = (
      <SuccessScreen
        onGetStarted={() => setScreen("home")}
        role={profile.role}
      />
    );
  } else if (screen === "home") {
    content = (
      <HomeScreen
        user={user}
        token={token}
        onOpenProfile={() => setScreen("profileHealth")}
        onOpenGroups={() => setScreen("groups")}
        onConsult={() => setScreen("consultBook")}
        onOpenPlace={() => setScreen("place")}
        onOpenPost={(id) => {
          setSelectedPostId(id); // Save targeted item index cleanly
          setScreen("post"); // Fire screen switch routing state update
        }}
        onOpenCreatePost={() => setScreen("createPost")}
        onOpenAppointments={() => setScreen("appointments")}
      />
    );
  } else if (screen === "healthHub") {
    content = (
      <HealthHubScreen
        onOpenAppointments={() => setScreen("appointments")}
        onOpenConsult={() => setScreen("consultBook")}
      />
    );
  } else if (screen === "appointments") {
    content = (
      <AppointmentsScreen
        onBack={() => setScreen("healthHub")}
        onBookNew={() => setScreen("consultBook")}
        onOpenDetail={(id) => {
          setSelectedAppointmentId(id);
          setScreen("appointmentDetail");
        }}
      />
    );
  } else if (screen === "appointmentDetail") {
    content = (
      <AppointmentDetailScreen
        appointmentId={selectedAppointmentId}
        onBack={() => setScreen("appointments")}
        onOpenConsult={() => setScreen("consultBook")}
      />
    );
  } else if (screen === "profileHealth") {
    content = (
      <HealthProfileScreen
        onBackHome={() => setScreen("home")}
        onEditProfile={() => setScreen("profileEdit")}
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
  }

  const authenticatedScreens = [
    "home",
    "profileHealth",
    "profilePublic",
    "profileEdit",
    "consultBook",
    "consultConfirm",
    "healthHub",
    "appointments",
    "appointmentDetail",
    "groups",
    "place",
    "post",
    "createPost",
  ];

  const isAuthScreen = authenticatedScreens.includes(screen);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator navigationRef={navigationRef} />
    </NavigationContainer>
  );
}
