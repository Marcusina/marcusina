import "./global.css";
import { useState, useEffect, useRef } from "react";
import { Platform, Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/apiClient";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider, toast } from "./context/ToastContext";
import { UserProvider, useUser } from "./context/UserContext";
import { googleLogin } from "./api/auth.api";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isLoading: userLoading, loginWithToken } = useUser();
  const navigationRef = useNavigationContainerRef();
  const verificationStarted = useRef(false);
  // Deep-link/redirect handling can be detected immediately, but the actual
  // navigate() call must wait until AuthNavigator has its real screens
  // mounted (it shows a lightweight Loading screen while userLoading is
  // true, during which those routes don't exist yet).
  const [pendingAuthNavigation, setPendingAuthNavigation] = useState(null);

  useEffect(() => {
    if (pendingAuthNavigation && !userLoading) {
      navigationRef.current?.navigate(
        pendingAuthNavigation.screen,
        pendingAuthNavigation.params,
      );
      setPendingAuthNavigation(null);
    }
  }, [pendingAuthNavigation, userLoading]);

  // Handle Google Redirect on Web
  useEffect(() => {
    if (Platform.OS === "web" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get("id_token");
      const state = params.get("state");
      if (idToken) {
        window.history.replaceState(null, "", window.location.pathname);

        if (
          state &&
          (state.startsWith("exp://") || state.startsWith("medgram://"))
        ) {
          console.log("[Google Auth] Redirecting back to mobile app:", state);
          window.location.href = `${state}?id_token=${idToken}`;
          return;
        }

        const performGoogleLogin = async () => {
          try {
            console.log("[Google Auth] Found id_token in redirect URL");
            const response = await googleLogin(idToken);
            const userData = response.user || response.data?.user;
            const userToken = response.token || response.data?.token;

            await loginWithToken(userToken, userData);
          } catch (error) {
            console.error("Google login from redirect failed:", error);
            toast.error(error.message || "Google authentication failed");
          }
        };
        performGoogleLogin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Email Verification, Reactivation, Deactivation & Reset Password on Web
  useEffect(() => {
    if (Platform.OS === "web") {
      if (verificationStarted.current) return;

      const queryParams = new URLSearchParams(window.location.search);
      const tokenParam = queryParams.get("token");
      const path = window.location.pathname;

      const hasVerify =
        path.includes("verify-email") ||
        window.location.href.includes("verify-email");
      const hasReactivate =
        path.includes("reactivate") ||
        window.location.href.includes("reactivate");
      const hasReset =
        path.includes("reset-password") ||
        window.location.href.includes("reset-password");
      const hasDeactivate =
        path.includes("deactivate-account") ||
        window.location.href.includes("deactivate-account");

      if (
        (hasVerify || hasReactivate || hasReset || hasDeactivate) &&
        tokenParam
      ) {
        verificationStarted.current = true;
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        if (hasVerify) {
          setPendingAuthNavigation({ screen: "VerifyEmailLink", params: { token: tokenParam } });
        } else if (hasReactivate) {
          setPendingAuthNavigation({ screen: "ReactivateAccount", params: { token: tokenParam } });
        } else if (hasDeactivate) {
          setPendingAuthNavigation({ screen: "DeactivateAccount", params: { token: tokenParam } });
        } else if (hasReset) {
          setPendingAuthNavigation({ screen: "ResetPassword", params: { token: tokenParam } });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle incoming deep links (Mobile)
  useEffect(() => {
    if (Platform.OS !== "web") {
      const handleDeepLink = (event) => {
        if (event.url) {
          console.log("[Deep Link Received]", event.url);
          const matchGoogle = event.url.match(/[?&]id_token=([^&]+)/);
          const matchVerifyEmail =
            event.url.match(/verify-email\?token=([^&]+)/) ||
            event.url.match(/[?&]token=([^&]+)/);
          const matchReactivate =
            event.url.match(/reactivate-account\?token=([^&]+)/) ||
            event.url.match(/reactivate\?token=([^&]+)/);
          const matchDeactivate =
            event.url.match(/deactivate-account\?token=([^&]+)/) ||
            event.url.match(/deactivate\?token=([^&]+)/);

          if (matchGoogle && matchGoogle[1]) {
            const idToken = matchGoogle[1];

            const performGoogleLogin = async () => {
              try {
                console.log("[Google Auth] Performing deep link Google login");
                const response = await googleLogin(idToken);
                const userData = response.user || response.data?.user;
                const userToken = response.token || response.data?.token;

                await loginWithToken(userToken, userData);
              } catch (error) {
                console.error("Google login from deep link failed:", error);
                toast.error(error.message || "Google authentication failed");
              }
            };
            performGoogleLogin();
          } else if (
            matchVerifyEmail &&
            matchVerifyEmail[1] &&
            event.url.includes("verify-email")
          ) {
            setPendingAuthNavigation({ screen: "VerifyEmailLink", params: { token: matchVerifyEmail[1] } });
          } else if (
            matchReactivate &&
            matchReactivate[1] &&
            (event.url.includes("reactivate-account") ||
              event.url.includes("reactivate"))
          ) {
            setPendingAuthNavigation({ screen: "ReactivateAccount", params: { token: matchReactivate[1] } });
          } else if (
            matchDeactivate &&
            matchDeactivate[1] &&
            (event.url.includes("deactivate-account") ||
              event.url.includes("deactivate"))
          ) {
            setPendingAuthNavigation({ screen: "DeactivateAccount", params: { token: matchDeactivate[1] } });
          } else if (
            event.url.includes("reset-password") &&
            event.url.match(/[?&]token=([^&]+)/)
          ) {
            const rToken = event.url.match(/[?&]token=([^&]+)/)[1];
            setPendingAuthNavigation({ screen: "ResetPassword", params: { token: rToken } });
          }
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);

      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator navigationRef={navigationRef} />
    </NavigationContainer>
  );
}
