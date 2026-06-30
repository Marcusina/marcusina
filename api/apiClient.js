// api/apiClient.js
import { Platform } from "react-native";
import Constants from "expo-constants";

const DEV_URLS = {
  ios: "192.168.1.52", // Local IP for physical iOS devices
  androidEmulator: "10.0.2.2", // Android emulator default
  androidGenymotion: "10.0.3.2", // Genymotion emulator
  androidPhysical: "192.168.1.52", // Local IP for physical Android devices
  web: "localhost",
};

const getHost = () => {
  if (Platform.OS === "web") return DEV_URLS.web;
  
  if (Platform.OS === "android") {
    // Use Expo debugger host when available (in dev mode).
    const debuggerHost = Constants.manifest?.debuggerHost;
    if (debuggerHost) {
      const host = debuggerHost.split(":")[0];
      // If it's localhost or 10.0.2.2, it's emulator. Otherwise, it's physical device IP.
      if (host === "localhost" || host === "10.0.2.2" || host === "127.0.0.1") {
        return DEV_URLS.androidEmulator;
      }
      return host;
    }
    
    // If no debugger host, check if we can detect physical device?
    // For now, let's use androidPhysical as default for physical devices
    // In a real scenario, you might need a way to choose, but let's update to use physical IP
    return DEV_URLS.androidPhysical;
  }
  
  return DEV_URLS.ios;
};

const API_BASE_URL = `http://${getHost()}:3000/api/v1`;
console.log("---- url ----", API_BASE_URL);

const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", body, headers = {}, ...rest } = options;

  const config = {
    method,
    credentials: "include", // 🔑 Include cookies in requests and responses
    headers: {
      "Content-Type": "application/json",
      "X-App-Type": Platform.OS === "web" ? "web" : "mobile",
      ...headers,
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
    console.log("[API Request Body]", config.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${url}`);
    console.log(`[API Platform] ${Platform.OS}`);

    const response = await fetch(url, config);
    const textResponse = await response.text();
    console.log("[API Raw Response]", textResponse);
    console.log("[API Response Status]", response.status, response.statusText);
    console.log("[API Response Headers]", {
      "content-type": response.headers.get("content-type"),
      "access-control-allow-origin": response.headers.get(
        "access-control-allow-origin",
      ),
      "access-control-allow-credentials": response.headers.get(
        "access-control-allow-credentials",
      ),
    });

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = { message: textResponse };
    }

    if (!response.ok) {
      const errorMsg =
        data.message ||
        data.error ||
        data.details ||
        `Error ${response.status}: ${textResponse}`;

      // Only log full error response if it's NOT a "must create profile" message
      if (!errorMsg.includes("create a profile")) {
        console.error(
          "[API Full Error Response]",
          JSON.stringify(data, null, 2),
        );
        console.error("[API Error Final Message]", errorMsg);
      }

      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (
      error.message === "Network request failed" ||
      error.message === "Failed to fetch"
    ) {
      const errorDetails = `
[Network Error] API request failed to reach the server at ${API_BASE_URL}.
Platform: ${Platform.OS}
Possible solutions:
1. Ensure the backend server is running on port 3001.
2. Check browser console for CORS errors.
3. If using a physical device, ensure it's on the same Wi-Fi and use your machine's local IP address.
      `;
      console.error(errorDetails);
      throw new Error(errorDetails);
    } else {
      if (!error.message.includes("create a profile")) {
        console.error(`[API Error] ${error.message}`);
      }
      throw error;
    }
  }
};

export { API_BASE_URL };
export default apiClient;
