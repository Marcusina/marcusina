import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, StatusBadge, EmptyState, FormField, NavRow } from "../components/ScreenKit";
import {
  getPrescriptionById,
  getUserPrescriptions,
  requestRefill,
  updatePrescriptionReminder,
  uploadPrescription,
} from "../api/meds.api";

const STATUS_COLORS = {
  pending: "#F59E0B",
  sent_to_pharmacy: "#3B82F6",
  dispensed: "#10B981",
  partially_dispensed: "#10B981",
  cancelled: "#EF4444",
  expired: "#6B7280",
};

const REFILL_INELIGIBLE_STATUSES = ["cancelled", "expired"];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({ label, value, theme }) {
  return (
    <View className="flex-row justify-between items-start py-2">
      <Text style={{ color: theme.textSecondary }} className="text-[13px]">{label}</Text>
      <Text style={{ color: theme.text }} className="text-[13px] font-semibold flex-1 text-right ml-4" numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

// A deterministic pseudo-QR pattern for visual purposes only, matching the
// approach used by IdentityScreens.js's DigitalHealthIdScreen - the real
// encoded QR will replace this once prescription verification is wired up.
function QRPlaceholder({ seed = "MEDGRAM-RX", size = 176 }) {
  const cells = 9;
  const cellSize = size / cells;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bits = [];
  for (let i = 0; i < cells * cells; i++) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    bits.push((hash >> 16) % 3 === 0);
  }
  const isFinder = (r, c) =>
    (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3);

  return (
    <View style={{ width: size, height: size, backgroundColor: "#FFFFFF" }} className="rounded-xl p-2 items-center justify-center">
      <View style={{ width: size - 16, height: size - 16 }}>
        {Array.from({ length: cells }).map((_, r) => (
          <View key={r} style={{ flexDirection: "row" }}>
            {Array.from({ length: cells }).map((_, c) => {
              const on = isFinder(r, c) || bits[r * cells + c];
              return (
                <View
                  key={c}
                  style={{
                    width: cellSize - 1.8,
                    height: cellSize - 1.8,
                    margin: 0.9,
                    backgroundColor: on ? "#0A0A0A" : "transparent",
                    borderRadius: 1,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── RX-02 · PRESCRIPTION DETAIL ───
export function PrescriptionDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};

  const { data: prescription, isLoading, error } = useQuery({
    queryKey: ["prescription", id],
    queryFn: () => getPrescriptionById(id),
    enabled: !!id,
  });

  const [refillRequested, setRefillRequested] = useState(false);
  const refillMutation = useMutation({
    mutationFn: () => requestRefill(id),
    onSuccess: () => {
      setRefillRequested(true);
      toast.success("Refill requested");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to request refill");
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !prescription) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Prescription" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState
          icon="error-outline"
          title="Couldn't load this prescription"
          description={error?.message || "The prescription detail service isn't available right now."}
        />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[prescription.status] || theme.textMuted;
  const medications = Array.isArray(prescription.medications) ? prescription.medications : [];
  const providerName = prescription.provider_id
    ? `${prescription.provider_id.profile?.first_name || ""} ${prescription.provider_id.profile?.last_name || ""}`.trim() ||
      prescription.provider_id.username ||
      "Provider"
    : "Provider";
  const isRefillIneligible = REFILL_INELIGIBLE_STATUSES.includes(prescription.status);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Prescription" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-4 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text style={{ color: theme.text }} className="text-base font-extrabold flex-1 pr-2">
                {prescription.prescription_number || "Prescription"}
              </Text>
              <StatusBadge label={prescription.status?.replace(/_/g, " ")} color={statusColor} />
            </View>
            <DetailRow label="Prescribed" value={formatDate(prescription.prescription_date) || "—"} theme={theme} />
            {prescription.expires_at ? (
              <DetailRow label="Expires" value={formatDate(prescription.expires_at)} theme={theme} />
            ) : null}
            <DetailRow label="Prescribing Provider" value={providerName} theme={theme} />
          </View>

          {medications.length > 0 && (
            <>
              <SectionLabel>Medications</SectionLabel>
              <View className={isWeb ? "max-w-[560px]" : ""}>
                {medications.map((med, i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                  >
                    <MaterialIcons name="medication" size={18} color={theme.primary} />
                    <View className="flex-1 ml-2.5">
                      <Text style={{ color: theme.text }} className="text-sm font-bold">{med.name}</Text>
                      {med.dosage ? (
                        <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{med.dosage}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {prescription.patient_instructions ? (
            <>
              <SectionLabel>Instructions</SectionLabel>
              <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className={`rounded-2xl p-4 border ${isWeb ? "max-w-[560px]" : ""}`}>
                <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">{prescription.patient_instructions}</Text>
              </View>
            </>
          ) : null}

          <SectionLabel>Actions</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            <NavRow
              icon="qr-code-2"
              label="Verification Code"
              description="Show this to a pharmacy to redeem"
              onPress={() => navigation.navigate("PrescriptionQR", { id })}
            />
            <NavRow
              icon="local-pharmacy"
              label="Find Pharmacy"
              description="See where this medication is in stock"
              onPress={() => navigation.navigate("FindPharmacy", { id, medications })}
            />
            <NavRow
              icon="notifications-active"
              label="Medication Reminder"
              description="Set up a reminder to take this medication"
              onPress={() => navigation.navigate("MedicationReminder", { id })}
            />
            <NavRow
              icon="show-chart"
              label="Medication History"
              description="Your medications and adherence over time"
              onPress={() => navigation.navigate("MedicationHistory")}
            />

            {isRefillIneligible ? (
              <View style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }} className="rounded-2xl p-4 border mb-3">
                <Text style={{ color: theme.textMuted }} className="text-xs">
                  This prescription is {prescription.status} and isn't eligible for a refill request.
                </Text>
              </View>
            ) : refillRequested ? (
              <View style={{ backgroundColor: theme.successLight }} className="flex-row items-center rounded-2xl p-4 mb-3">
                <MaterialIcons name="check-circle" size={18} color={theme.success} />
                <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2.5">Refill requested — your pharmacy will confirm.</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => refillMutation.mutate()}
                disabled={refillMutation.isPending}
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-3.5 rounded-xl mb-3"
              >
                <Text className="text-white text-sm font-bold">
                  {refillMutation.isPending ? "Requesting..." : "Request Refill"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── RX-03 · PRESCRIPTION QR/VERIFICATION CODE VIEW ───
export function PrescriptionQRScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Verification Code" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <View className="flex-1 items-center justify-center px-8">
        <QRPlaceholder seed={id || "MEDGRAM-RX"} />
        <Text style={{ color: theme.text }} className="text-sm font-bold mt-6 text-center">
          Show this code to your pharmacist
        </Text>
        <Text style={{ color: theme.textMuted }} className="text-xs mt-1 text-center">
          Prescription {id}
        </Text>
      </View>
    </View>
  );
}

// ─── RX-04/05 · FIND PHARMACY WITH STOCK & RESERVE/ORDER ───
// Placeholder directory until a real pharmacy-stock lookup endpoint lands -
// see design.md: this degrades to a "reserved, pharmacy will confirm" state
// instead of blocking on Marketplace's checkout build-out.
const MOCK_PHARMACIES = [
  { id: "ph1", name: "MedGram Pharmacy, Victoria Island", distance: "1.2 km", price: 3500 },
  { id: "ph2", name: "Lekki Health Pharmacy", distance: "2.8 km", price: 3200 },
  { id: "ph3", name: "Greenview Pharmacy, Ikoyi", distance: "4.1 km", price: null },
];

export function FindPharmacyScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};
  const [reservedId, setReservedId] = useState(null);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Find Pharmacy" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
            {MOCK_PHARMACIES.map((ph) => {
              const isReserved = reservedId === ph.id;
              return (
                <View
                  key={ph.id}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                >
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{ph.name}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{ph.distance}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs mt-0.5">
                    {ph.price != null ? `₦${ph.price.toLocaleString()}` : "Price not available"}
                  </Text>
                  {isReserved ? (
                    <View style={{ backgroundColor: theme.successLight }} className="flex-row items-center rounded-xl p-2.5 mt-3">
                      <MaterialIcons name="check-circle" size={16} color={theme.success} />
                      <Text style={{ color: theme.text }} className="text-xs font-semibold ml-2">Reserved — pharmacy will confirm</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setReservedId(ph.id);
                        toast.success(`Reservation sent to ${ph.name}`);
                      }}
                      style={{ backgroundColor: theme.primary }}
                      className="flex-row items-center justify-center py-2.5 rounded-xl mt-3"
                    >
                      <Text className="text-white text-xs font-bold">Reserve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── RX-07 · MEDICATION REMINDER SETUP ───
const REMINDER_TIMES = ["Morning", "Afternoon", "Evening"];

export function MedicationReminderScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};
  const [enabled, setEnabled] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState([]);

  const reminderMutation = useMutation({
    mutationFn: () => updatePrescriptionReminder(id, { enabled, times: selectedTimes }),
    onSuccess: () => toast.success("Reminder saved"),
    onError: (err) => toast.error(err.message || "Failed to save reminder"),
  });

  const toggleTime = (t) => {
    setSelectedTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Medication Reminder" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`flex-row items-center justify-between rounded-2xl p-4 border mt-5 ${isWeb ? "max-w-[500px]" : ""}`}
          >
            <View>
              <Text style={{ color: theme.text }} className="text-sm font-bold">Enable Reminder</Text>
              <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">Get notified when it's time to take this medication</Text>
            </View>
            <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: theme.primary }} />
          </View>

          {enabled && (
            <>
              <SectionLabel>When</SectionLabel>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {REMINDER_TIMES.map((t) => {
                  const active = selectedTimes.includes(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => toggleTime(t)}
                      style={{ backgroundColor: active ? theme.primary : theme.surfaceSubtle }}
                      className="px-3.5 py-2 rounded-full"
                    >
                      <Text style={{ color: active ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold">{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={() => reminderMutation.mutate()}
            disabled={reminderMutation.isPending}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-3.5 rounded-xl mt-2 ${isWeb ? "max-w-[500px]" : ""}`}
          >
            <Text className="text-white text-sm font-bold">
              {reminderMutation.isPending ? "Saving..." : "Save Reminder"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── RX-08 · MEDICATION HISTORY / ADHERENCE TIMELINE ───
export function MedicationHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { token, user } = useUser();

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions", user?._id],
    queryFn: () => getUserPrescriptions(token, user._id),
    enabled: !!user?._id,
  });

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Medication History" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon="show-chart"
          title="No medication history yet"
          description="Your prescriptions will show up here once they're issued."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
              {prescriptions.map((p) => (
                <View
                  key={p._id}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                >
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                      {p.prescription_number || "Prescription"}
                    </Text>
                    <StatusBadge label={p.status?.replace(/_/g, " ")} color={STATUS_COLORS[p.status] || theme.textMuted} />
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-xs">
                    Prescribed {formatDate(p.prescription_date)}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs mt-2">
                    Adherence tracking begins once a reminder is set and doses are logged.
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── RX-09/10 · [Pro] CREATE PRESCRIPTION + DRUG INTERACTION/ALLERGY ALERT ───
export function CreatePrescriptionScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { profile } = useUser();
  const { patientId = "demo-patient", patientName = "Patient" } = route?.params || {};

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [interactionWarning, setInteractionWarning] = useState(null);

  const isPro = !!(profile?.role && profile.role !== "patient");

  const createMutation = useMutation({
    mutationFn: () =>
      uploadPrescription(patientId, {
        medications: [{ name: medicationName, dosage }],
        patient_instructions: instructions,
      }),
    onSuccess: (result) => {
      const warnings = result?.interaction_warnings || result?.warnings;
      if (Array.isArray(warnings) && warnings.length > 0) {
        setInteractionWarning(warnings.join(" "));
      } else if (typeof result?.interaction_warning === "string" && result.interaction_warning) {
        setInteractionWarning(result.interaction_warning);
      } else {
        toast.success("Prescription created");
        navigation.goBack();
      }
    },
    onError: (err) => toast.error(err.message || "Failed to create prescription"),
  });

  if (!isPro) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Create Prescription" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState
          icon="lock"
          title="Professional access required"
          description="This screen is only available to verified healthcare professionals."
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Create Prescription" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className="text-sm mt-5 mb-2">
            Prescribing for <Text style={{ color: theme.text }} className="font-bold">{patientName}</Text>
          </Text>

          <View className={isWeb ? "max-w-[500px]" : ""}>
            <FormField label="Medication" value={medicationName} onChangeText={setMedicationName} placeholder="e.g. Amoxicillin 500mg" />
            <FormField label="Dosage" value={dosage} onChangeText={setDosage} placeholder="e.g. 1 capsule, 3x daily" />
            <FormField label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Patient instructions" multiline last />
          </View>

          {interactionWarning ? (
            <View style={{ backgroundColor: theme.warningLight, borderColor: theme.warning }} className="rounded-2xl p-4 border mt-5">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="warning" size={18} color={theme.warning} />
                <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">Interaction / Allergy Alert</Text>
              </View>
              <Text style={{ color: theme.textSecondary }} className="text-sm leading-5 mb-3">{interactionWarning}</Text>
              <TouchableOpacity
                onPress={() => {
                  toast.info("Prescription saved with acknowledged warning.");
                  navigation.goBack();
                }}
                style={{ backgroundColor: theme.warning }}
                className="flex-row items-center justify-center py-3 rounded-xl"
              >
                <Text className="text-white text-sm font-bold">Acknowledge & Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => createMutation.mutate()}
              disabled={createMutation.isPending || !medicationName}
              style={{ backgroundColor: medicationName ? theme.primary : theme.surfaceSubtle }}
              className={`flex-row items-center justify-center py-3.5 rounded-xl mt-6 ${isWeb ? "max-w-[500px]" : ""}`}
            >
              <Text style={{ color: medicationName ? "#FFFFFF" : theme.textMuted }} className="text-sm font-bold">
                {createMutation.isPending ? "Creating..." : "Create Prescription"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
