// api/auth.api.js
import apiClient from './apiClient';

export const login = async (email, password) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const register = async (userData) => {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: userData,
  });
};

export const verifyEmailOtp = async (email, otp) => {
  return await apiClient('/verify-email-otp', {
    method: 'POST',
    body: { email, otp },
  });
};

export const checkVerificationStatus = async (email) => {
  return await apiClient(`/check-verification-status?email=${email}`, {
    method: 'GET',
  });
};

export const resendVerificationEmail = async (email) => {
  return await apiClient('/resend-verification', {
    method: 'POST',
    body: { email },
  });
};

export const verifyIdentityByOtp = async (email, otp) => {
  return await apiClient('/auth/verify-identity', {
    method: 'POST',
    body: { email, otp },
  });
};

export const logout = async (token) => {
  return await apiClient('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUser = async (token) => {
  return await apiClient('/get-user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserProfile = async (token, userId) => {
  return await apiClient(`/profiles/${userId}/get`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPatientProfile = async (token, userId) => {
  return await apiClient(`/profiles/patient/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfile = async (token, profileData) => {
  // Split name into first and last
  const nameParts = (profileData.name || '').trim().split(/\s+/);
  const first_name = nameParts[0] || 'User';
  const last_name = nameParts.slice(1).join(' ') || ' ';

  // Prepare general profile data
  const generalProfile = {
    first_name,
    last_name,
    bio: profileData.bio || '',
    location_address: profileData.location || '',
    // These are required by the backend createProfile schema but not in the frontend state
    // We'll use defaults if missing
    preferred_language: 'en',
    timezone: 'UTC',
    gender: 'other',
    date_of_birth: new Date().toISOString(), // Default for now
    location_country: 'Unknown',
    location_state: 'Unknown',
    location_city: 'Unknown',
    postal_code: '00000',
  };

  try {
    // 1. Update general user profile
    // First try to update
    try {
      await apiClient('/profiles/update', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: generalProfile,
      });
    } catch (error) {
      // If profile doesn't exist (404), try to create it
      if (error.message.includes('404') || error.message.includes('not found')) {
        await apiClient('/profiles/create', {
          method: 'POST',
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
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: patientData,
          });
        } catch (error) {
          // If patient profile doesn't exist, create it
          if (error.message.includes('404') || error.message.includes('not found')) {
            await apiClient('/profiles/patient/create', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: { ...patientData, user_id: user._id },
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[API updateProfile Error]', error);
    throw error;
  }
};
