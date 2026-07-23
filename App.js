import "./global.css";
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Platform, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
    const loadSavedData = async () => {
      try {
        const savedToken = await getToken();
        const savedProfile = await getProfile();

        if (savedToken) {
          setToken(savedToken);
          setScreen("home");
        }

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

  // Handle Google Redirect on Web
  useEffect(() => {
    if (Platform.OS === "web" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");
      const state = params.get("state");
      if (idToken) {
        // Clear hash from URL for clean appearance
        window.location.hash = "";
        
        // If the state parameter is a deep link (originating from mobile app),
        // redirect back to mobile with the parsed id_token
        if (state && (state.startsWith("exp://") || state.startsWith("medgram://"))) {
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
            
            // Web gets a cookie set by backend, so token will be dummy-token or userToken
            const finalToken = userToken || "dummy-token";
            handleLoginSuccess(userData || { email: "google-user@example.com" }, finalToken);
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

  // Handle incoming deep links (Mobile)
  useEffect(() => {
    if (Platform.OS !== "web") {
      const handleDeepLink = (event) => {
        if (event.url) {
          console.log("[Deep Link Received]", event.url);
          const match = event.url.match(/[?&]id_token=([^&]+)/);
          if (match && match[1]) {
            const idToken = match[1];
            
            const performGoogleLogin = async () => {
              setIsLoading(true);
              try {
                console.log("[Google Auth] Performing deep link Google login");
                const response = await googleLogin(idToken);
                const userData = response.user || response.data?.user;
                const userToken = response.token || response.data?.token;
                
                handleLoginSuccess(userData, userToken);
              } catch (error) {
                console.error("Google login from deep link failed:", error);
                toast.error(error.message || "Google authentication failed");
              } finally {
                setIsLoading(false);
              }
            };
            performGoogleLogin();
          }
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);

      // Check if the app was opened from a deep link
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
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          {isLoading ? (
            <View
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
              <ActivityIndicator size="large" color="#000000" />
              <Text style={{ marginTop: 12, color: "#6B7280" }}>
                Initializing...
              </Text>
            </View>
          ) : isAuthScreen ? (
            <Layout
              currentScreen={screen}
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
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
