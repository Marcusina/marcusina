import { Platform } from "react-native";
import config from "../utils/config"; // Adjust paths accordingly to your file hierarchy

const API_BASE_URL = config.API_BASE_URL;
console.log("---- url ----", API_BASE_URL);

const apiClient = async (endpoint, options = {}) => {
  const { method = "GET", body, headers = {}, ...rest } = options;

  const requestConfig = {
    method,
    credentials: "include", // 🔑 Include cookies in requests and responses
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  };

  if (body) {
    requestConfig.body = JSON.stringify(body);
    console.log("[API Request Body]", requestConfig.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${url}`);
    console.log(`[API Platform] ${Platform.OS}`);

    const response = await fetch(url, requestConfig);
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

export { API_BASE_URL };
export default apiClient;
