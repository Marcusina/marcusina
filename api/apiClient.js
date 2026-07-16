import { Platform } from "react-native";
import { QueryClient } from "@tanstack/react-query";
import config from "../utils/config"; // Adjust paths accordingly to your file hierarchy
import { getToken } from "../utils/storage";

const API_BASE_URL = config.API_BASE_URL;
console.log("---- url ----", API_BASE_URL);

const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", body, headers = {}, ...rest } = options;

  const clientHeaders = {
    ...headers,
  };

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData) {
    clientHeaders["Content-Type"] = "application/json";
  }

  // Automatically attach saved token to Authorization header if not already present
  try {
    const savedToken = await getToken();
    if (
      savedToken &&
      !clientHeaders["Authorization"] &&
      !clientHeaders["authorization"]
    ) {
      clientHeaders["Authorization"] = `Bearer ${savedToken}`;
    }
  } catch (error) {
    console.warn("[apiClient] Failed to retrieve token from storage:", error);
  }

  // If on mobile, set Origin to match backend config's MOBILE_APP_URL
  if (Platform.OS !== "web") {
    clientHeaders["Origin"] = "http://192.168.0.0:8081";
  }

  const requestConfig = {
    method,
    credentials: "include", // Include cookies in requests and responses
    headers: clientHeaders,
    ...rest,
  };

  if (body) {
    if (isFormData) {
      requestConfig.body = body;
      console.log("[API Request Body] FormData payload");
    } else {
      requestConfig.body = JSON.stringify(body);
      console.log("[API Request Body] JSON payload");
    }
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${url}`);
    console.log(`[API Platform] ${Platform.OS}`);

    const response = await fetch(url, requestConfig);
    const textResponse = await response.text();
    console.log("[API Raw Response]");
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
        1. Ensure the backend server is running on the correct port.
        2. Check browser console for CORS errors.
        3. If using a physical device, ensure it's on the same Wi-Fi subnet.
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export { API_BASE_URL, queryClient };
export default apiClient;
