import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@medgram_token';
const PROFILE_KEY = '@medgram_profile';
const THEME_KEY = '@medgram_theme';

export const saveToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, token);
    }
  } catch (e) {
    console.error('Error saving token', e);
  }
};

export const getToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_KEY);
    } else {
      return await AsyncStorage.getItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error getting token', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error removing token', e);
  }
};

export const saveProfile = async (profile) => {
  try {
    const data = JSON.stringify(profile);
    if (Platform.OS === 'web') {
      localStorage.setItem(PROFILE_KEY, data);
    } else {
      await AsyncStorage.setItem(PROFILE_KEY, data);
    }
  } catch (e) {
    console.error('Error saving profile', e);
  }
};

export const getProfile = async () => {
  try {
    let data;
    if (Platform.OS === 'web') {
      data = localStorage.getItem(PROFILE_KEY);
    } else {
      data = await AsyncStorage.getItem(PROFILE_KEY);
    }
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error getting profile', e);
    return null;
  }
};

export const removeProfile = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(PROFILE_KEY);
    } else {
      await AsyncStorage.removeItem(PROFILE_KEY);
    }
  } catch (e) {
    console.error('Error removing profile', e);
  }
};

export const saveTheme = async (theme) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      await AsyncStorage.setItem(THEME_KEY, theme);
    }
  } catch (e) {
    console.error('Error saving theme', e);
  }
};

export const getTheme = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(THEME_KEY);
    } else {
      return await AsyncStorage.getItem(THEME_KEY);
    }
  } catch (e) {
    console.error('Error getting theme', e);
    return null;
  }
};
