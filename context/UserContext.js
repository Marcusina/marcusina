import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, saveToken, removeToken, saveProfile, getProfile, removeProfile, savePhoneSkipped, getPhoneSkipped, removePhoneSkipped, saveRoleProfileCreated, getRoleProfileCreated, removeRoleProfileCreated } from "../utils/storage";
import {
  login as loginApi,
  getCurrentUser,
  getUserProfile,
  getPatientProfile,
  getUserPrescriptions,
  getUserCommunities,
  updateProfile as updateProfileApi,
  getRoleSpecificProfile,
  createRole as createRoleApi,
  createBasicProfile as createBasicProfileApi,
  addPhone as addPhoneApi,
  confirmPhone as confirmPhoneApi,
  createRoleSpecificProfile as createRoleSpecificProfileApi,
  verifyDeviceByOtp as verifyDeviceByOtpApi,
  resendVerifyDeviceOtp as resendVerifyDeviceOtpApi,
  logout as logoutApi,
  getActiveCurrency,
  updateActiveCurrency,
  refreshToken as refreshTokenApi,
} from "../api/auth.api";

const DEFAULT_PROFILE = {
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
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState("splash"); // 'splash' | 'login' | 'select-role' | 'create-basic-profile' | 'verify-phone' | 'create-role-specific-profile' | 'completed' | 'verify-device'
  const [pendingEmail, setPendingEmail] = useState("");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const queryClient = useQueryClient();

  // Load saved profile from storage on mount
  useEffect(() => {
    const loadSavedProfile = async () => {
      try {
        const savedProfile = await getProfile();
        if (savedProfile) {
          setProfile((prev) => ({ ...prev, ...savedProfile }));
        }
      } catch (e) {
        console.error("Error loading saved profile", e);
      } finally {
        setProfileLoading(false);
      }
    };
    loadSavedProfile();
  }, []);

  // Synchronize profile data whenever the authenticated user changes
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
        handle: user.username ? `@${user.username}` : prev.handle,
      }));
    }
  }, [user]);

  // Fetch richer profile/prescriptions/communities data once authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (token && user) {
        try {
          let fullProfile = { ...profile };

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
                handle: user.username ? `@${user.username}` : fullProfile.handle,
              };
            }
          } catch (err) {
            console.log("No user profile found yet or error fetching");
          }

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

          try {
            const prescriptionsData = await getUserPrescriptions(token, user._id);
            fullProfile = {
              ...fullProfile,
              prescriptions: Array.isArray(prescriptionsData) ? prescriptionsData : [],
            };
          } catch (err) {
            console.log("No prescriptions found or error fetching");
          }

          try {
            const communitiesData = await getUserCommunities(token);
            fullProfile = {
              ...fullProfile,
              communities: Array.isArray(communitiesData) ? communitiesData : [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const updateProfileAndSave = async (updated) => {
    if (token) {
      await updateProfileApi(token, updated);
    }
    setProfile(updated);
    await saveProfile(updated);
  };

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          setTokenState(savedToken);
        }
        // On native, auth depends entirely on the Bearer token in SecureStore.
        // With no token the user is logged out, so skip the authed bootstrap
        // (it would only 401 and trigger a spurious logout call). On web, auth
        // rides on httpOnly cookies — getToken() is always null there — so we
        // must still attempt the bootstrap to pick up an existing session.
        if (savedToken || Platform.OS === "web") {
          await fetchUserAndCheckOnboarding();
        } else {
          setOnboardingStep("splash");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load saved token:", err);
        setOnboardingStep("splash");
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const fetchUserAndCheckOnboarding = async () => {
    try {
      setIsLoading(true);
      const res = await getCurrentUser();
      const userData = res.data || res;
      setUser(userData);

      // Check onboarding steps
      // 1. Check if user has a role
      if (!userData.role || !userData.role.role_type) {
        setOnboardingStep("select-role");
        setIsLoading(false);
        return;
      }

      // 2. Check if phone number is verified (unless skipped)
      const phoneSkipped = await getPhoneSkipped();
      if (!userData.is_phone_verified && !phoneSkipped) {
        setOnboardingStep("verify-phone");
        setIsLoading(false);
        return;
      }

      // 3. Check if user has a profile
      if (!userData.profile || !userData.profile.first_name) {
        setOnboardingStep("create-basic-profile");
        setIsLoading(false);
        return;
      }

      // 4. Check if user has a role-specific profile (DoctorProfile, PatientProfile, etc.)
      if (userData.role.role_type !== "admin") {
        const hasCreatedProfile = await getRoleProfileCreated();
        if (!hasCreatedProfile) {
          try {
            const roleProfile = await getRoleSpecificProfile(userData.role.role_type, userData._id);
            const profileData = roleProfile?.data !== undefined ? roleProfile.data : roleProfile;
            if (!profileData) {
              setOnboardingStep("create-role-specific-profile");
              setIsLoading(false);
              return;
            }
          } catch (err) {
            // If 404 or profile not found, they need to create one
            setOnboardingStep("create-role-specific-profile");
            setIsLoading(false);
            return;
          }
        }
      }

      // 5. Check if user has active currency
      try {
        const activeCurrency = await getActiveCurrency();
        if (!activeCurrency || !activeCurrency.currency_code) {
          setOnboardingStep("select-currency");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setOnboardingStep("select-currency");
        setIsLoading(false);
        return;
      }

      // All onboarding complete!
      setOnboardingStep("completed");
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Auto logout if unauthorized or token is invalid/malformed/expired
      const isAuthError =
        error.message.includes("Unauthorized") ||
        error.message.includes("token") ||
        error.message.includes("jwt") ||
        error.message.includes("malformed") ||
        error.message.includes("expired") ||
        error.message.includes("Invalid");

      if (isAuthError) {
        await handleLogout();
      } else {
        setOnboardingStep("splash");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setToken = async (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      await saveToken(newToken);
      if (__DEV__) {
        const persisted = await getToken();
        console.log(
          "[Auth] Token persisted to SecureStore:",
          persisted ? `yes (len ${persisted.length})` : "NO - readback empty",
        );
      }
    } else {
      await removeToken();
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      // Backend returns either { user } (Web) or { user, token } (Mobile),
      // and may wrap the payload in { data: {...} } — match the unwrapping
      // used at every other login call site (App.js, AuthScreens.js).
      const userToken = res.token || res.data?.token;

      setUser(res.user || res.data?.user);
      if (userToken) {
        await setToken(userToken);
      }
      await fetchUserAndCheckOnboarding();
      return { success: true };
    } catch (error) {
      if (error.message.includes("OTP") || error.message.includes("verify") || error.message.includes("device") || error.message.includes("Otp")) {
        // Device verification is required
        setPendingEmail(email);
        setOnboardingStep("verify-device");
        return { success: false, requiresOtp: true };
      }
      throw error;
    }
  };

  const handleVerifyDevice = async (email, otp) => {
    try {
      const activeEmail = email || pendingEmail;
      const res = await verifyDeviceByOtpApi(activeEmail, otp);
      const userToken = res.token || res.data?.token;

      setUser(res.user || res.data?.user);
      if (userToken) {
        await setToken(userToken);
      }
      await fetchUserAndCheckOnboarding();
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const handleResendDeviceOtp = async (email) => {
    const activeEmail = email || pendingEmail;
    return await resendVerifyDeviceOtpApi(activeEmail);
  };

  const handleLogout = async () => {
    // On native there's nothing to revoke server-side without a token, so skip
    // the call (it would only 401). On web the session lives in an httpOnly
    // cookie, so always hit the endpoint to clear it.
    const savedToken = await getToken();
    if (savedToken || Platform.OS === "web") {
      try {
        await logoutApi();
      } catch (e) {
        console.warn("Backend logout failed or session expired:", e);
      }
    }
    setUser(null);
    await setToken(null);
    await removeProfile();
    setProfile(DEFAULT_PROFILE);
    await removePhoneSkipped();
    await removeRoleProfileCreated();
    setOnboardingStep("splash");
    queryClient.clear();
  };

  const skipPhoneVerification = async () => {
    await savePhoneSkipped();
    await fetchUserAndCheckOnboarding();
  };

  const loginWithToken = async (userToken, userData = null) => {
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
    if (userToken) {
      await setToken(userToken);
    } else {
      // ⏳ Introduce a small delay on Web to let the browser commit the httpOnly cookie to the store
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await fetchUserAndCheckOnboarding();
  };

  const submitRole = async (roleType, orgId) => {
    await createRoleApi(roleType, orgId);
    await fetchUserAndCheckOnboarding();
  };

  const submitBasicProfile = async (profileData) => {
    await createBasicProfileApi(profileData);
    await fetchUserAndCheckOnboarding();
  };

  const submitPhone = async (phone) => {
    await addPhoneApi(phone);
  };

  const confirmPhoneOtp = async (otp) => {
    await confirmPhoneApi(otp);
    await fetchUserAndCheckOnboarding();
  };

  const submitRoleSpecificProfile = async (roleData) => {
    if (!user || !user.role) return;
    await createRoleSpecificProfileApi(user.role.role_type, roleData);
    await saveRoleProfileCreated();
    await fetchUserAndCheckOnboarding();
  };

  const submitCurrency = async (currencyCode) => {
    await updateActiveCurrency(currencyCode);
    await fetchUserAndCheckOnboarding();
  };

  const handleRefreshToken = async () => {
    try {
      const res = await refreshTokenApi();
      const newToken = res?.token || res?.data?.token;
      if (newToken) {
        await setToken(newToken);
      }
      await fetchUserAndCheckOnboarding();
      return { success: true };
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        onboardingStep,
        setOnboardingStep,
        pendingEmail,
        setPendingEmail,
        handleLogin,
        handleVerifyDevice,
        handleResendDeviceOtp,
        handleLogout,
        loginWithToken,
        submitRole,
        submitBasicProfile,
        submitPhone,
        confirmPhoneOtp,
        skipPhoneVerification,
        submitRoleSpecificProfile,
        submitCurrency,
        handleRefreshToken,
        refreshUser: () => fetchUserAndCheckOnboarding(),
        profile,
        setProfile,
        profileLoading,
        updateProfileAndSave,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
