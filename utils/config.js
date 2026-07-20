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
// Set explicitly (e.g. to a Render URL) to override the local/LAN host
// construction below - takes priority in both dev and prod.
const EXPLICIT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
  const reportedHost = debuggerHost ? debuggerHost.split(":")[0] : null;
  // 127.0.0.1/localhost is never a valid host here: inside the emulator that
  // address is the emulator's own loopback, not the dev machine. Expo reports
  // this when Metro is reached via `adb reverse` (which only forwards the
  // Metro port, not the API port) - fall back to the emulator's dedicated
  // host alias instead of trusting it verbatim.
  if (reportedHost && reportedHost !== "127.0.0.1" && reportedHost !== "localhost") {
    return reportedHost;
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
const API_BASE_URL =
  EXPLICIT_API_BASE_URL ||
  (isDev ? `http://${getHost()}:${DEV_PORT}/api/v1` : `http://localhost:${DEV_PORT}/api/v1`);

const FRONTEND_WEB_URL =
  Platform.OS === "web"
    ? typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:8081"
    : `http://${getHost()}:8081`;

const DEEP_LINK_SCHEME = Platform.OS === "web" ? "" : `exp://${getHost()}:8081`;

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  API_BASE_URL,
  FRONTEND_WEB_URL,
  DEEP_LINK_SCHEME,

  //   // App Services
  //   VIDEOCALL_SERVICE_URL: requireEnv("EXPO_PUBLIC_VIDEOCALL_SERVICE_URL"),
  //   VOICECALL_SERVICE_URL: requireEnv("EXPO_PUBLIC_VOICECALL_SERVICE_URL"),

  //   // Public Gateways
  //   STRIPE_PUBLISHABLE_KEY: requireEnv("EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  //   PAYSTACK_PUBLIC_KEY: requireEnv("EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY"),
  //   FLW_PUBLIC_KEY: requireEnv("EXPO_PUBLIC_FLW_PUBLIC_KEY"),

  // Socials
  // Not required at startup: only needed lazily when the user taps
  // "Sign in with Google" (see screens/AuthScreens.js), so a missing value
  // here shouldn't crash the whole app on boot.
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || null,
};

export default config;
