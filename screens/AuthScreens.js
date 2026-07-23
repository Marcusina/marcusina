import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import Logo from "../components/Logo";
import Svg, { Rect, Path } from "react-native-svg";
import config from "../utils/config";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  verifyEmail,
  reactivateAccount,
  deactivateAccount,
} from "../api/auth.api";
import { validate } from "../utils/validator";
import { loginSchema, registerSchema } from "../constants/schemas";

function AppHeaderTitle() {
  return (
    <View className="items-center mb-6">
      <Logo width={60} height={60} />
    </View>
  );
}

export function WelcomeScreen({ onCreateAccount, onSignIn }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[480px] self-center">
          {/* Top: Brand Section (takes ~55% of height) */}
          <View className="h-[280px] items-center justify-center relative mb-5">
            {/* Subtle geometric SVG accent top-right */}
            <View
              className="absolute -top-6 -right-6 w-[140px] h-[140px] pointer-events-none"
              style={{ opacity: theme.dark ? 0.15 : 0.05 }}
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
            <View className="mt-[22px] items-center">
              <Text
                className="text-[38px] font-extrabold tracking-[-1.5px] mb-1.5"
                style={{ color: theme.text }}
              >
                medgram
              </Text>
              <Text
                className="text-[11px] font-bold tracking-[1.8px] uppercase"
                style={{ color: theme.textMuted }}
              >
                The health media made for you
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            className="h-[0.5px] mb-6"
            style={{ backgroundColor: theme.border }}
          />

          {/* Value Props */}
          <View className="mb-8 gap-4">
            <View className="flex-row items-center gap-[14px]">
              <View
                className="w-9 h-9 rounded-[11px] border-[0.5px] items-center justify-center"
                style={{
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                }}
              >
                <MaterialIcons name="schedule" size={18} color={theme.text} />
              </View>
              <View>
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: theme.text }}
                >
                  Book in seconds
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Consult verified doctors anytime
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-[14px]">
              <View
                className="w-9 h-9 rounded-[11px] border-[0.5px] items-center justify-center"
                style={{
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
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
                  className="text-[13px] font-bold"
                  style={{ color: theme.text }}
                >
                  Your health, centralised
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Records, meds, labs — one place
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-[14px]">
              <View
                className="w-9 h-9 rounded-[11px] border-[0.5px] items-center justify-center"
                style={{
                  backgroundColor: theme.surfaceSubtle,
                  borderColor: theme.border,
                }}
              >
                <MaterialIcons name="security" size={18} color={theme.text} />
              </View>
              <View>
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: theme.text }}
                >
                  Built for the world
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  Verified, secure, always available
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            className="w-full h-14 rounded-[18px] flex-row items-center justify-center gap-2 mb-3"
            style={{
              backgroundColor: theme.dark ? "#FFFFFF" : "#0A0A0A",
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
              className="text-[16px] font-bold"
              style={{ color: theme.dark ? "#0A0A0A" : "#FFFFFF" }}
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
            className="w-full h-[52px] rounded-[18px] border-[1.5px] items-center justify-center"
            style={{
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border,
            }}
            onPress={onSignIn}
            activeOpacity={0.8}
          >
            <Text
              className="text-[15px] font-semibold"
              style={{ color: theme.text }}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <Text
            className="text-center text-[11px] mt-6 leading-[17px]"
            style={{ color: theme.textMuted }}
          >
            By continuing you agree to Medgram's{" "}
            <Text
              className="font-semibold"
              style={{ color: theme.textSecondary }}
            >
              Terms
            </Text>{" "}
            &amp;{" "}
            <Text
              className="font-semibold"
              style={{ color: theme.textSecondary }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({ label, onPress, disabled, style }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="py-[14px] rounded-full items-center justify-center mt-2 w-full"
      style={[
        { backgroundColor: disabled ? theme.border : theme.primary },
        style,
      ]}
      disabled={disabled}
    >
      {typeof label === "string" ? (
        <Text
          className="text-[16px] font-semibold"
          style={{ color: theme.mode === "dark" ? "#000000" : "#FFFFFF" }}
        >
          {label}
        </Text>
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
  return (
    <View className="mb-4">
      <Text
        className="text-[13px] mb-1.5"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          className={`w-full border rounded-xl px-4 py-3 text-[15px] ${rightIcon ? "flex-1 pr-12" : ""}`}
          style={{
            backgroundColor: theme.surfaceSubtle,
            color: theme.text,
            borderColor: error ? theme.error : theme.border,
          }}
        />
        {rightIcon ? (
          <TouchableOpacity
            className="absolute right-4 h-6 justify-center"
            onPress={onRightIconPress}
            activeOpacity={0.8}
          >
            {typeof rightIcon === "string" ? (
              <Text
                className="text-[18px]"
                style={{ color: theme.textSecondary }}
              >
                {rightIcon}
              </Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error && (
        <Text className="text-[12px] mt-1" style={{ color: theme.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function CodeInputRow({ length, values, onChange }) {
  const { theme } = useTheme();
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
    <View className="flex-row justify-center gap-3 my-6">
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
          className="w-12 h-14 rounded-2xl border-2 text-center text-[24px] font-semibold"
          style={{
            color: theme.text,
            borderColor:
              values[index] || focusedIndex === index
                ? theme.primary
                : theme.border,
            backgroundColor:
              focusedIndex === index ? theme.surfaceSubtle : theme.background,
            ...Platform.select({
              web: {
                outlineStyle: "none",
              },
            }),
          }}
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
  const progress = (stepIndex / totalSteps) * 100;

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity onPress={onBack} hitSlop={16}>
          <Text className="text-[20px]" style={{ color: theme.text }}>
            ←
          </Text>
        </TouchableOpacity>
        <Text className="text-[14px]" style={{ color: theme.textSecondary }}>
          {title}
        </Text>
        {showSkip ? (
          <TouchableOpacity onPress={onSkip}>
            <Text
              className="text-[14px] font-medium"
              style={{ color: theme.text }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <View
        className="h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.border }}
      >
        <View
          className="h-1 rounded-full bg-[#EC4899]"
          style={{ width: `${progress}%` }}
        />
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
  onDeviceVerifyNeeded,
  onForgotPassword,
  onBack,
}) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleGoogleLogin = async () => {
    const clientId = config.GOOGLE_CLIENT_ID;
    if (!clientId) {
      showAlert("Unavailable", "Google Sign-In is not configured for this build.");
      return;
    }
    setGoogleLoading(true);
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
        setGoogleLoading(false);
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
      console.log("=======Login response:", response);
      const userData = response.user || response.data?.user;
      const userToken = response.token || response.data?.token;

      if (userData) {
        onLoginSuccess(userData, userToken);
      } else {
        showAlert("Login Failed", response.message || "Unknown error");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.message.includes("Verify your email")) {
        onEmailVerifyNeeded?.(email);
      } else if (
        error.message.includes("verify with OTP") ||
        error.message.includes("device") ||
        error.message.includes("OTP") ||
        error.message.includes("otp")
      ) {
        if (onDeviceVerifyNeeded) {
          onDeviceVerifyNeeded(email);
        } else {
          setOtpMode(true);
        }
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
      console.log("======= OTP verification response:", response);
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
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
      >
        <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
          <View className="w-full max-w-[480px] self-center">
            <AppHeaderTitle />
            <View className="mt-6">
              <Text
                className="text-[28px] font-bold mb-2"
                style={{ color: theme.text }}
              >
                Verify Your Identity
              </Text>
              <Text
                className="text-[14px] mb-6"
                style={{ color: theme.textSecondary }}
              >
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
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="flex-row justify-between items-center mb-8">
            {onBack && (
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text className="text-[20px]" style={{ color: theme.text }}>
                  ←
                </Text>
              </TouchableOpacity>
            )}
            <View
              className="flex-row items-center border rounded-full py-2.5 px-3.5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.background,
              }}
            >
              <Text
                className="text-[13px] font-medium"
                style={{ color: theme.text }}
              >
                English ⌄
              </Text>
            </View>
          </View>
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Welcome back
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Sign in to Medgram
          </Text>

          <View className="mt-6">
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

            <TouchableOpacity
              onPress={onForgotPassword}
              className="self-end -mt-1 mb-4"
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: theme.primary }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              label={loading ? <ActivityIndicator color="#FFF" /> : "Sign In"}
              onPress={handleLogin}
              disabled={loading || googleLoading}
            />

            <View className="flex-row items-center my-6">
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: theme.border }}
              />
              <Text
                className="mx-2 text-[11px] tracking-[1px]"
                style={{ color: theme.textMuted }}
              >
                or continue with
              </Text>
              <View
                className="flex-1 h-[1px]"
                style={{ backgroundColor: theme.border }}
              />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 border-[1.5px] rounded-xl py-3 mt-3 w-full"
              style={{
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.border,
              }}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
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

            <View className="flex-row justify-center mb-3">
              <Text
                className="text-[13px] mr-1"
                style={{ color: theme.textSecondary }}
              >
                New to Medgram?
              </Text>
              <TouchableOpacity onPress={onSignUp}>
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: theme.text }}
                >
                  Create an account
                </Text>
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
  onSignIn,
  onRegisterSuccess,
  onLoginSuccess,
}) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGoogleLogin = async () => {
    const clientId = config.GOOGLE_CLIENT_ID;
    if (!clientId) {
      showAlert("Unavailable", "Google Sign-In is not configured for this build.");
      return;
    }
    setGoogleLoading(true);
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
        setGoogleLoading(false);
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
        "Registration successful! A verification link has been sent to your email.",
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
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-6 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text className="text-[20px]" style={{ color: theme.text }}>
                  ←
                </Text>
              </TouchableOpacity>
              <Text
                className="text-[14px]"
                style={{ color: theme.textSecondary }}
              >
                Sign Up
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </View>

          <View className="mb-6">
            <Text
              className="text-[28px] font-bold mb-2"
              style={{ color: theme.text }}
            >
              Create Account
            </Text>
            <Text
              className="text-[14px] mb-6"
              style={{ color: theme.textSecondary }}
            >
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
            disabled={loading || googleLoading}
          />

          <View className="flex-row items-center my-6">
            <View
              className="flex-1 h-[1px]"
              style={{ backgroundColor: theme.border }}
            />
            <Text
              className="mx-2 text-[11px] tracking-[1px]"
              style={{ color: theme.textMuted }}
            >
              or continue with
            </Text>
            <View
              className="flex-1 h-[1px]"
              style={{ backgroundColor: theme.border }}
            />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 border-[1.5px] rounded-xl py-3 mt-3 w-full"
            style={{
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border,
            }}
            activeOpacity={0.8}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color={theme.text} />
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: theme.text }}
                >
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mb-3">
            <Text
              className="text-[13px] mr-1"
              style={{ color: theme.textSecondary }}
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text
                className="text-[13px] font-semibold"
                style={{ color: theme.text }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function EmailVerifyScreen({ email, onBack }) {
  const { theme } = useTheme();
  const [resending, setResending] = useState(false);

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await resendVerificationEmail(email);
      showAlert(
        "Link Sent",
        response.message ||
          "A new verification link has been sent to your email.",
      );
    } catch (error) {
      console.error("[EmailVerify][Resend] Error:", error);
      showAlert(
        "Resend Failed",
        error.message || "Failed to resend verification link",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-grow flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-6 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text className="text-[20px]" style={{ color: theme.text }}>
                  ←
                </Text>
              </TouchableOpacity>
              <Text
                className="text-[14px]"
                style={{ color: theme.textSecondary }}
              >
                Verify Email
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </View>
          <View className="items-center mb-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{
                backgroundColor: theme.mode === "dark" ? "#1E1B4B" : "#EEF2FF",
              }}
            >
              <Text className="text-[40px]">✉️</Text>
            </View>
          </View>
          <View className="mb-6">
            <Text
              className="text-[28px] font-bold mb-3 text-center"
              style={{ color: theme.text }}
            >
              Verify your email
            </Text>
            <Text
              className="text-[14px] mb-8 text-center leading-5"
              style={{ color: theme.textSecondary }}
            >
              A verification link has been sent to{" "}
              <Text className="font-semibold" style={{ color: theme.text }}>
                {email || "your email"}
              </Text>
              . Please check your inbox and click the link to verify your
              account and activate your Medgram profile.
            </Text>

            <PrimaryButton
              label={
                resending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  "Resend Verification Link"
                )
              }
              onPress={handleResendCode}
              disabled={resending}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ForgotPasswordScreen({ onBack }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
      toast.success("Reset instructions sent to your email!");
    } catch (err) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="flex-row justify-between items-center mb-8">
            {onBack && (
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text className="text-[20px]" style={{ color: theme.text }}>
                  ←
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ width: 40 }} />
          </View>
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Forgot Password
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Enter your email address to receive reset instructions
          </Text>

          <View className="mt-6">
            {!sent ? (
              <>
                <TextField
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                />

                <PrimaryButton
                  label={
                    loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      "Send Reset Link"
                    )
                  }
                  onPress={handleSubmit}
                  disabled={loading}
                />

                <TouchableOpacity
                  onPress={onBack}
                  className="mt-6 items-center"
                >
                  <Text
                    className="font-semibold"
                    style={{ color: theme.primary }}
                  >
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="items-center mt-5">
                <MaterialIcons
                  name="mark-email-read"
                  size={64}
                  color={theme.primary}
                />
                <Text
                  className="text-center mt-4 text-[20px] font-extrabold"
                  style={{ color: theme.text }}
                >
                  Check your Email
                </Text>
                <Text
                  className="text-center mt-2 text-[15px]"
                  style={{ color: theme.textSecondary }}
                >
                  A secure password reset link has been sent to {email}.
                </Text>
                <PrimaryButton
                  label="Back to Login"
                  onPress={onBack}
                  style={{ marginTop: 24, width: "100%" }}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ResetPasswordScreen({ token, onBack }) {
  const { theme } = useTheme();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordApi(token, password);
      toast.success("Password reset successfully! Please login.");
      onBack();
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Reset Password
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Set your new account password
          </Text>

          <View className="mt-6">
            <TextField
              label="New Password"
              placeholder="••••••••"
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
            />

            <TextField
              label="Confirm Password"
              placeholder="••••••••"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <MaterialIcons
                  name={showConfirmPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.textMuted}
                />
              }
              onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
            />

            <PrimaryButton
              label={
                loading ? <ActivityIndicator color="#FFF" /> : "Reset Password"
              }
              onPress={handleSubmit}
              disabled={loading}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function VerifyEmailLinkScreen({ token, onBack }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { handleLogout } = useUser();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await verifyEmail(token);
      toast.success(response.message || "Email verified successfully!");
      await handleLogout();
      onBack();
    } catch (err) {
      toast.error(err.message || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Verify Email
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Confirm your email address for Medgram
          </Text>

          <View className="mt-6">
            <View className="items-center my-5">
              <MaterialIcons
                name="mail-outline"
                size={64}
                color={theme.primary}
              />
              <Text
                className="text-center mt-4"
                style={{ color: theme.textSecondary }}
              >
                Click below to complete the verification process.
              </Text>
            </View>

            <PrimaryButton
              label={
                loading ? <ActivityIndicator color="#FFF" /> : "Verify Email"
              }
              onPress={handleVerify}
              disabled={loading}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ReactivateAccountScreen({ token, onBack }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { handleLogout } = useUser();

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const response = await reactivateAccount(token);
      toast.success(response.message || "Account reactivated successfully!");
      await handleLogout();
      onBack();
    } catch (err) {
      toast.error(err.message || "Account reactivation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Reactivate Account
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Restore your Medgram account access
          </Text>

          <View className="mt-6">
            <View className="items-center my-5">
              <MaterialIcons name="lock-open" size={64} color={theme.primary} />
              <Text
                className="text-center mt-4"
                style={{ color: theme.textSecondary }}
              >
                Your account was deactivated. Click below to restore full
                access.
              </Text>
            </View>

            <PrimaryButton
              label={
                loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  "Reactivate Account"
                )
              }
              onPress={handleReactivate}
              disabled={loading}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function DeactivateAccountScreen({ token, onBack }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const { handleLogout } = useUser();

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const response = await deactivateAccount(token);
      toast.success(response.message || "Account deactivated successfully!");
      await handleLogout();
      onBack();
    } catch (err) {
      toast.error(err.message || "Account deactivation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            Deactivate Account
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            Confirm deactivation of your account
          </Text>

          <View className="mt-6">
            <View className="items-center my-5">
              <MaterialIcons name="warning" size={64} color={theme.error} />
              <Text
                className="text-center mt-4"
                style={{ color: theme.textSecondary }}
              >
                Are you sure you want to deactivate your account? Click confirm
                below.
              </Text>
            </View>

            <PrimaryButton
              label={
                loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  "Confirm Deactivation"
                )
              }
              onPress={handleDeactivate}
              disabled={loading}
              style={{ backgroundColor: theme.error }}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function VerifyDeviceScreen({ email, onBack, onVerified }) {
  const { theme } = useTheme();
  const { handleVerifyDevice, handleResendDeviceOtp } = useUser();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the full 6-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      await handleVerifyDevice(email, otpCode);
      toast.success("Device verified successfully!");
      if (onVerified) onVerified();
    } catch (err) {
      toast.error(err.message || "Failed to verify device");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await handleResendDeviceOtp(email);
      toast.success("New OTP sent to your email!");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="flex-row justify-between items-center mb-8">
            {onBack && (
              <TouchableOpacity onPress={onBack} hitSlop={16}>
                <Text className="text-[20px]" style={{ color: theme.text }}>
                  ←
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ width: 40 }} />
          </View>
          <Text
            className="text-[34px] font-extrabold mb-1.5"
            style={{ color: theme.text }}
          >
            New Device Login
          </Text>
          <Text
            className="text-[15px] mb-7"
            style={{ color: theme.textSecondary }}
          >
            We detected a login request from a new device for{"\n"}
            <Text className="font-semibold" style={{ color: theme.text }}>
              {email}
            </Text>
            . Please enter the 6-digit OTP code sent to your email.
          </Text>

          <View className="mt-6">
            <CodeInputRow length={6} values={code} onChange={setCode} />
            <Text
              className="text-[12px] mt-2 text-center"
              style={{ color: theme.textMuted }}
            >
              The code expires after a short time, so use the most recent one.
            </Text>

            <View className="mt-4 items-center">
              <Text
                className="text-[13px] mt-2"
                style={{ color: theme.textSecondary }}
              >
                Didn't receive the code?
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text className="mt-1 text-[13px] font-medium text-[#F97316]">
                  {resending ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>

            <PrimaryButton
              label={
                loading ? <ActivityIndicator color="#FFF" /> : "Verify Device"
              }
              onPress={handleVerify}
              disabled={loading}
            />

            <TouchableOpacity onPress={onBack} className="mt-6 items-center">
              <Text className="font-semibold" style={{ color: theme.primary }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
