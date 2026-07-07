import React, { useState, useEffect } from "react";
import { CodeInputRow } from "./AuthScreens";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { useUser } from "../context/UserContext";
import {
  changePassword,
  accountDeactivationRequest,
  sudoStatus,
  sudoRequest,
  sudoVerify,
  getActiveCurrency,
  updateActiveCurrency,
  getSupportedCurrencies,
  getCurrencyHistory,
} from "../api/auth.api";

// --- SUDO MODAL COMPONENT ---
function SudoVerificationModal({ visible, onClose, onSuccess, actionName }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleSendRequest = async () => {
    setRequesting(true);
    try {
      await sudoRequest(actionName);
      showToast("Sudo OTP sent to your email!", "success");
    } catch (err) {
      showToast(err.message || "Failed to send sudo OTP", "error");
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      showToast("Please enter the full 6-digit OTP code.", "error");
      return;
    }
    setLoading(true);
    try {
      await sudoVerify(otpCode);
      showToast("Identity verified successfully!", "success");
      onSuccess();
      onClose(true);
    } catch (err) {
      showToast(err.message || "Invalid or expired OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible) {
      handleSendRequest();
    } else {
      setCode(["", "", "", "", "", ""]);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => onClose(false)}>
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="w-full max-w-[360px] rounded-[20px] border p-5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[18px] font-bold flex-1" style={{ color: theme.text }}>Security Verification</Text>
            <TouchableOpacity onPress={() => onClose(false)}>
              <MaterialIcons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text className="text-[13px] leading-[18px] mb-5" style={{ color: theme.textSecondary }}>
            You are performing a sensitive action: <Text className="font-bold" style={{ color: theme.primary }}>{actionName}</Text>. Please enter the 6-digit OTP code sent to your email to authorize this.
          </Text>

          <View className="items-center my-5">
            <CodeInputRow length={6} values={code} onChange={setCode} />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleSendRequest()}
              disabled={requesting}
              className="h-11 px-4 rounded-[10px] border items-center justify-center"
              style={{ borderColor: theme.border }}
            >
              <Text style={{ color: theme.textSecondary }}>Resend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading}
              className="h-11 rounded-[10px] items-center justify-center flex-1 ml-3"
              style={{ backgroundColor: theme.primary }}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white text-[14px] font-bold">Verify</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- MAIN SETTINGS SCREEN ---
export function SettingsScreen({ onBack }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { handleLogout } = useUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Deactivation State
  const [deactLoading, setDeactLoading] = useState(false);

  // Sudo State
  const [sudoOpen, setSudoOpen] = useState(false);
  const [sudoAction, setSudoAction] = useState(null); // { name: string, callback: () => void }

  // Currency States
  const [activeCurrency, setActiveCurrencyState] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currencyHistory, setCurrencyHistory] = useState([]);
  const [supportedCurrencies, setSupportedCurrencies] = useState({});
  const [changeCurrencyOpen, setChangeCurrencyOpen] = useState(false);
  const [loadingCurrency, setLoadingCurrency] = useState(false);

  const fetchCurrencyData = async () => {
    try {
      setLoadingCurrency(true);
      const activeRes = await getActiveCurrency();
      if (activeRes && activeRes.currency_code) {
        setActiveCurrencyState(activeRes.currency_code);
      }
      
      const historyRes = await getCurrencyHistory();
      setCurrencyHistory(historyRes || []);
      
      const supportedRes = await getSupportedCurrencies();
      setSupportedCurrencies(supportedRes.currencies || {});
    } catch (err) {
      console.warn("Failed to fetch currency data in settings:", err);
    } finally {
      setLoadingCurrency(false);
    }
  };

  useEffect(() => {
    fetchCurrencyData();
  }, []);

  const handleUpdateCurrency = async (currencyCode) => {
    try {
      setLoadingCurrency(true);
      await updateActiveCurrency(currencyCode);
      showToast(`Preferred currency updated to ${currencyCode}`, "success");
      setChangeCurrencyOpen(false);
      await fetchCurrencyData();
    } catch (err) {
      showToast(err.message || "Failed to update currency", "error");
    } finally {
      setLoadingCurrency(false);
    }
  };

  const triggerSudoAction = async (actionName, callback) => {
    try {
      const res = await sudoStatus();
      if (res.sudoMode) {
        // Sudo mode is already active
        callback();
      } else {
        setSudoAction({ name: actionName, callback });
        setSudoOpen(true);
      }
    } catch (err) {
      setSudoAction({ name: actionName, callback });
      setSudoOpen(true);
    }
  };

  const performChangePassword = async () => {
    setPwLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      showToast("Password changed successfully!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setPwLoading(true);
    try {
      const res = await sudoStatus();
      if (res.sudoMode) {
        await performChangePassword();
      } else {
        setSudoAction({ name: "Change Password", callback: performChangePassword });
        setSudoOpen(true);
      }
    } catch (err) {
      setSudoAction({ name: "Change Password", callback: performChangePassword });
      setSudoOpen(true);
    }
  };

  const performDeactivate = async () => {
    setDeactLoading(true);
    try {
      await accountDeactivationRequest();
      showToast("Deactivation link sent to your email! Please check your inbox.", "success");
    } catch (err) {
      showToast(err.message || "Failed to request deactivation", "error");
    } finally {
      setDeactLoading(false);
    }
  };

  const handleDeactivateSubmit = async () => {
    setDeactLoading(true);
    try {
      const res = await sudoStatus();
      if (res.sudoMode) {
        await performDeactivate();
      } else {
        setSudoAction({ name: "Deactivate Account", callback: performDeactivate });
        setSudoOpen(true);
      }
    } catch (err) {
      setSudoAction({ name: "Deactivate Account", callback: performDeactivate });
      setSudoOpen(true);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-row items-center px-4 py-3 border-b-[0.5px] border-black/10">
        <TouchableOpacity onPress={onBack} className="p-1 mr-4">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold" style={{ color: theme.text }}>Account Settings</Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-6">
        {/* Section 1: Change Password */}
        <View className="rounded-[16px] border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <Text className="text-[16px] font-bold mb-1" style={{ color: theme.text }}>Change Password</Text>
          <Text className="text-[13px] leading-[18px] mb-4" style={{ color: theme.textSecondary }}>
            Update your account password securely. Requires verification if not logged in recently.
          </Text>

          <View className="gap-3">
            <Text className="text-[13px] font-semibold mt-1" style={{ color: theme.text }}>Current Password</Text>
            <View className="flex-row items-center relative">
              <TextInput
                secureTextEntry={!showOldPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={oldPassword}
                onChangeText={setOldPassword}
                className="h-11 rounded-[10px] border px-3 text-[14px] flex-1 pr-10"
                style={{ backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border }}
              />
              <TouchableOpacity
                onPress={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 h-full justify-center"
              >
                <MaterialIcons
                  name={showOldPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text className="text-[13px] font-semibold mt-1" style={{ color: theme.text }}>New Password</Text>
            <View className="flex-row items-center relative">
              <TextInput
                secureTextEntry={!showNewPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                className="h-11 rounded-[10px] border px-3 text-[14px] flex-1 pr-10"
                style={{ backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border }}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 h-full justify-center"
              >
                <MaterialIcons
                  name={showNewPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text className="text-[13px] font-semibold mt-1" style={{ color: theme.text }}>Confirm New Password</Text>
            <View className="flex-row items-center relative">
              <TextInput
                secureTextEntry={!showConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="h-11 rounded-[10px] border px-3 text-[14px] flex-1 pr-10"
                style={{ backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 h-full justify-center"
              >
                <MaterialIcons
                  name={showConfirmPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleChangePasswordSubmit}
              disabled={pwLoading}
              className="h-11 rounded-[10px] items-center justify-center mt-4"
              style={{ backgroundColor: theme.primary }}
            >
              {pwLoading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white text-[14px] font-bold">Change Password</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Preferred Currency */}
        <View className="rounded-[16px] border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <Text className="text-[16px] font-bold mb-1" style={{ color: theme.text }}>Transaction Currency</Text>
          <Text className="text-[13px] leading-[18px] mb-4" style={{ color: theme.textSecondary }}>
            Set your preferred currency for billing, subscriptions, and payouts.
          </Text>

          <View className="flex-row items-center justify-between py-2 border-b border-black/5 dark:border-white/5 mb-4">
            <View>
              <Text className="text-[12px]" style={{ color: theme.textSecondary }}>Active Currency</Text>
              <Text className="text-[16px] font-bold mt-0.5" style={{ color: theme.text }}>
                {activeCurrency ? `${activeCurrency} (${supportedCurrencies[activeCurrency]?.symbol || ""})` : "Not Set"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setChangeCurrencyOpen(true)}
                className="h-9 px-3 rounded-[10px] items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Text className="text-white text-[12px] font-semibold">Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setHistoryOpen(true)}
                className="h-9 px-3 rounded-[10px] border items-center justify-center"
                style={{ borderColor: theme.border }}
              >
                <Text className="text-[12px] font-semibold" style={{ color: theme.text }}>History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 3: Danger Zone */}
        <View className="rounded-[16px] border-[1.5px] p-4 bg-red-500/5" style={{ borderColor: theme.error }}>
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="warning" size={24} color={theme.error} />
            <Text className="text-[16px] font-bold mb-1 ml-2" style={{ color: theme.error }}>Danger Zone</Text>
          </View>
          <Text className="text-[13px] leading-[18px] mb-4" style={{ color: theme.textSecondary }}>
            Temporary deactivate your Medgram account. The account can be reactivated within 7 days using the reactivation link sent to your email.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDeactivateSubmit}
            disabled={deactLoading}
            className="h-11 rounded-[10px] items-center justify-center mt-2"
            style={{ backgroundColor: theme.error }}
          >
            {deactLoading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white text-[14px] font-bold">Deactivate Account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sudo Modal Verification */}
      <SudoVerificationModal
        visible={sudoOpen}
        onClose={(isSuccess) => {
          setSudoOpen(false);
          if (!isSuccess) {
            setPwLoading(false);
            setDeactLoading(false);
          }
        }}
        actionName={sudoAction?.name}
        onSuccess={() => sudoAction?.callback()}
      />

      {/* Change Currency Modal */}
      <Modal visible={changeCurrencyOpen} transparent animationType="slide" onRequestClose={() => setChangeCurrencyOpen(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="w-full max-w-[360px] rounded-[20px] border p-5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[18px] font-bold flex-1" style={{ color: theme.text }}>Select Currency</Text>
              <TouchableOpacity onPress={() => setChangeCurrencyOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[300px] mb-4">
              <View className="gap-2">
                {Object.values(supportedCurrencies).map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => handleUpdateCurrency(c.code)}
                    className="flex-row items-center justify-between p-3 rounded-[12px] border"
                    style={{
                      backgroundColor: activeCurrency === c.code ? theme.primaryLight : theme.surfaceSubtle,
                      borderColor: activeCurrency === c.code ? theme.primary : theme.border,
                    }}
                  >
                    <View>
                      <Text className="text-[14px] font-bold" style={{ color: theme.text }}>{c.code}</Text>
                      <Text className="text-[11px]" style={{ color: theme.textSecondary }}>{c.name}</Text>
                    </View>
                    <Text className="text-[18px] font-bold" style={{ color: theme.primary }}>{c.symbol}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency History Modal */}
      <Modal visible={historyOpen} transparent animationType="slide" onRequestClose={() => setHistoryOpen(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="w-full max-w-[360px] rounded-[20px] border p-5" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[18px] font-bold flex-1" style={{ color: theme.text }}>Currency History</Text>
              <TouchableOpacity onPress={() => setHistoryOpen(false)}>
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[300px] mb-2">
              {currencyHistory.length === 0 ? (
                <Text className="text-center py-6" style={{ color: theme.textSecondary }}>No history entries found</Text>
              ) : (
                <View className="gap-3">
                  {currencyHistory.map((item, idx) => (
                    <View key={idx} className="p-3 rounded-[12px] border" style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[14px] font-bold" style={{ color: theme.text }}>{item.currency_code}</Text>
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: item.is_active ? theme.primaryLight : theme.border }}>
                          <Text className="text-[10px] font-bold" style={{ color: item.is_active ? theme.primary : theme.textSecondary }}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                        Updated: {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


