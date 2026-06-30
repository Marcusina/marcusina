import { Platform } from "react-native";
import Constants from "expo-constants";

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// 1. Fetch environment values or fallback safely
const DEV_PORT = process.env.EXPO_PUBLIC_DEV_PORT || "3001";
const FALLBACK_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || `http://localhost:${DEV_PORT}/api/v1`;

const DEV_URLS = {
  ios: process.env.EXPO_PUBLIC_DEV_IP_IOS || "192.168.1.52",
  androidEmulator: "10.0.2.2",
  androidGenymotion: "10.0.3.2",
  androidPhysical:
    process.env.EXPO_PUBLIC_DEV_IP_ANDROID_PHYSICAL || "192.168.1.52",
  web: "localhost",
};

// 2. Resolve target development host dynamically
const getAndroidHost = () => {
  // Expo Router / Modern Expo compatibility (expoConfig), with fallback to manifest
  const debuggerHost =
    Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(":")[0];
  }
  return DEV_URLS.androidEmulator;
};

const getHost = () => {
  if (Platform.OS === "web") return DEV_URLS.web;
  if (Platform.OS === "android") return getAndroidHost();
  return DEV_URLS.ios;
};

// 3. Formulate the running base URL context
const isDev = process.env.NODE_ENV === "development";
const API_BASE_URL = isDev
  ? `http://${getHost()}:${DEV_PORT}/api/v1`
  : FALLBACK_URL;

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  API_BASE_URL,

  //   // App Services
  //   VIDEOCALL_SERVICE_URL: requireEnv("EXPO_PUBLIC_VIDEOCALL_SERVICE_URL"),
  //   VOICECALL_SERVICE_URL: requireEnv("EXPO_PUBLIC_VOICECALL_SERVICE_URL"),

  //   // Public Gateways
  //   STRIPE_PUBLISHABLE_KEY: requireEnv("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  //   PAYSTACK_PUBLIC_KEY: requireEnv("EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY"),
  //   FLW_PUBLIC_KEY: requireEnv("EXPO_PUBLIC_FLW_PUBLIC_KEY"),

  // Socials
  //   GOOGLE_CLIENT_ID: requireEnv("EXPO_PUBLIC_GOOGLE_CLIENT_ID"),
};

export default config;
