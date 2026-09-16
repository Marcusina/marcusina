// TEMP DEMO MODE: single on/off switch. When true, context/UserContext.js
// boots straight into a fake logged-in session and api/apiClient.js serves
// canned data from utils/demoData.js instead of hitting a real backend, so
// every screen can be clicked through with realistic-looking content and no
// login/server required. Set to false (or delete demoMode.js/demoData.js and
// revert their imports in UserContext.js and apiClient.js) before merging or
// deploying.
export const DEMO_MODE = true;

export const DEMO_USER_ID = "demo-user-001";
