import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb } from "../components/ScreenKit";

// Mirrors the shared shape used in IdentityScreens' emergency profile -
// duplicated here (not imported) since this is a standalone activation flow
// that shouldn't depend on the Identity module's internals.
const MOCK_EMERGENCY_CONTACTS = [
  { name: "Amaka Obi", relationship: "Spouse", phone: "+234 803 555 0142" },
  { name: "Chidi Obi", relationship: "Sibling", phone: "+234 806 555 0198" },
];

// ─── EMG-01 · ACTIVATE EMERGENCY MODE ───
export function EmergencyModeScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const [activated, setActivated] = useState(false);
  const [holding, setHolding] = useState(false);
  const [notified, setNotified] = useState([]);
  const holdTimer = useRef(null);

  useEffect(() => {
    if (!activated) return;
    const timers = MOCK_EMERGENCY_CONTACTS.map((c, i) =>
      setTimeout(() => setNotified((prev) => [...prev, c.name]), (i + 1) * 700),
    );
    return () => timers.forEach(clearTimeout);
  }, [activated]);

  const startHold = () => {
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      setActivated(true);
      setHolding(false);
    }, 1200);
  };

  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  const deactivate = () => {
    setActivated(false);
    setNotified([]);
    toast.success("Emergency Mode deactivated.");
  };

  if (activated) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.error }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6 items-center" : "px-5 items-center"}>
            <View className="items-center mt-12 mb-6">
              <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center mb-4">
                <MaterialIcons name="emergency" size={40} color="#FFFFFF" />
              </View>
              <Text className="text-white text-xl font-extrabold">Emergency Mode Active</Text>
              <Text className="text-white/80 text-sm mt-1 text-center max-w-[320px]">
                Your location and Emergency Profile are being shared with your Care Circle and
                nearest verified responders.
              </Text>
            </View>

            <View className={`bg-white rounded-2xl p-5 w-full ${isWeb ? "max-w-[480px]" : ""}`}>
              <Text style={{ color: theme.text }} className="text-sm font-bold mb-3">
                {profile?.name || "You"}'s Care Circle
              </Text>
              {MOCK_EMERGENCY_CONTACTS.map((c) => {
                const isNotified = notified.includes(c.name);
                return (
                  <View key={c.name} className="flex-row items-center justify-between py-2">
                    <View>
                      <Text style={{ color: theme.text }} className="text-sm font-semibold">
                        {c.name}
                      </Text>
                      <Text style={{ color: theme.textSecondary }} className="text-xs">
                        {c.relationship}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      {isNotified ? (
                        <>
                          <MaterialIcons name="check-circle" size={16} color={theme.success} />
                          <Text style={{ color: theme.success }} className="text-xs font-bold ml-1">
                            Notified
                          </Text>
                        </>
                      ) : (
                        <Text style={{ color: theme.textMuted }} className="text-xs">
                          Notifying...
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}

              <View style={{ backgroundColor: theme.border }} className="h-[1px] my-3" />

              <View className="flex-row items-center">
                <MaterialIcons name="local-hospital" size={16} color={theme.error} />
                <Text style={{ color: theme.text }} className="text-xs ml-2 flex-1">
                  Searching for nearest verified responders...
                </Text>
              </View>
            </View>

            <View
              className={`flex-row items-center bg-white/15 rounded-xl p-3 mt-4 w-full ${isWeb ? "max-w-[480px]" : ""}`}
            >
              <MaterialIcons name="wifi-off" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs ml-2 flex-1">
                Works on cached data if you lose connectivity.
              </Text>
            </View>

            <TouchableOpacity
              onPress={deactivate}
              className={`bg-white rounded-xl py-4 mt-8 w-full items-center ${isWeb ? "max-w-[480px]" : ""}`}
            >
              <Text style={{ color: theme.error }} className="text-base font-extrabold">
                Deactivate Emergency Mode
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className={isWeb ? "px-6 pt-5" : "px-5 pt-5"}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={20} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold ml-1.5">
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={`flex-1 items-center justify-center ${isWeb ? "px-6" : "px-8"}`}>
          <View style={{ backgroundColor: theme.errorLight }} className="w-24 h-24 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="emergency" size={48} color={theme.error} />
          </View>
          <Text style={{ color: theme.text }} className="text-2xl font-extrabold text-center mb-2">
            Emergency Mode
          </Text>
          <Text style={{ color: theme.textSecondary }} className="text-sm text-center max-w-[320px] mb-10 leading-5">
            Hold the button below to broadcast your location and Emergency Profile to your Care
            Circle and nearest verified responders. Only use this in a real emergency.
          </Text>

          <TouchableOpacity
            onPressIn={startHold}
            onPressOut={cancelHold}
            activeOpacity={0.9}
            style={{
              backgroundColor: theme.error,
              transform: [{ scale: holding ? 0.95 : 1 }],
            }}
            className="w-40 h-40 rounded-full items-center justify-center"
          >
            <MaterialIcons name="touch-app" size={36} color="#FFFFFF" />
            <Text className="text-white text-sm font-extrabold mt-2 text-center px-4">
              {holding ? "Keep Holding..." : "Hold to Activate"}
            </Text>
          </TouchableOpacity>

          <Text style={{ color: theme.textMuted }} className="text-xs text-center mt-10 max-w-[280px]">
            Works even with no connectivity - cached Emergency Profile data is used automatically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
