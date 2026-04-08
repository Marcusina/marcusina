// api/apiClient.js

/**
 * DEVELOPMENT SETUP:
 * 1. iOS Simulator: Use 'localhost'
 * 2. Android Emulator: Use '10.0.2.2'
 * 3. Physical Device: Use your machine's local IP address (e.g., '192.168.1.5')
 */
const DEV_URLS = {
  ios: 'localhost',
  android: '10.0.2.2',
  physical: 'YOUR_LOCAL_IP' // Replace with your IP for physical device testing
};

const API_BASE_URL = `http://${DEV_URLS.android}:3001/api/v1`;

const apiClient = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
    console.log('[API Request Body]', config.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${url}`);
    
    const response = await fetch(url, config);
    const textResponse = await response.text();
    console.log('[API Raw Response]', textResponse);

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = { message: textResponse };
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `Error ${response.status}: ${textResponse}`);
    }

    return data;
  } catch (error) {
    if (error.message === 'Network request failed') {
      console.error(`
[Network Error] API request failed to reach the server at ${API_BASE_URL}.
Possible solutions:
1. Ensure the backend server is running on port 3001.
2. If using Android Emulator, use '10.0.2.2' instead of 'localhost'.
3. If using a physical device, ensure it's on the same Wi-Fi and use your machine's local IP address.
      `);
    } else {
      console.error(`API Error: ${error.message}`);
    }
    throw error;
  }
};

export { API_BASE_URL };
export default apiClient;
