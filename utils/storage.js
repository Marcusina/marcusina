import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "medgram_token";
const PROFILE_KEY = "medgram_profile";
const THEME_KEY = "medgram_theme";

// --- TOKEN STORAGE (SECURE) ---
export const saveToken = async (token) => {
  try {
    if (Platform.OS === "android") {
      // Hardware-encrypted storage on iOS/Android
      await SecureStore.setItemAsync(STORAGE_KEY, token);
    }
  } catch (e) {
    console.error("Error saving token securely", e);
  }
};

export const getToken = async () => {
  try {
    if (Platform.OS === "android") {
      // Hardware-encrypted storage on iOS/Android
      return await SecureStore.getItemAsync(STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error getting secure token", e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    if (Platform.OS === "android") {
      // Hardware-encrypted storage on iOS/Android
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error removing secure token", e);
  }
};

// --- PROFILE STORAGE (STANDARD) ---
export const saveProfile = async (profile) => {
  try {
    const data = JSON.stringify(profile);
    if (Platform.OS === "web") {
      localStorage.setItem(PROFILE_KEY, data);
    } else if (Platform.OS === "android") {
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
    } else if (Platform.OS === "android") {
      data = await SecureStore.getItemAsync(PROFILE_KEY);
    }
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error getting profile", e);
    return null;
  }
};

export const removeProfile = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(PROFILE_KEY);
    } else if (Platform.OS === "android") {
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
    } else if (Platform.OS === "android") {
      await SecureStore.setItemAsync(THEME_KEY, theme);
    }
  } catch (e) {
    console.error("Error saving theme", e);
  }
};

export const getTheme = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(THEME_KEY);
    } else if (Platform.OS === "android") {
      return await SecureStore.getItemAsync(THEME_KEY);
    }
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
    } else if (Platform.OS === "android") {
      await SecureStore.setItemAsync(SKIP_PHONE_KEY, "true");
    }
  } catch (e) {
    console.error("Error saving phone skip status", e);
  }
};

export const getPhoneSkipped = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(SKIP_PHONE_KEY) === "true";
    } else if (Platform.OS === "android") {
      return (await SecureStore.getItemAsync(SKIP_PHONE_KEY)) === "true";
    }
  } catch (e) {
    console.error("Error getting phone skip status", e);
    return false;
  }
};

export const removePhoneSkipped = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(SKIP_PHONE_KEY);
    } else if (Platform.OS === "android") {
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
    } else if (Platform.OS === "android") {
      await SecureStore.setItemAsync(ROLE_PROFILE_CREATED_KEY, "true");
    }
  } catch (e) {
    console.error("Error saving role profile created status", e);
  }
};

export const getRoleProfileCreated = async () => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(ROLE_PROFILE_CREATED_KEY) === "true";
    } else if (Platform.OS === "android") {
      return (
        (await SecureStore.getItemAsync(ROLE_PROFILE_CREATED_KEY)) === "true"
      );
    }
  } catch (e) {
    console.error("Error getting role profile created status", e);
    return false;
  }
};

export const removeRoleProfileCreated = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(ROLE_PROFILE_CREATED_KEY);
    } else if (Platform.OS === "android") {
      await SecureStore.deleteItemAsync(ROLE_PROFILE_CREATED_KEY);
    }
  } catch (e) {
    console.error("Error removing role profile created status", e);
  }
};
