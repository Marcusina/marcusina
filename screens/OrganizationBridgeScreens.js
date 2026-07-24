import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the organization-bridge API lands.
const MOCK_INVITATION = {
  orgName: "MedGram Clinic, Victoria Island",
  role: "Consulting Physician",
  invitedBy: "Dr. Chidi Eze, Medical Director",
  permissions: [
    "View assigned patients' shared records",
    "Create prescriptions on behalf of the organization",
    "Access the organization's appointment calendar",
    "Use the organization's branding on your profile",
  ],
};

const MOCK_ORG_MEMBERSHIPS = [
  { id: "org1", name: "MedGram Clinic, Victoria Island", role: "Consulting Physician", isActive: true },
  { id: "org2", name: "Lekki Skin & Wellness Clinic", role: "Visiting Dermatologist", isActive: false },
  { id: "org3", name: "Independent Practice", role: "Freelance Provider", isActive: false },
];

// ─── ORG-01 · ORGANIZATION/PROFESSIONAL INVITATION ───
export function OrganizationInvitationScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [responding, setResponding] = useState(false);

  const respond = (accepted) => {
    setResponding(true);
    setTimeout(() => {
      setResponding(false);
      toast.success(accepted ? `You've joined ${MOCK_INVITATION.orgName}.` : "Invitation declined.");
      navigation.goBack();
    }, 500);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Organization Invitation" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row items-center mb-3">
              <View style={{ backgroundColor: theme.primaryLight }} className="w-12 h-12 rounded-xl items-center justify-center mr-3">
                <MaterialIcons name="domain" size={24} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.text }} className="text-base font-extrabold">{MOCK_INVITATION.orgName}</Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">wants to add you as</Text>
              </View>
            </View>
            <View style={{ backgroundColor: theme.primaryLight }} className="self-start px-3 py-1.5 rounded-full mb-3">
              <Text style={{ color: theme.primary }} className="text-xs font-bold">{MOCK_INVITATION.role}</Text>
            </View>
            <Text style={{ color: theme.textSecondary }} className="text-xs">
              Invited by {MOCK_INVITATION.invitedBy}
            </Text>
          </View>

          <SectionLabel>Requested Permissions</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_INVITATION.permissions.map((perm) => (
              <View key={perm} className="flex-row items-start py-2">
                <MaterialIcons name="check-circle" size={16} color={theme.success} style={{ marginTop: 1 }} />
                <Text style={{ color: theme.textSecondary }} className="text-sm ml-2.5 flex-1">{perm}</Text>
              </View>
            ))}
          </View>

          <View className={`mt-6 gap-3 ${isWeb ? "flex-row max-w-[560px]" : ""}`}>
            <TouchableOpacity
              onPress={() => respond(true)}
              disabled={responding}
              style={{ backgroundColor: theme.primary, opacity: responding ? 0.7 : 1 }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            >
              <Text className="text-white text-base font-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => respond(false)}
              disabled={responding}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl border"
            >
              <Text style={{ color: theme.text }} className="text-base font-bold">Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ORG-02 · ORGANIZATION CONTEXT SWITCHER ───
export function OrganizationContextSwitcherScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [memberships, setMemberships] = useState(MOCK_ORG_MEMBERSHIPS);

  const activate = (id) => {
    setMemberships((prev) => prev.map((m) => ({ ...m, isActive: m.id === id })));
    const org = memberships.find((m) => m.id === id);
    toast.success(`Switched to ${org.name}.`);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Switch Organization" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-sm mt-5 mb-4 leading-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            Choose which organization context to use in Professional Mode.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("OrganizationInvitation")}
            style={{ backgroundColor: theme.warningLight }}
            className={`flex-row items-center rounded-2xl p-4 mb-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="mail" size={18} color={theme.warning} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1">
              You have a pending invitation from MedGram Clinic, Victoria Island
            </Text>
            <MaterialIcons name="chevron-right" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            {memberships.map((org) => (
              <TouchableOpacity
                key={org.id}
                onPress={() => activate(org.id)}
                style={{
                  backgroundColor: org.isActive ? theme.primaryLight : theme.surface,
                  borderColor: org.isActive ? theme.primary : theme.border,
                }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name="domain" size={22} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{org.name}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{org.role}</Text>
                </View>
                {org.isActive ? (
                  <MaterialIcons name="check-circle" size={20} color={theme.primary} />
                ) : (
                  <MaterialIcons name="radio-button-unchecked" size={20} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => toast.info("Launching MedGram OS is coming soon.")}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="open-in-new" size={18} color="#FFFFFF" />
            <Text className="text-white text-base font-bold ml-2">Continue to MedGram OS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
