import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "medgram_token";
const PROFILE_KEY = "medgram_profile";
const THEME_KEY = "medgram_theme";

// --- TOKEN STORAGE (SECURE) ---
export const saveToken = async (token) => {
  try {
    if (Platform.OS === "web") return;
    if (token === null || token === undefined || token === "undefined" || token === "null" || token === "") {
      await removeToken();
      return;
    }
    // Hardware-encrypted storage on iOS/Android
    await SecureStore.setItemAsync(STORAGE_KEY, token);
  } catch (e) {
    console.error("Error saving token securely", e);
  }
};

export const getToken = async () => {
  try {
    if (Platform.OS === "web") return null;
    // Hardware-encrypted storage on iOS/Android
    const token = await SecureStore.getItemAsync(STORAGE_KEY);
    if (token === "undefined" || token === "null" || token === "") {
      return null;
    }
    return token;
  } catch (e) {
    console.error("Error getting secure token", e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    if (Platform.OS === "web") return;
    // Hardware-encrypted storage on iOS/Android
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch (e) {
    console.error("Error removing secure token", e);
  }
};

// --- PROFILE STORAGE (STANDARD) ---
export const saveProfile = async (profile) => {
  try {
    if (profile === null || profile === undefined) {
      await removeProfile();
      return;
    }
    const data = JSON.stringify(profile);
    if (Platform.OS === "web") {
      localStorage.setItem(PROFILE_KEY, data);
    } else {
      await SecureStore.setItemAsync(PROFILE_KEY, data);
    }
  } catch (e) {
    console.error("Error saving profile", e);
  }
};

export const getProfile = async () => {
  try {
    let data;
    if (Platform.OS === "web") {
      data = localStorage.getItem(PROFILE_KEY);
    } else {
      data = await SecureStore.getItemAsync(PROFILE_KEY);
    }
    if (!data || data === "undefined" || data === "null") {
      return null;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Error getting profile", e);
    return null;
  }
};

export const removeProfile = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(PROFILE_KEY);
    } else {
      await SecureStore.deleteItemAsync(PROFILE_KEY);
    }
  } catch (e) {
    console.error("Error removing profile", e);
  }
};

// --- THEME STORAGE (STANDARD) ---
export const saveTheme = async (theme) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      await SecureStore.setItemAsync(THEME_KEY, theme);
    }
  } catch (e) {
    console.error("Error saving theme", e);
  }
};

export const getTheme = async () => {
  try {
    let theme;
    if (Platform.OS === "web") {
      theme = localStorage.getItem(THEME_KEY);
    } else {
      theme = await SecureStore.getItemAsync(THEME_KEY);
    }
    if (theme === "undefined" || theme === "null") {
      return null;
    }
    return theme;
  } catch (e) {
    console.error("Error getting theme", e);
    return null;
  }
};

// --- PHONE VERIFICATION SKIP STORAGE ---
const SKIP_PHONE_KEY = "medgram_skip_phone";

export const savePhoneSkipped = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(SKIP_PHONE_KEY, "true");
    } else {
      await SecureStore.setItemAsync(SKIP_PHONE_KEY, "true");
    }
  } catch (e) {
    console.error("Error saving phone skip status", e);
  }
};

export const getPhoneSkipped = async () => {
  try {
    let data;
    if (Platform.OS === "web") {
      data = localStorage.getItem(SKIP_PHONE_KEY);
    } else {
      data = await SecureStore.getItemAsync(SKIP_PHONE_KEY);
    }
    return data === "true";
  } catch (e) {
    console.error("Error getting phone skip status", e);
    return false;
  }
};

export const removePhoneSkipped = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(SKIP_PHONE_KEY);
    } else {
      await SecureStore.deleteItemAsync(SKIP_PHONE_KEY);
    }
  } catch (e) {
    console.error("Error removing phone skip status", e);
  }
};

// --- ROLE PROFILE CREATION STORAGE ---
const ROLE_PROFILE_CREATED_KEY = "medgram_role_profile_created";

export const saveRoleProfileCreated = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(ROLE_PROFILE_CREATED_KEY, "true");
    } else {
      await SecureStore.setItemAsync(ROLE_PROFILE_CREATED_KEY, "true");
    }
  } catch (e) {
    console.error("Error saving role profile created status", e);
  }
};

export const getRoleProfileCreated = async () => {
  try {
    let data;
    if (Platform.OS === "web") {
      data = localStorage.getItem(ROLE_PROFILE_CREATED_KEY);
    } else {
      data = await SecureStore.getItemAsync(ROLE_PROFILE_CREATED_KEY);
    }
    return data === "true";
  } catch (e) {
    console.error("Error getting role profile created status", e);
    return false;
  }
};

export const removeRoleProfileCreated = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(ROLE_PROFILE_CREATED_KEY);
    } else {
      await SecureStore.deleteItemAsync(ROLE_PROFILE_CREATED_KEY);
    }
  } catch (e) {
    console.error("Error removing role profile created status", e);
  }
};

// --- PER-APPOINTMENT REMINDER STORAGE (LOCAL-ONLY) ---
// There is no reminder field on the backend Appointment model, so this is a
// genuine on-device preference (via AsyncStorage, not the secure token
// store - it isn't sensitive) rather than a fake persisted-to-backend call.
const APPOINTMENT_REMINDER_PREFIX = "medgram_apt_reminder_";

export const saveAppointmentReminder = async (appointmentId, reminder) => {
  try {
    await AsyncStorage.setItem(
      `${APPOINTMENT_REMINDER_PREFIX}${appointmentId}`,
      JSON.stringify(reminder),
    );
  } catch (e) {
    console.error("Error saving appointment reminder", e);
  }
};

export const getAppointmentReminder = async (appointmentId) => {
  try {
    const data = await AsyncStorage.getItem(`${APPOINTMENT_REMINDER_PREFIX}${appointmentId}`);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error("Error getting appointment reminder", e);
    return null;
  }
};
