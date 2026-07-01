import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import Logo from "../components/Logo";
import Svg, { Rect, Path } from "react-native-svg";
import config from "../utils/config";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Switch,
  Modal,
  Linking,
} from "react-native";
import {
  login as loginApi,
  register as registerApi,
  registerDoctor as registerDoctorApi,
  verifyEmailOtp as verifyEmailOtpApi,
  resendVerificationEmail,
  verifyIdentityByOtp,
  googleLogin as googleLoginApi,
} from "../api/auth.api";
import { validate } from "../utils/validator";
import { loginSchema, registerSchema } from "../constants/schemas";

function AppHeaderTitle() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.appHeaderContainer}>
      <Logo width={60} height={60} />
    </View>
  );
}

export function WelcomeScreen({ onCreateAccount, onSignIn }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentMaxWidth}>
          {/* Top: Brand Section (takes ~55% of height) */}
          <View
            style={{
              height: 280,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              marginBottom: 20,
            }}
          >
            {/* Subtle geometric SVG accent top-right */}
            <View
              style={{
                position: "absolute",
                top: -24,
                right: -24,
                width: 140,
                height: 140,
                opacity: theme.dark ? 0.15 : 0.05,
                pointerEvents: "none",
              }}
            >
              <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                <Rect
                  x="0"
                  y="0"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
                <Rect
                  x="40"
                  y="0"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
                <Rect
                  x="80"
                  y="0"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
                <Rect
                  x="0"
                  y="40"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
                <Rect
                  x="40"
                  y="40"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
                <Rect
                  x="0"
                  y="80"
                  width="30"
                  height="30"
                  rx="6"
                  stroke={theme.textMuted}
                  strokeWidth="1.2"
                />
              </Svg>
            </View>

            {/* Logo Mark SVG */}
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
                elevation: 5,
              }}
            >
              <Logo width={80} height={80} />
            </View>

            {/* Wordmark & Tagline */}
            <View style={{ marginTop: 22, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 38,
                  fontWeight: "800",
                  color: theme.text,
                  letterSpacing: -1.5,
                  marginBottom: 6,
                }}
              >
                medgram
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: theme.textMuted,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                }}
              >
                The health media made for you
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 0.5,
              backgroundColor: theme.border,
              marginBottom: 24,
            }}
          />

          {/* Value Props */}
          <View style={{ marginBottom: 32, gap: 16 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: theme.surfaceSubtle,
                  borderWidth: 0.5,
                  borderColor: theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="schedule" size={18} color={theme.text} />
              </View>
              <View>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: theme.text }}
                >
                  Book in seconds
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted }}>
                  Consult verified doctors anytime
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: theme.surfaceSubtle,
                  borderWidth: 0.5,
                  borderColor: theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons
                  name="medical-services"
                  size={18}
                  color={theme.text}
                />
              </View>
              <View>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: theme.text }}
                >
                  Your health, centralised
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted }}>
                  Records, meds, labs — one place
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  backgroundColor: theme.surfaceSubtle,
                  borderWidth: 0.5,
                  borderColor: theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="security" size={18} color={theme.text} />
              </View>
              <View>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: theme.text }}
                >
                  Built for the world
                </Text>
                <Text style={{ fontSize: 11, color: theme.textMuted }}>
                  Verified, secure, always available
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={{
              width: "100%",
              height: 56,
              backgroundColor: theme.dark ? "#FFFFFF" : "#0A0A0A",
              borderRadius: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
            onPress={onCreateAccount}
            activeOpacity={0.8}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.dark ? "#0A0A0A" : "#FFFFFF",
              }}
            >
              Create Account
            </Text>
            <MaterialIcons
              name="arrow-forward"
              size={18}
              color={theme.dark ? "#0A0A0A" : "#FFFFFF"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              height: 52,
              backgroundColor: theme.surfaceSubtle,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: theme.border,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onSignIn}
            activeOpacity={0.8}
          >
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: theme.text }}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              fontSize: 11,
              color: theme.textMuted,
              marginTop: 24,
              lineHeight: 17,
            }}
          >
            By continuing you agree to Medgram's{" "}
            <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
              Terms
            </Text>{" "}
            &amp;{" "}
            <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress, disabled }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
      disabled={disabled}
    >
      {typeof label === "string" ? (
        <Text style={styles.primaryButtonLabel}>{label}</Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  rightIcon,
  onRightIconPress,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          style={[
            styles.textInput,
            error && styles.inputError,
            rightIcon && styles.textInputWithIcon,
          ]}
        />
        {rightIcon ? (
          <TouchableOpacity
            style={styles.inputIconButton}
            onPress={onRightIconPress}
            activeOpacity={0.8}
          >
            {typeof rightIcon === "string" ? (
              <Text style={styles.inputIcon}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function CodeInputRow({ length, values, onChange }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const inputs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleTextChange = (text, index) => {
    // Only allow digits
    const cleanText = text.replace(/[^0-9]/g, "");
    if (cleanText.length > 0) {
      const char = cleanText[cleanText.length - 1];
      const nextValues = [...values];
      nextValues[index] = char;
      onChange(nextValues);

      // Focus next if not at the end
      if (index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      // Handle deletion
      const nextValues = [...values];
      nextValues[index] = "";
      onChange(nextValues);
    }
  };

  const handleKeyPress = (e, index) => {
    // On backspace, focus previous if current is empty
    if (
      e.nativeEvent.key === "Backspace" &&
      values[index] === "" &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.codeRow}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          value={values[index]}
          onChangeText={(text) => handleTextChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.codeBox,
            values[index] && styles.codeBoxFilled,
            focusedIndex === index && styles.codeBoxFocused,
          ]}
        />
      ))}
    </View>
  );
}

function StepHeader({
  stepIndex,
  totalSteps,
  title,
  showSkip,
  onBack,
  onSkip,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const progress = (stepIndex / totalSteps) * 100;

  return (
    <View style={styles.stepHeaderContainer}>
      <View style={styles.stepHeaderTopRow}>
        <TouchableOpacity onPress={onBack} hitSlop={16}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepHeaderStepText}>{title}</Text>
        {showSkip ? (
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

// Helper function for showing alerts on both web and mobile
function showAlert(title, message, onDismiss = null) {
  let type = "info";
  const titleLower = title ? title.toLowerCase() : "";
  if (titleLower.includes("success") || titleLower.includes("complete")) {
    type = "success";
  } else if (
    titleLower.includes("error") ||
    titleLower.includes("fail") ||
    titleLower.includes("invalid") ||
    titleLower.includes("denied")
  ) {
    type = "error";
  } else if (titleLower.includes("warning") || titleLower.includes("caution")) {
    type = "warning";
  }

  let toastMessage = message;
  if (title && titleLower !== "success" && titleLower !== "error") {
    toastMessage = message ? `${title}: ${message}` : title;
  } else {
    toastMessage = message || title;
  }

  toast.show(toastMessage, type);

  if (onDismiss && typeof onDismiss === "function") {
    onDismiss();
  }
}

export function LoginScreen({
  onSignUp,
  onLoginSuccess,
  onEmailVerifyNeeded,
  onBack,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // 🔌 Listen for the incoming Google Redirect Token
  useEffect(() => {
    const handleOpenURL = async (event) => {
      if (!event.url) return;
      await processOAuthRedirect(event.url);
    };

    // Check if app was opened from a closed state via OAuth link
    Linking.getInitialURL().then((url) => {
      if (url) processOAuthRedirect(url);
    });

    // Listen for background-to-foreground URL events
    const subscription = Linking.addEventListener("url", handleOpenURL);
    return () => subscription.remove();
  }, []);

  const processOAuthRedirect = async (url) => {
    try {
      // Parse the ID token out of the redirect URL fragment or query parameter
      const match =
        url.match(/[#&]id_token=([^&]+)/) || url.match(/[?&]id_token=([^&]+)/);
      if (!match) return;

      const idToken = match[1];
      setLoading(true);

      console.log("[Google Auth] Forwarding token to backend...");
      const response = await googleLoginApi(idToken);
      console.log("[Google Auth] Backend Response:", response);

      // Extract user and token from your Fastify backend payload
      const userData = response.user;
      const userToken = response.token; // Present on mobile responses

      if (userData) {
        // If backend tells us the role is "pending_onboarding", you can handle routing changes here
        onLoginSuccess(userData, userToken);
      }
    } catch (error) {
      console.error("[Google Auth] Backend exchange failed:", error);
      showAlert(
        "Authentication Error",
        error.message || "Google Sign-In failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = config.GOOGLE_CLIENT_ID;
    if (Platform.OS === "web") {
      const redirectUri = window.location.origin;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${Math.random().toString(36)}`;
      window.location.href = url;
    } else {
      // Make sure this URI matches what is registered in your Google Developer Console
      const redirectUri = config.FRONTEND_WEB_URL;
      const state = config.DEEP_LINK_SCHEME;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${Math.random().toString(36)}&state=${encodeURIComponent(state)}`;

      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Error opening URL for Google OAuth:", error);
        showAlert("Error", "An error occurred starting Google Sign-In.");
      }
    }
  };

  const handleLogin = async () => {
    const { isValid, errors: validationErrors } = validate(loginSchema.body, {
      email,
      password,
    });

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await loginApi(email, password);
      const userData = response.user || response.data?.user;
      const userToken = response.token || response.data?.token;

      if (userToken && userData) {
        onLoginSuccess(userData, userToken);
      } else {
        showAlert("Login Failed", response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes("Verify your email")) {
        onEmailVerifyNeeded?.(email);
      } else if (error.message.includes("verify with OTP")) {
        setOtpMode(true);
      } else {
        showAlert(
          "Login Error",
          error.message || "Failed to connect to server",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showAlert("Invalid OTP", "Please enter all 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyIdentityByOtp(email, otpCode);
      const userData = response.user || response.data?.user;
      const userToken = response.token || response.data?.token;
      if (userToken && userData) {
        onLoginSuccess(userData, userToken);
      }
    } catch (error) {
      showAlert("Verification Error", error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  if (otpMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentMaxWidth}>
            <AppHeaderTitle />
            <View style={styles.loginCard}>
              <Text style={styles.screenTitle}>Verify Your Identity</Text>
              <Text style={styles.screenSubtitle}>
                A verification code has been sent to {email}.
              </Text>
              <CodeInputRow length={6} values={otp} onChange={setOtp} />
              <PrimaryButton
                label={loading ? <ActivityIndicator color="#FFF" /> : "Verify"}
                onPress={handleVerifyOtp}
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.topBar}>
            {onBack && (
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            )}
            <View style={styles.languageButton}>
              <Text style={styles.languageText}>English ⌄</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to Medgram</Text>

          <View style={styles.loginCard}>
            <TextField
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.textMuted}
                />
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              error={errors.password}
            />

            <PrimaryButton
              label={loading ? <ActivityIndicator color="#FFF" /> : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
            />

            <View style={styles.orRow}>
              <View style={styles.orDivider} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.orDivider} />
            </View>

            <TouchableOpacity
              style={styles.googleButtonContainer}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color={theme.text} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.createAccountRow}>
              <Text style={styles.footerText}>New to Medgram?</Text>
              <TouchableOpacity onPress={onSignUp}>
                <Text style={styles.footerLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileBasicsScreen({
  onBack,
  onRegisterSuccess,
  onLoginSuccess,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔌 Listen for the incoming Google Redirect Token during registration view
  useEffect(() => {
    const handleOpenURL = async (event) => {
      if (event.url) await processOAuthRedirect(event.url);
    };
    Linking.getInitialURL().then((url) => {
      if (url) processOAuthRedirect(url);
    });
    const subscription = Linking.addEventListener("url", handleOpenURL);
    return () => subscription.remove();
  }, []);

  const processOAuthRedirect = async (url) => {
    try {
      const match =
        url.match(/[#&]id_token=([^&]+)/) || url.match(/[?&]id_token=([^&]+)/);
      if (!match) return;

      const idToken = match[1];
      setLoading(true);

      const response = await googleLoginApi(idToken);
      const userData = response.user;
      const userToken = response.token;

      if (userData) {
        // Pass straight through to core app login state management
        onLoginSuccess(userData, userToken);
      }
    } catch (error) {
      showAlert(
        "Authentication Error",
        error.message || "Google registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = config.GOOGLE_CLIENT_ID;
    if (Platform.OS === "web") {
      const redirectUri = window.location.origin;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${Math.random().toString(36)}`;
      window.location.href = url;
    } else {
      const redirectUri = config.FRONTEND_WEB_URL;
      const state = config.DEEP_LINK_SCHEME;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=openid%20email%20profile&nonce=${Math.random().toString(36)}&state=${encodeURIComponent(state)}`;

      try {
        await Linking.openURL(url);
      } catch (error) {
        showAlert("Error", "An error occurred starting Google Sign-In.");
      }
    }
  };

  const handleRegister = async () => {
    const { isValid, errors: validationErrors } = validate(
      registerSchema.body,
      { email, password },
    );
    const customErrors = { ...validationErrors };

    if (!confirmPassword)
      customErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword)
      customErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(customErrors).length > 0) {
      setErrors(customErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await registerApi({ email, password });
      showAlert(
        "Success",
        "Registration successful! Confirm code sent to email.",
        () => {
          onRegisterSuccess({
            email,
            gender: "female",
            dob: "",
            role: "patient",
          });
        },
      );
    } catch (error) {
      showAlert("Registration Error", error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  let strengthScore = 0;
  if (password.length >= 8) strengthScore += 1;
  if (/[A-Z]/.test(password)) strengthScore += 1;
  if (/[0-9]/.test(password)) strengthScore += 1;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore += 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.stepHeaderContainer}>
            <View style={styles.stepHeaderTopRow}>
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.stepHeaderStepText}>Sign Up</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>

          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Create Account</Text>
            <Text style={styles.screenSubtitle}>
              Join us to transform your healthcare experience.
            </Text>

            <TextField
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <TextField
              label="Create Password"
              placeholder="●●●●●●●●"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.textMuted}
                />
              }
              onRightIconPress={() => setShowPassword((prev) => !prev)}
              error={errors.password}
            />
            <TextField
              label="Confirm Password"
              placeholder="●●●●●●●●"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <MaterialIcons
                  name={showConfirmPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.textMuted}
                />
              }
              onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
              error={errors.confirmPassword}
            />
          </View>

          <PrimaryButton
            label={loading ? <ActivityIndicator color="#FFF" /> : "Continue"}
            onPress={handleRegister}
            disabled={loading}
          />

          <View style={styles.orRow}>
            <View style={styles.orDivider} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.orDivider} />
          </View>

          <TouchableOpacity
            style={styles.googleButtonContainer}
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={18} color={theme.text} />
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: theme.text }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function EmailVerifyScreen({ email, onBack, onVerified }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyEmail = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      showAlert(
        "Invalid Code",
        "Please enter the full 6-digit code from your email.",
      );
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtpApi(email, otpCode);
      showAlert("Success", "Email verified successfully!", onVerified);
    } catch (error) {
      console.error("[EmailVerify] Error:", error);
      showAlert(
        "Verification Error",
        error.message || "Failed to verify email",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await resendVerificationEmail(email);
      showAlert(
        "Code Sent",
        response.message ||
          "A new verification code has been sent to your email.",
      );
    } catch (error) {
      console.error("[EmailVerify][Resend] Error:", error);
      showAlert(
        "Resend Failed",
        error.message || "Failed to resend verification code",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.stepHeaderContainer}>
            <View style={styles.stepHeaderTopRow}>
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.stepHeaderStepText}>Verify Email</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>
          <View style={styles.verificationIconWrapper}>
            <View style={styles.verificationIconCircle}>
              <Text style={styles.verificationIconEmoji}>✉️</Text>
            </View>
          </View>
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Verify your email</Text>
            <Text style={styles.screenSubtitle}>
              Enter the 6-digit verification code sent to{" "}
              {email || "your email"}.
            </Text>
            <CodeInputRow length={6} values={code} onChange={setCode} />
            <Text style={styles.otpHelpText}>
              The code expires after a short time, so use the most recent one.
            </Text>
            <View style={styles.didntReceiveContainer}>
              <Text style={styles.didntReceiveText}>
                Didn't receive the code?
              </Text>
              <TouchableOpacity onPress={handleResendCode} disabled={resending}>
                <Text style={styles.resendLink}>
                  {resending ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <PrimaryButton
            label={
              loading ? <ActivityIndicator color="#FFF" /> : "Verify Email"
            }
            onPress={handleVerifyEmail}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function PhoneVerifyScreen({ onBack, onVerified }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.stepHeaderContainer}>
            <View style={styles.stepHeaderTopRow}>
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.stepHeaderStepText}>Verify Phone</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>
          <View style={styles.verificationIconWrapper}>
            <View
              style={[styles.verificationIconCircle, styles.phoneIconCircle]}
            >
              <Text style={styles.verificationIconEmoji}>📱</Text>
            </View>
          </View>
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Check your phone</Text>
            <Text style={styles.screenSubtitle}>
              Enter the 6-digit code sent via SMS to your phone number.
            </Text>
            <CodeInputRow length={6} values={code} onChange={setCode} />
            <View style={styles.resendRow}>
              <Text style={styles.didntReceivePrefix}>
                Didn't receive code?
              </Text>
              <TouchableOpacity>
                <Text style={styles.resendLinkInline}>Resend SMS</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.resendTimerText}>
              Resend available in 00:24
            </Text>
          </View>
          <PrimaryButton label="Confirm & Continue" onPress={onVerified} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function VerificationChoiceScreen({
  onBack,
  onChooseEmail,
  onChoosePhone,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.stepHeaderContainer}>
            <View style={styles.stepHeaderTopRow}>
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.stepHeaderStepText}>Verify Account</Text>
              <View style={{ width: 40 }} />
            </View>
          </View>
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Verification Method</Text>
            <Text style={styles.screenSubtitle}>
              Choose how you'd like to verify your account to ensure your
              medical data stays secure.
            </Text>

            <TouchableOpacity
              style={styles.methodCard}
              onPress={onChooseEmail}
              activeOpacity={0.7}
            >
              <View style={styles.methodIconCircle}>
                <Text style={styles.methodIcon}>✉️</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Email Verification</Text>
                <Text style={styles.methodDescription}>
                  Receive a 6-digit code at your registered email address.
                </Text>
              </View>
              <Text style={styles.methodArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, { marginTop: 16 }]}
              onPress={onChoosePhone}
              activeOpacity={0.7}
            >
              <View style={[styles.methodIconCircle, styles.phoneIconCircle]}>
                <Text style={styles.methodIcon}>📱</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Phone Verification</Text>
                <Text style={styles.methodDescription}>
                  Receive a verification code via SMS on your mobile phone.
                </Text>
              </View>
              <Text style={styles.methodArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function NameStepScreen({ onBack, onNext, onSkip }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <StepHeader
            stepIndex={1}
            totalSteps={3}
            title="Step 1 of 3"
            showSkip
            onBack={onBack}
            onSkip={onSkip}
          />
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Tell us about yourself</Text>
            <Text style={styles.screenSubtitle}>
              Let's start with your legal name for medical records. This ensures
              your data is accurate and secure.
            </Text>
            <TextField
              label="First Name"
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextField
              label="Middle Name"
              placeholder="Middle Name (Optional)"
              value={middleName}
              onChangeText={setMiddleName}
            />
            <TextField
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <PrimaryButton
            label="Next Step"
            onPress={() =>
              onNext({
                name: `${firstName} ${middleName} ${lastName}`
                  .replace(/\s+/g, " ")
                  .trim(),
              })
            }
          />
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ContactStepScreen({ onBack, onNext, onSkip }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <StepHeader
            stepIndex={2}
            totalSteps={3}
            title="Step 2 of 3"
            showSkip
            onBack={onBack}
            onSkip={onSkip}
          />
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Let's stay in touch</Text>
            <Text style={styles.screenSubtitle}>
              Please provide your contact details. We'll use these to verify
              your identity and keep your health data secure.
            </Text>
            <TextField
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Phone Number"
              placeholder="(555) 000-0000"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <PrimaryButton
            label="Next Step"
            onPress={() => onNext({ email, phone })}
          />
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function LocationStepScreen({ onBack, onComplete }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [address, setAddress] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <StepHeader
            stepIndex={3}
            totalSteps={3}
            title="Final Step"
            showSkip={false}
            onBack={onBack}
          />
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Where are you located?</Text>
            <Text style={styles.screenSubtitle}>
              We use this to find the best health providers near you.
            </Text>
            <View style={styles.locationCard}>
              <View style={styles.locationPlaceholder}>
                <Text style={styles.locationPin}>📍</Text>
              </View>
              <PrimaryButton label="Auto-detect location" onPress={() => {}} />
            </View>
            <Text style={styles.orManualText}>OR ENTER MANUALLY</Text>
            <TextField
              label="Street Address"
              placeholder="Search for your address..."
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>Privacy First</Text>
              <Text style={styles.privacyText}>
                Your location is only used to match you with nearby providers.
                We never share your precise location.
              </Text>
            </View>
          </View>
          <PrimaryButton
            label="Complete Registration"
            onPress={() => onComplete({ location: address })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileCustomizeScreen({ onBack, onNext, onSkip }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [bio, setBio] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
          <StepHeader
            stepIndex={4}
            totalSteps={4}
            title="Step 4"
            showSkip={false}
            onBack={onBack}
          />
          <View style={styles.onboardingBody}>
            <Text style={styles.screenTitle}>Customize Your Profile</Text>
            <Text style={styles.screenSubtitle}>
              Add a face to your journey. You can always change this later.
            </Text>
            <View style={styles.profileAvatarWrapper}>
              <View style={styles.profileAvatarCircle}>
                <Text style={styles.profileAvatarPlaceholder}>👤</Text>
              </View>
              <View style={styles.profileAvatarPlus}>
                <Text style={styles.profileAvatarPlusText}>＋</Text>
              </View>
            </View>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="I'm here to improve my cardio and eat better..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={150}
              style={styles.bioInput}
            />
            <Text style={styles.bioCounter}>{bio.length}/150</Text>
          </View>
          <PrimaryButton label="Next" onPress={() => onNext({ bio })} />
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipForNowText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SuccessScreen({ onGetStarted, role }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const isDoctor = role === "doctor";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <View style={styles.contentMaxWidth}>
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View style={styles.successIcon}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.successTitle}>
              {isDoctor ? "Application Received!" : "You're all set!"}
            </Text>
            <Text style={styles.successSubtitle}>
              {isDoctor
                ? "Your doctor profile is being reviewed by our medical board. We'll notify you once your account is active."
                : "Your journey to better health starts now."}
            </Text>
          </View>
          <PrimaryButton
            label={isDoctor ? "Go to Dashboard" : "Get Started"}
            onPress={onGetStarted}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 32,
      flexGrow: 1,
      ...Platform.select({
        web: {
          justifyContent: "center",
        },
      }),
    },
    onboardingContent: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 32,
      flexGrow: 1,
      ...Platform.select({
        web: {
          justifyContent: "center",
        },
      }),
    },
    contentMaxWidth: {
      width: "100%",
      maxWidth: 480,
      alignSelf: "center",
    },
    appHeaderContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    appLogo: {
      width: 200,
      height: 100,
    },
    appName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    loginCard: {
      marginTop: 24,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    screenSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 32,
    },
    languageButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: theme.background,
    },
    languageText: {
      fontSize: 13,
      color: theme.text,
      fontWeight: "500",
    },
    languageChevron: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 6,
    },
    welcomeTitle: {
      fontSize: 34,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      marginBottom: 28,
    },
    loginMethodTabs: {
      flexDirection: "row",
      marginBottom: 24,
    },
    loginMethodTab: {
      flex: 1,
      borderRadius: 999,
      marginRight: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: theme.surfaceSubtle,
    },
    loginMethodTabActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    loginMethodLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
    },
    loginMethodLabelActive: {
      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    textInputWithIcon: {
      flex: 1,
      paddingRight: 48,
    },
    inputIconButton: {
      position: "absolute",
      right: 16,
      height: 24,
      justifyContent: "center",
    },
    inputIcon: {
      fontSize: 18,
      color: theme.textSecondary,
    },

    fingerprintButton: {
      width: 72,
      height: 72,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      alignSelf: "center",
      marginBottom: 24,
    },
    fingerprintIcon: {
      fontSize: 32,
      color: theme.text,
    },
    createAccountRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 12,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    otpHelpText: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 8,
      textAlign: "center",
    },
    textInput: {
      width: "100%",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      backgroundColor: theme.surfaceSubtle,
    },
    forgotPasswordRow: {
      alignItems: "flex-end",
      marginBottom: 16,
    },
    forgotPasswordText: {
      fontSize: 13,
      color: "#F97316",
    },
    primaryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      width: "100%",
    },
    primaryButtonLabel: {
      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonDisabled: {
      backgroundColor: theme.border,
    },
    inputError: {
      borderColor: theme.error,
    },
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: 4,
    },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    orDivider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    orText: {
      marginHorizontal: 8,
      fontSize: 11,
      color: theme.textMuted,
      letterSpacing: 1,
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
      marginBottom: 24,
    },
    googleButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.surfaceSubtle,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 12,
      paddingVertical: 12,
      marginTop: 12,
      width: "100%",
    },
    socialButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    socialButtonLabel: {
      fontSize: 22,
      color: theme.text,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 8,
    },
    footerText: {
      fontSize: 13,
      color: theme.textSecondary,
      marginRight: 4,
    },
    footerLink: {
      fontSize: 13,
      color: theme.text,
      fontWeight: "600",
    },
    stepHeaderContainer: {
      marginBottom: 24,
    },
    stepHeaderTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    backArrow: {
      fontSize: 20,
      color: theme.text,
    },
    stepHeaderStepText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    skipText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    progressTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.border,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      borderRadius: 999,
      backgroundColor: "#EC4899",
    },
    onboardingBody: {
      marginBottom: 24,
    },
    termsText: {
      marginTop: 12,
      fontSize: 11,
      color: theme.textMuted,
      textAlign: "center",
    },
    locationCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      marginBottom: 16,
    },
    locationPlaceholder: {
      height: 160,
      borderRadius: 12,
      backgroundColor: theme.surfaceSubtle,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    locationPin: {
      fontSize: 32,
    },
    orManualText: {
      fontSize: 11,
      color: theme.textMuted,
      textAlign: "center",
      marginVertical: 8,
      letterSpacing: 1,
    },
    privacyCard: {
      borderRadius: 16,
      backgroundColor: theme.surfaceSubtle,
      padding: 16,
      marginTop: 16,
    },
    privacyTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    privacyText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    successContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    successIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    successCheck: {
      fontSize: 48,
      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
    },
    successTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    successSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 24,
      textAlign: "center",
    },
    codeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 12,
      marginVertical: 24,
    },
    codeBox: {
      width: 48,
      height: 56,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.border,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "600",
      color: theme.text,
      backgroundColor: theme.background,
      ...Platform.select({
        web: {
          outlineStyle: "none",
        },
      }),
    },
    codeBoxFilled: {
      borderColor: theme.primary,
    },
    codeBoxFocused: {
      borderColor: theme.primary,
      backgroundColor: theme.surfaceSubtle,
      borderWidth: 2,
    },
    verificationIconWrapper: {
      alignItems: "center",
      marginBottom: 16,
    },
    verificationIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.mode === "dark" ? "#1E1B4B" : "#EEF2FF",
      alignItems: "center",
      justifyContent: "center",
    },
    phoneIconCircle: {
      backgroundColor: theme.mode === "dark" ? "#78350F" : "#FEF3C7",
    },
    verificationIconEmoji: {
      fontSize: 40,
    },
    didntReceiveText: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 8,
    },
    resendLink: {
      marginTop: 4,
      fontSize: 13,
      color: "#F97316",
      fontWeight: "500",
    },
    linkInfoBox: {
      backgroundColor: theme.surfaceSubtle,
      padding: 16,
      borderRadius: 12,
      marginVertical: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    linkInfoText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    didntReceiveContainer: {
      marginTop: 16,
      alignItems: "center",
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },
    didntReceivePrefix: {
      fontSize: 13,
      color: theme.textSecondary,
      marginRight: 4,
    },
    resendLinkInline: {
      fontSize: 13,
      color: "#EC4899",
      fontWeight: "500",
    },
    resendTimerText: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 4,
    },
    genderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      marginTop: 8,
    },
    genderOption: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 12,
      marginHorizontal: 4,
      alignItems: "center",
      backgroundColor: theme.background,
    },
    genderOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.surfaceSubtle,
    },
    genderOptionLabel: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    passwordStrengthRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    passwordStrengthLabel: {
      fontSize: 12,
      color: "#F97316",
    },
    passwordStrengthCount: {
      fontSize: 12,
      color: theme.textMuted,
    },
    passwordStrengthTrack: {
      height: 4,
      borderRadius: 999,
      backgroundColor: theme.border,
      marginTop: 6,
    },
    passwordStrengthFill: {
      height: 4,
      borderRadius: 999,
      backgroundColor: "#F97316",
    },
    profileAvatarWrapper: {
      alignItems: "center",
      marginBottom: 24,
      marginTop: 8,
    },
    profileAvatarCircle: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    profileAvatarPlaceholder: {
      fontSize: 40,
    },
    profileAvatarPlus: {
      position: "absolute",
      bottom: 4,
      right: (112 - 56) / 2,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    profileAvatarPlusText: {
      fontSize: 24,
      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
      marginTop: -2,
    },
    bioInput: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.surfaceSubtle,
      minHeight: 96,
      textAlignVertical: "top",
    },
    bioCounter: {
      alignSelf: "flex-end",
      fontSize: 11,
      color: theme.textMuted,
      marginTop: 4,
    },
    skipForNowText: {
      marginTop: 12,
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: "center",
    },
    methodCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    methodIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surfaceSubtle,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    methodIcon: {
      fontSize: 24,
    },
    methodInfo: {
      flex: 1,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 2,
    },
    methodDescription: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
    },
    methodArrow: {
      fontSize: 20,
      color: theme.border,
      marginLeft: 8,
    },
  });
