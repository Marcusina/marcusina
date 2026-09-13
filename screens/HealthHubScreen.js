import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { getPatientProfile } from "../api/auth.api";
import { useIsWeb, useCollapsibleHeader, SCREEN_HEADER_HEIGHT } from "../components/ScreenKit";

function HealthBasicRow({ label, value, theme }) {
  return (
    <View className="flex-row justify-between py-2 border-b" style={{ borderColor: theme.divider }}>
      <Text className="text-xs" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text className="text-xs font-semibold flex-1 text-right ml-4" numberOfLines={2} style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}

function NavCard({ icon, label, description, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center p-4 rounded-2xl border mb-3"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: theme.primaryLight }}
      >
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold" style={{ color: theme.text }}>
          {label}
        </Text>
        <Text className="text-xs" style={{ color: theme.textSecondary }}>
          {description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

export function HealthHubScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { headerStyle, scrollProps, headerHeight } = useCollapsibleHeader(SCREEN_HEADER_HEIGHT);
  const { token, user } = useUser();

  const { data: patientProfile, isLoading } = useQuery({
    queryKey: ["patientProfile", user?._id],
    queryFn: () => getPatientProfile(token, user._id),
    enabled: !!user?._id,
  });

  const allergies = Array.isArray(patientProfile?.allergies) ? patientProfile.allergies : [];
  const chronicConditions = Array.isArray(patientProfile?.chronic_conditions)
    ? patientProfile.chronic_conditions
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Animated.View
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: theme.background },
          headerStyle,
        ]}
      >
        <View className={`flex-row items-center justify-between ${isWeb ? "px-6" : "px-4"} py-4`}>
          <Text className="text-2xl font-extrabold" style={{ color: theme.text }}>
            Health
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EmergencyMode")}
            className="flex-row items-center px-3 py-2 rounded-full"
            style={{ backgroundColor: theme.errorLight }}
          >
            <MaterialIcons name="health-and-safety" size={18} color={theme.error} />
            <Text style={{ color: theme.error }} className="text-xs font-bold ml-1.5">Emergency</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: headerHeight }}
        {...scrollProps}
      >
      <View className="px-4 pb-2">
        <Text className="text-xs font-bold uppercase mb-2" style={{ color: theme.textMuted }}>
          Health Basics
        </Text>
        <View
          className="p-4 rounded-2xl border mb-4"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <HealthBasicRow
                label="Blood Group"
                value={patientProfile?.blood_group || "Not set"}
                theme={theme}
              />
              <HealthBasicRow
                label="Height"
                value={patientProfile?.height_cm ? `${patientProfile.height_cm} cm` : "Not set"}
                theme={theme}
              />
              <HealthBasicRow
                label="Weight"
                value={patientProfile?.weight_kg ? `${patientProfile.weight_kg} kg` : "Not set"}
                theme={theme}
              />
              <HealthBasicRow
                label="Allergies"
                value={allergies.length > 0 ? allergies.join(", ") : "None on file"}
                theme={theme}
              />
              <HealthBasicRow
                label="Chronic Conditions"
                value={chronicConditions.length > 0 ? chronicConditions.join(", ") : "None on file"}
                theme={theme}
              />
              <View className="flex-row justify-between py-2">
                <Text className="text-xs" style={{ color: theme.textSecondary }}>
                  Emergency Contact
                </Text>
                <Text
                  className="text-xs font-semibold flex-1 text-right ml-4"
                  numberOfLines={2}
                  style={{ color: theme.text }}
                >
                  {patientProfile?.emergency_contact_name
                    ? `${patientProfile.emergency_contact_name}${patientProfile.emergency_contact_phone ? ` (${patientProfile.emergency_contact_phone})` : ""}`
                    : "Not set"}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text className="text-xs font-bold uppercase mb-2" style={{ color: theme.textMuted }}>
          Care
        </Text>
        <NavCard
          icon="person-search"
          label="Find a Doctor"
          description="Search professionals & organizations"
          onPress={() => navigation.navigate("FindDoctor")}
          theme={theme}
        />
        <NavCard
          icon="event-note"
          label="Appointments"
          description="Upcoming and past appointments"
          onPress={() => navigation.navigate("AppointmentsList")}
          theme={theme}
        />
        <NavCard
          icon="history"
          label="Consultation History"
          description="Past consultations & summaries"
          onPress={() => navigation.navigate("ConsultationHistory")}
          theme={theme}
        />
        <NavCard
          icon="healing"
          label="Prescriptions"
          description="Medications prescribed for you"
          onPress={() => navigation.navigate("PrescriptionsList")}
          theme={theme}
        />
        <NavCard
          icon="shield"
          label="Insurance"
          description="Your coverage and plan details"
          onPress={() => navigation.navigate("InsuranceList")}
          theme={theme}
        />
        <NavCard
          icon="share"
          label="Referrals"
          description="Track referrals to specialists"
          onPress={() => navigation.navigate("ReferralsList")}
          theme={theme}
        />
        <NavCard
          icon="checklist"
          label="Care Plans"
          description="Chronic disease management & wellness"
          onPress={() => navigation.navigate("CarePlansList")}
          theme={theme}
        />

        <Text className="text-xs font-bold uppercase mb-2 mt-2" style={{ color: theme.textMuted }}>
          Records
        </Text>
        <NavCard
          icon="folder-shared"
          label="Health Record"
          description="Diagnoses, medications, labs & more"
          onPress={() => navigation.navigate("HealthRecordHome")}
          theme={theme}
        />
        <NavCard
          icon="vaccines"
          label="Vaccination Record"
          description="Certificates & immunization history"
          onPress={() => navigation.navigate("VaccinationRecord")}
          theme={theme}
        />
        <NavCard
          icon="inventory-2"
          label="Document Vault"
          description="Scanned documents, IDs & insurance cards"
          onPress={() => navigation.navigate("DocumentVault")}
          theme={theme}
        />
        <NavCard
          icon="science"
          label="Laboratory & Diagnostics"
          description="Lab & imaging orders, results, and trends"
          onPress={() => navigation.navigate("LabOrdersList")}
          theme={theme}
        />

        <Text className="text-xs font-bold uppercase mb-2 mt-2" style={{ color: theme.textMuted }}>
          Identity & Coverage
        </Text>
        <NavCard
          icon="badge"
          label="Digital Health ID"
          description="QR code, ID number & emergency card"
          onPress={() => navigation.navigate("DigitalHealthId")}
          theme={theme}
        />
        <NavCard
          icon="flight"
          label="MedGram Passport"
          description="Vaccination & travel credential"
          onPress={() => navigation.navigate("MedGramPassport")}
          theme={theme}
        />

        <Text className="text-xs font-bold uppercase mb-2 mt-2" style={{ color: theme.textMuted }}>
          Insights
        </Text>
        <NavCard
          icon="insights"
          label="Health Insights"
          description="AI risk trends & summaries"
          onPress={() => navigation.navigate("AIInsights")}
          theme={theme}
        />
        <NavCard
          icon="auto-awesome"
          label="Ask the AI Assistant"
          description="Symptom check & decision support"
          onPress={() => navigation.navigate("AIChatHome")}
          theme={theme}
        />
      </View>
      </Animated.ScrollView>
    </View>
  );
}
