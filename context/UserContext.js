import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, saveToken, removeToken, saveProfile, getProfile, removeProfile, savePhoneSkipped, getPhoneSkipped, removePhoneSkipped, saveRoleProfileCreated, getRoleProfileCreated, removeRoleProfileCreated } from "../utils/storage";
import {
  login as loginApi,
  getCurrentUser,
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
} from "../api/auth.api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState("splash"); // 'splash' | 'login' | 'select-role' | 'create-basic-profile' | 'verify-phone' | 'create-role-specific-profile' | 'completed' | 'verify-device'
  const [pendingEmail, setPendingEmail] = useState("");
  const queryClient = useQueryClient();

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          setTokenState(savedToken);
        }
        await fetchUserAndCheckOnboarding();
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
      // Auto logout if unauthorized
      if (error.message.includes("Unauthorized") || error.message.includes("token")) {
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
    } else {
      await removeToken();
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await loginApi(email, password);
      // Backend returns either { user } (Web) or { user, token } (Mobile)
      const userToken = res.token;
      
      setUser(res.user);
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
      const userToken = res.token;
      
      setUser(res.user);
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
    try {
      await logoutApi();
    } catch (e) {
      console.warn("Backend logout failed or session expired:", e);
    }
    setUser(null);
    await setToken(null);
    await removeProfile();
    await removePhoneSkipped();
    await removeRoleProfileCreated();
    setOnboardingStep("splash");
    queryClient.clear();
  };

  const skipPhoneVerification = async () => {
    await savePhoneSkipped();
    await fetchUserAndCheckOnboarding();
  };

  const loginWithToken = async (userToken) => {
    setUser(null);
    if (userToken) {
      await setToken(userToken);
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

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        onboardingStep,
        setOnboardingStep,
        pendingEmail,
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
        refreshUser: () => fetchUserAndCheckOnboarding(),
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
