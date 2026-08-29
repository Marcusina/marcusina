// api/auth.api.js
import apiClient from "./apiClient";

export const login = async (email, password) => {
  return await apiClient("/auth/login", {
    method: "POST",
    body: { email, password },
  });
};

export const register = async (userData) => {
  return await apiClient("/auth/register", {
    method: "POST",
    body: userData,
  });
};

export const registerDoctor = async (doctorData) => {
  return await apiClient("/doctors/register", {
    method: "POST",
    body: doctorData,
  });
};

export const verifyEmailOtp = async (email, otp) => {
  return await apiClient("/verify-email-otp", {
    method: "POST",
    body: { email, otp },
  });
};

export const checkVerificationStatus = async (email) => {
  return await apiClient(`/check-verification-status?email=${email}`, {
    method: "GET",
  });
};

export const resendVerificationEmail = async (email) => {
  return await apiClient("/resend-verification", {
    method: "POST",
    body: { email },
  });
};

export const verifyIdentityByOtp = async (email, otp) => {
  return await apiClient("/auth/verify-device", {
    method: "POST",
    body: { email, otp },
  });
};

export const googleLogin = async (idToken) => {
  return await apiClient("/auth/google", {
    method: "POST",
    body: { id_token: idToken },
  });
};

export const logout = async (token) => {
  return await apiClient("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUser = async (token) => {
  return await apiClient("/get-user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserProfile = async (token, userId) => {
  try {
    return await apiClient(`/profiles/${userId}/get`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (!error.message.includes("create a profile")) {
      console.error("[API getUserProfile Error]", error);
    }
    return null;
  }
};

export const getPatientProfile = async (token, userId) => {
  try {
    return await apiClient(`/profiles/patient/${userId}`, {
      method: "POST",
      body: {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (!error.message.includes("create a profile")) {
      console.error("[API getPatientProfile Error]", error);
    }
    return null;
  }
};

export const updateProfile = async (token, profileData) => {
  // Split name into first and last
  const nameParts = (profileData.name || "").trim().split(/\s+/);
  const first_name = nameParts[0] || "User";
  const last_name = nameParts.slice(1).join(" ") || " ";

  // Prepare general profile data
  const generalProfile = {
    first_name,
    last_name,
    bio: profileData.bio || "",
    location_address: profileData.location || "",
    // These are required by the backend createProfile schema but not in the frontend state
    // We'll use defaults if missing
    preferred_language: "en",
    timezone: "UTC",
    gender: "other",
    date_of_birth: new Date().toISOString(), // Default for now
    location_country: "Unknown",
    location_state: "Unknown",
    location_city: "Unknown",
    postal_code: "00000",
  };

  try {
    // 1. Update general user profile
    // First try to update
    try {
      await apiClient("/profiles/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: generalProfile,
      });
    } catch (error) {
      // If profile doesn't exist, create it instead.
      if (
        error.message.includes("404") ||
        error.message.includes("not found") ||
        error.message.includes("create a profile") ||
        error.message.includes("You must create a profile")
      ) {
        await apiClient("/profiles/create", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: generalProfile,
        });
      } else {
        throw error;
      }
    }

    // 2. Update health profile (PatientProfile) if we have health data
    if (profileData.bloodType || profileData.height || profileData.weight) {
      // We need the user_id for the patient profile routes.
      // We can get it from the token or by calling get-user if needed.
      // For now, let's try to get the user first to get the _id.
      const user = await getCurrentUser(token);
      if (user && user._id) {
        const patientData = {
          blood_group: profileData.bloodType || null,
          height_cm: profileData.height ? parseFloat(profileData.height) : null,
          weight_kg: profileData.weight ? parseFloat(profileData.weight) : null,
        };

        try {
          await apiClient(`/profiles/patient/${user._id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: patientData,
          });
        } catch (error) {
          // If patient profile doesn't exist, create it
          if (
            error.message.includes("404") ||
            error.message.includes("not found")
          ) {
            await apiClient("/profiles/patient/create", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: { ...patientData, user_id: user._id },
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[API updateProfile Error]", error);
    throw error;
  }
};

/**
 * Fetch user's communities
 */
export const getUserCommunities = async (token) => {
  try {
    return await apiClient("/communities/my", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // Only log if it's NOT the "must create profile" error
    if (!error.message.includes("create a profile")) {
      console.error("[API getUserCommunities Error]", error);
    }
    return []; // Return empty array if error
  }
};

export const refreshToken = async () => {
  return await apiClient("/auth/refresh", {
    method: "POST",
  });
};

export const verifyDeviceByOtp = async (email, otp) => {
  return await apiClient("/auth/verify-device", {
    method: "POST",
    body: { email, otp },
  });
};

export const resendVerifyDeviceOtp = async (email) => {
  return await apiClient("/auth/verify-device/resend", {
    method: "POST",
    body: { email },
  });
};

export const changePassword = async (old_password, new_password) => {
  return await apiClient("/auth/change-password", {
    method: "POST",
    body: { old_password, new_password },
  });
};

export const forgotPassword = async (email) => {
  return await apiClient("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
};

export const resetPassword = async (token, password) => {
  return await apiClient(`/auth/reset-password?token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: { newPassword: password },
  });
};

export const accountDeactivationRequest = async () => {
  return await apiClient("/user/account/deactivate/request", {
    method: "PUT",
  });
};

export const deactivateAccount = async (token) => {
  return await apiClient(`/user/account/deactivate?token=${encodeURIComponent(token)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const reactivateAccount = async (token) => {
  return await apiClient(`/user/account/reactivate?token=${encodeURIComponent(token)}`, {
    method: "PUT",
  });
};

export const sudoRequest = async (actionName = "") => {
  return await apiClient("/sudo/request", {
    method: "POST",
    body: { actionName },
  });
};

export const sudoVerify = async (otp) => {
  return await apiClient("/sudo/verify", {
    method: "POST",
    body: { otp },
  });
};

export const sudoStatus = async () => {
  return await apiClient("/sudo/status", {
    method: "GET",
  });
};

export const createRole = async (role_type, organization_id) => {
  return await apiClient("/roles/create", {
    method: "POST",
    body: { role_type, organization_id: organization_id || null },
  });
};

export const createBasicProfile = async (profileData) => {
  return await apiClient("/profiles/create", {
    method: "PUT",
    body: profileData,
  });
};

export const addPhone = async (phone_number) => {
  return await apiClient("/sms/add-phone", {
    method: "PUT",
    body: { phone_number },
  });
};

export const verifyPhone = async (phone_number) => {
  return await apiClient("/sms/verify-phone", {
    method: "POST",
    body: { phone_number },
  });
};

export const confirmPhone = async (code) => {
  return await apiClient("/sms/confirm-phone", {
    method: "POST",
    body: { code },
  });
};

export const verifyEmail = async (token) => {
  return await apiClient(`/verify-email?token=${token}`, {
    method: "GET",
  });
};

export const getRoleSpecificProfile = async (role, userId) => {
  const normalizedRole = role.toLowerCase().replace(/[^a-z]/g, "");
  const method = normalizedRole === "patient" ? "POST" : "GET";
  return await apiClient(`/profiles/${normalizedRole}/${userId}`, {
    method,
    body: normalizedRole === "patient" ? {} : undefined,
  });
};

export const createRoleSpecificProfile = async (role, profileData) => {
  const normalizedRole = role.toLowerCase().replace(/[^a-z]/g, "");
  const method = normalizedRole === "admin" ? "PUT" : "POST";
  return await apiClient(`/profiles/${normalizedRole}/create`, {
    method,
    body: profileData,
  });
};

export const getSupportedCurrencies = async () => {
  return await apiClient("/users/supported-currencies", {
    method: "GET",
  });
};

export const getActiveCurrency = async () => {
  return await apiClient("/users/currency", {
    method: "GET",
  });
};

export const getCurrencyHistory = async () => {
  return await apiClient("/users/currency/history", {
    method: "GET",
  });
};

export const updateActiveCurrency = async (currencyCode) => {
  return await apiClient("/users/currency", {
    method: "POST",
    body: { currency_code: currencyCode },
  });
};

export const getOrganizationsList = async () => {
  return await apiClient("/organizations?limit=100", {
    method: "GET",
  });
};

