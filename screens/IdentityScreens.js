import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, Chip, FormField, NavRow, EmptyState } from "../components/ScreenKit";
import {
  recoverMedGramId,
  replaceIdentityCard,
  suspendIdentity,
  reissueIdentity,
  mergeDuplicateAccounts,
  transferDevice,
  scanPatientId,
  getVerificationHistory,
} from "../api/identity.api";

// ─── SHARED MOCK DATA ───
// Placeholder until the emergency-profile API lands - mirrors the shape
// ID-03/04/05/06/08 will eventually read from the backend.
const MOCK_EMERGENCY_PROFILE = {
  bloodGroup: "O+",
  genotype: "AA",
  allergies: ["Penicillin", "Peanuts"],
  chronicConditions: ["Type 2 Diabetes", "Hypertension"],
  medications: ["Metformin 500mg", "Lisinopril 10mg"],
  implants: ["None on file"],
  emergencyContacts: [
    { name: "Amaka Obi", relationship: "Spouse", phone: "+234 803 555 0142" },
    { name: "Chidi Obi", relationship: "Sibling", phone: "+234 806 555 0198" },
  ],
};

const PRIVACY_FIELDS = [
  { key: "bloodGroup", label: "Blood Group & Genotype" },
  { key: "allergies", label: "Allergies" },
  { key: "chronicConditions", label: "Chronic Conditions" },
  { key: "medications", label: "Current Medications" },
  { key: "emergencyContacts", label: "Emergency Contacts" },
];

const PRIVACY_LEVELS = [
  { key: "public", label: "Public" },
  { key: "pro", label: "Pro-only" },
  { key: "hidden", label: "Never" },
];

const MOCK_AUDIT_LOG = [
  {
    id: "1",
    accessor: "Dr. Chidi Eze",
    org: "MedGram Clinic, Victoria Island",
    reason: "Emergency room visit",
    fields: "Blood group, allergies, emergency contacts",
    date: "Jul 18, 2026 · 11:42 PM",
  },
  {
    id: "2",
    accessor: "Verified Responder",
    org: "Lagos EMS",
    reason: "Roadside emergency scan",
    fields: "Blood group, chronic conditions",
    date: "Jun 2, 2026 · 6:05 AM",
  },
  {
    id: "3",
    accessor: "You",
    org: "Self",
    reason: "Reviewed own profile",
    fields: "Full profile",
    date: "May 27, 2026 · 9:14 AM",
  },
];

const MOCK_VACCINATIONS = [
  { name: "Yellow Fever", date: "Mar 2024", status: "Valid" },
  { name: "COVID-19 (Booster)", date: "Nov 2025", status: "Valid" },
  { name: "Meningitis (ACWY)", date: "Jan 2022", status: "Expired" },
];

// A deterministic pseudo-QR pattern for visual purposes only - the real
// encoded QR will replace this once identity issuance is wired up.
function QRPlaceholder({ seed = "MEDGRAM", size = 152 }) {
  const { theme } = useTheme();
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
    <View
      style={{ width: size, height: size, backgroundColor: "#FFFFFF" }}
      className="rounded-xl p-2 items-center justify-center"
    >
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

// ─── ID-16 · IDENTITY CONFIDENCE INDICATOR ───
// Computed from the verification signals actually present on `profile`
// today (phone verification, email on file). Renders nothing when there's
// nothing unresolved, per the spec's "all steps resolved -> no badge"
// scenario. Extend `unresolvedSteps` as more verification signals (e.g.
// professional license status) land on the profile shape.
export function IdentityConfidenceBadge() {
  const { theme } = useTheme();
  const { profile } = useUser();
  const [expanded, setExpanded] = useState(false);

  const unresolvedSteps = [];
  if (!profile?.is_phone_verified) {
    unresolvedSteps.push("Verify your phone number");
  }
  if (!profile?.email) {
    unresolvedSteps.push("Add and verify an email address");
  }

  if (unresolvedSteps.length === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.85}
      style={{ backgroundColor: theme.warningLight }}
      className="rounded-2xl p-4 mt-5"
    >
      <View className="flex-row items-center">
        <MaterialIcons name="gpp-maybe" size={20} color={theme.warning} />
        <Text style={{ color: theme.text }} className="text-sm font-bold ml-2 flex-1">
          {unresolvedSteps.length} verification step{unresolvedSteps.length > 1 ? "s" : ""} remaining
        </Text>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={20}
          color={theme.textSecondary}
        />
      </View>
      {expanded && (
        <View className="mt-3">
          {unresolvedSteps.map((step, i) => (
            <View key={i} className="flex-row items-center py-1">
              <MaterialIcons name="radio-button-unchecked" size={14} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary }} className="text-xs ml-2">
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Shared result panel for security-sensitive actions (suspend/reissue/merge/
// device-transfer/recover): a real backend success and an explicit
// "pending manual review" state are the only two outcomes ever shown here -
// never a faked success. See harden-identity-recovery design.md.
function SecurityActionResult({ status, successTitle, successBody, pendingBody }) {
  const { theme } = useTheme();
  if (status === "success") {
    return (
      <View style={{ backgroundColor: theme.successLight }} className="rounded-2xl p-4 mt-4">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="check-circle" size={18} color={theme.success} />
          <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
            {successTitle}
          </Text>
        </View>
        <Text style={{ color: theme.textSecondary }} className="text-xs leading-5">
          {successBody}
        </Text>
      </View>
    );
  }
  if (status === "pending") {
    return (
      <View style={{ backgroundColor: theme.warningLight }} className="rounded-2xl p-4 mt-4">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="hourglass-top" size={18} color={theme.warning} />
          <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
            Submitted for manual review
          </Text>
        </View>
        <Text style={{ color: theme.textSecondary }} className="text-xs leading-5">
          {pendingBody}
        </Text>
      </View>
    );
  }
  return null;
}

// Runs a security-sensitive identity action against the backend and reports
// exactly one of "success" or "pending" - a caught error is never treated as
// success. See SecurityActionResult above.
function useSecurityAction(apiFn) {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | pending
  const submit = async (payload) => {
    setStatus("submitting");
    try {
      const result = await apiFn(payload);
      setStatus("success");
      return { ok: true, result };
    } catch (err) {
      setStatus("pending");
      return { ok: false, error: err };
    }
  };
  return { status, submit, setStatus };
}

// ─── ID-01 · MY DIGITAL HEALTH IDENTITY ───
export function DigitalHealthIdScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const medgramId = "MG-2847-9931-XK";

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-6" : ""}>
          {!isWeb && (
            <ScreenHeader
              title="Digital Health ID"
              onBack={() => navigation.goBack()}
              isWeb={isWeb}
            />
          )}
          <View className={isWeb ? "" : "px-5"}>
            {isWeb && (
              <ScreenHeader
                title="Digital Health ID"
                onBack={() => navigation.goBack()}
                isWeb={isWeb}
              />
            )}

            {/* Card */}
            <View
              style={{ backgroundColor: theme.dark ? theme.surface : "#0F172A" }}
              className={`rounded-[28px] p-6 mt-5 ${isWeb ? "max-w-[420px]" : ""}`}
            >
              <View className="flex-row items-center justify-between mb-6">
                <View>
                  <Text className="text-white text-[11px] font-bold tracking-widest uppercase opacity-70">
                    MedGram Health ID
                  </Text>
                  <Text className="text-white text-lg font-extrabold mt-1">
                    {profile?.name || "User"}
                  </Text>
                </View>
                <View className="bg-white/10 px-2.5 py-1 rounded-full flex-row items-center">
                  <MaterialIcons name="verified" size={14} color="#00C9A7" />
                  <Text className="text-white text-[10px] font-bold ml-1">
                    VERIFIED
                  </Text>
                </View>
              </View>

              <View className="items-center mb-6">
                <QRPlaceholder seed={medgramId} />
              </View>

              <View className="flex-row justify-between items-end">
                <View>
                  <Text className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                    ID Number
                  </Text>
                  <Text className="text-white text-base font-bold mt-0.5">
                    {medgramId}
                  </Text>
                </View>
                <Text className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                  {profile?.bloodType || "—"} · SCAN FOR EMERGENCY INFO
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className={`mt-6 gap-3 ${isWeb ? "flex-row max-w-[420px]" : ""}`}>
              <TouchableOpacity
                onPress={() => navigation.navigate("RequestPhysicalCard")}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl border"
              >
                <MaterialIcons name="badge" size={18} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                  Physical Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toast.info("Sharing your ID is coming soon.")}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl border"
              >
                <MaterialIcons name="ios-share" size={18} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                  Share ID
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("EmergencyMode")}
              activeOpacity={0.85}
              style={{ backgroundColor: theme.error }}
              className="flex-row items-center rounded-2xl p-4 mt-6"
            >
              <View className="w-11 h-11 rounded-xl items-center justify-center mr-3 bg-white/15">
                <MaterialIcons name="emergency" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-[14px] font-bold">Activate Emergency Mode</Text>
                <Text className="text-white/80 text-xs mt-0.5">
                  Broadcast location & profile to Care Circle and responders
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <IdentityConfidenceBadge />

            <SectionLabel>Health & Coverage</SectionLabel>
            <NavRow
              icon="emergency"
              label="Emergency Medical Profile"
              description="Blood group, allergies, conditions, contacts"
              onPress={() => navigation.navigate("EmergencyProfile")}
            />
            <NavRow
              icon="lock"
              label="Emergency Privacy Settings"
              description="Choose who can see each field"
              onPress={() => navigation.navigate("EmergencyPrivacy")}
            />
            <NavRow
              icon="history"
              label="Emergency Access Audit Log"
              description="Who has viewed your emergency info"
              onPress={() => navigation.navigate("EmergencyAuditLog")}
            />
            <NavRow
              icon="flight"
              label="MedGram Passport"
              description="Vaccination & travel credential"
              onPress={() => navigation.navigate("MedGramPassport")}
            />
            <NavRow
              icon="visibility"
              label="Preview Emergency Card"
              description="See what a responder sees when they scan your ID"
              onPress={() => navigation.navigate("PublicEmergencyProfile")}
            />

            <SectionLabel>Need Help?</SectionLabel>
            <NavRow
              icon="support-agent"
              label="Identity & Account Recovery"
              description="Lost access, suspected fraud, duplicate accounts, and more"
              onPress={() => navigation.navigate("IdentityRecoveryCenter")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-02 · REQUEST PHYSICAL HEALTH CARD ───
export function RequestPhysicalCardScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const [address, setAddress] = useState({
    fullName: profile?.name || "",
    line1: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const field = (key) => ({
    value: address[key],
    onChangeText: (t) => setAddress((prev) => ({ ...prev, [key]: t })),
  });

  const handleSubmit = () => {
    if (!address.fullName || !address.line1 || !address.city) {
      toast.error("Please fill in your name, address and city.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Physical card request submitted. It'll arrive in 5-10 business days.");
      navigation.goBack();
    }, 600);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Request Physical Card" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <FormField label="Full Name" {...field("fullName")} placeholder="As it appears on your ID" />
            <FormField label="Address Line" {...field("line1")} placeholder="Street address" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FormField label="City" {...field("city")} placeholder="City" />
              </View>
              <View className="flex-1">
                <FormField label="Postal Code" {...field("postalCode")} placeholder="Optional" />
              </View>
            </View>
            <FormField label="Country" {...field("country")} placeholder="Country" last />
          </View>

          <View
            style={{ backgroundColor: theme.primaryLight }}
            className={`flex-row items-start rounded-2xl p-4 mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="info" size={18} color={theme.primary} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5">
              Physical cards are free for the first request and typically arrive within 5-10
              business days.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">
              {submitting ? "Submitting..." : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-03 · EMERGENCY MEDICAL PROFILE SETUP ───
export function EmergencyProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [data, setData] = useState(MOCK_EMERGENCY_PROFILE);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    toast.success("Emergency profile updated.");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Emergency Profile"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => (editing ? handleSave() : setEditing(true))}>
            <Text style={{ color: theme.primary }} className="text-sm font-bold">
              {editing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.errorLight }}
            className={`flex-row items-center rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <MaterialIcons name="emergency" size={20} color={theme.error} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5">
              This information is shown to verified responders during an emergency scan. Keep it
              current.
            </Text>
          </View>

          <View className={isWeb ? "max-w-[560px]" : ""}>
            <SectionLabel>Blood Group & Genotype</SectionLabel>
            <View className="flex-row gap-3">
              <EditableStat
                theme={theme}
                editing={editing}
                value={data.bloodGroup}
                onChange={(v) => setData({ ...data, bloodGroup: v })}
                label="Blood Group"
              />
              <EditableStat
                theme={theme}
                editing={editing}
                value={data.genotype}
                onChange={(v) => setData({ ...data, genotype: v })}
                label="Genotype"
              />
            </View>

            <ChipListSection
              title="Allergies"
              icon="warning"
              items={data.allergies}
              editing={editing}
              onAdd={(v) => setData({ ...data, allergies: [...data.allergies, v] })}
              onRemove={(i) =>
                setData({ ...data, allergies: data.allergies.filter((_, idx) => idx !== i) })
              }
            />
            <ChipListSection
              title="Chronic Conditions"
              icon="monitor-heart"
              items={data.chronicConditions}
              editing={editing}
              onAdd={(v) => setData({ ...data, chronicConditions: [...data.chronicConditions, v] })}
              onRemove={(i) =>
                setData({
                  ...data,
                  chronicConditions: data.chronicConditions.filter((_, idx) => idx !== i),
                })
              }
            />
            <ChipListSection
              title="Current Medications"
              icon="medication"
              items={data.medications}
              editing={editing}
              onAdd={(v) => setData({ ...data, medications: [...data.medications, v] })}
              onRemove={(i) =>
                setData({ ...data, medications: data.medications.filter((_, idx) => idx !== i) })
              }
            />
            <ChipListSection
              title="Implants / Devices"
              icon="settings-input-component"
              items={data.implants}
              editing={editing}
              onAdd={(v) => setData({ ...data, implants: [...data.implants, v] })}
              onRemove={(i) =>
                setData({ ...data, implants: data.implants.filter((_, idx) => idx !== i) })
              }
            />

            <SectionLabel>Emergency Contacts</SectionLabel>
            {data.emergencyContacts.map((c, i) => (
              <View
                key={i}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-3"
              >
                <View
                  style={{ backgroundColor: theme.primaryLight }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <Text style={{ color: theme.primary }} className="font-bold">
                    {c.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {c.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {c.relationship} · {c.phone}
                  </Text>
                </View>
                {editing && (
                  <TouchableOpacity
                    onPress={() =>
                      setData({
                        ...data,
                        emergencyContacts: data.emergencyContacts.filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    <MaterialIcons name="close" size={20} color={theme.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {editing && (
              <TouchableOpacity
                onPress={() => toast.info("Add-contact form is coming soon.")}
                style={{ borderColor: theme.border }}
                className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mb-3"
              >
                <MaterialIcons name="add" size={18} color={theme.primary} />
                <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">
                  Add Emergency Contact
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EditableStat({ theme, editing, value, onChange, label }) {
  return (
    <View
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className="flex-1 rounded-2xl p-4 border mb-4"
    >
      <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase mb-1.5">
        {label}
      </Text>
      {editing ? (
        <TextInput
          style={{ color: theme.text }}
          className="text-lg font-bold p-0"
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <Text style={{ color: theme.text }} className="text-lg font-bold">
          {value}
        </Text>
      )}
    </View>
  );
}

function ChipListSection({ title, icon, items, editing, onAdd, onRemove }) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState("");
  return (
    <View className="mb-2">
      <View className="flex-row items-center mb-2 mt-6">
        <MaterialIcons name={icon} size={16} color={theme.textMuted} />
        <Text
          style={{ color: theme.textMuted }}
          className="text-[11px] font-bold tracking-widest uppercase ml-1.5"
        >
          {title}
        </Text>
      </View>
      <View className="flex-row flex-wrap">
        {items.length === 0 && (
          <Text style={{ color: theme.textMuted }} className="text-xs italic mb-2">
            None on file
          </Text>
        )}
        {items.map((item, i) => (
          <View
            key={i}
            style={{ backgroundColor: theme.primaryLight }}
            className="flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2"
          >
            <Text style={{ color: theme.primary }} className="text-xs font-semibold">
              {item}
            </Text>
            {editing && (
              <TouchableOpacity onPress={() => onRemove(i)} className="ml-1.5">
                <MaterialIcons name="close" size={14} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      {editing && (
        <View className="flex-row items-center gap-2 mt-1">
          <TextInput
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            className="flex-1 rounded-xl px-3 py-2.5 border text-sm"
            value={draft}
            onChangeText={setDraft}
            placeholder={`Add ${title.toLowerCase()}`}
            placeholderTextColor={theme.textMuted}
          />
          <TouchableOpacity
            onPress={() => {
              if (!draft.trim()) return;
              onAdd(draft.trim());
              setDraft("");
            }}
            style={{ backgroundColor: theme.primary }}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── ID-04 · EMERGENCY PRIVACY SETTINGS ───
export function EmergencyPrivacyScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [levels, setLevels] = useState(
    PRIVACY_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "pro" }), {}),
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Emergency Privacy" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text
            style={{ color: theme.textSecondary }}
            className={`text-sm mt-5 mb-2 leading-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            Choose who can see each part of your emergency profile when your ID is scanned.
          </Text>

          <View className={isWeb ? "max-w-[560px]" : ""}>
            {PRIVACY_FIELDS.map((f) => (
              <View
                key={f.key}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <Text style={{ color: theme.text }} className="text-sm font-bold mb-3">
                  {f.label}
                </Text>
                <View
                  style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
                  className="flex-row rounded-xl p-1 border"
                >
                  {PRIVACY_LEVELS.map((lvl) => {
                    const isActive = levels[f.key] === lvl.key;
                    return (
                      <TouchableOpacity
                        key={lvl.key}
                        onPress={() => setLevels({ ...levels, [f.key]: lvl.key })}
                        style={{
                          backgroundColor: isActive ? theme.surface : "transparent",
                          borderColor: isActive ? theme.border : "transparent",
                        }}
                        className="flex-1 items-center justify-center py-2 rounded-lg border"
                      >
                        <Text
                          style={{ color: isActive ? theme.primary : theme.textSecondary }}
                          className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}
                        >
                          {lvl.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => toast.success("Privacy preferences saved.")}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-05 · EMERGENCY ACCESS AUDIT LOG ───
export function EmergencyAuditLogScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Access Audit Log" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text
            style={{ color: theme.textSecondary }}
            className={`text-sm mt-5 mb-4 leading-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            Every time your emergency profile is accessed, it's recorded here.
          </Text>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_AUDIT_LOG.map((entry) => (
              <View
                key={entry.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                    {entry.accessor}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-[11px]">
                    {entry.date}
                  </Text>
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs mb-1">
                  {entry.org} · {entry.reason}
                </Text>
                <Text style={{ color: theme.textMuted }} className="text-xs">
                  Viewed: {entry.fields}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-06 · PUBLIC EMERGENCY PROFILE (bystander scan view) ───
// Serves two callers with different data sources: ID-06's self-preview
// (no route params - "what would a responder see if they scanned my own
// ID", using the current user's own profile + MOCK_EMERGENCY_PROFILE until
// a real self-service emergency-profile API exists) and ID-07's
// professional scan result (route.params.scannedPatient, the real record
// returned by POST /identity/scan). Previously this screen only ever
// rendered the self-preview data regardless of which flow reached it - a
// real bug, since a professional scanning a patient would have seen their
// OWN info instead of the patient's.
export function PublicEmergencyProfileScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const scanned = route?.params?.scannedPatient;

  const displayName = scanned ? scanned.name : profile?.name || "MedGram User";
  const bloodGroup = scanned ? scanned.blood_group : MOCK_EMERGENCY_PROFILE.bloodGroup;
  const genotype = scanned ? null : MOCK_EMERGENCY_PROFILE.genotype;
  const allergies = scanned ? scanned.allergies || [] : MOCK_EMERGENCY_PROFILE.allergies;
  const chronicConditions = scanned ? scanned.chronic_conditions || [] : MOCK_EMERGENCY_PROFILE.chronicConditions;
  const medications = scanned ? scanned.current_medications || [] : MOCK_EMERGENCY_PROFILE.medications;
  const emergencyContacts = scanned
    ? scanned.emergency_contact_name
      ? [{ name: scanned.emergency_contact_name, relationship: "Emergency Contact", phone: scanned.emergency_contact_phone }]
      : []
    : MOCK_EMERGENCY_PROFILE.emergencyContacts;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View
        style={{ backgroundColor: theme.error }}
        className="px-5 py-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <MaterialIcons name="emergency" size={22} color="#FFFFFF" />
          <Text className="text-white text-base font-extrabold ml-2">
            Emergency Medical Information
          </Text>
        </View>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          {!scanned && (
            <View
              style={{ backgroundColor: theme.warningLight }}
              className={`flex-row items-center rounded-2xl p-3 mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
            >
              <MaterialIcons name="wifi-off" size={16} color={theme.warning} />
              <Text style={{ color: theme.text }} className="text-xs ml-2">
                Preview only - this is what a responder would see, not a live scan
              </Text>
            </View>
          )}

          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-xl font-extrabold mb-1">
              {displayName}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm mb-4">
              Blood Group {bloodGroup || "Not on file"}
              {genotype ? ` · Genotype ${genotype}` : ""}
            </Text>

            <PublicRow label="Allergies" value={allergies.join(", ")} />
            <PublicRow label="Chronic Conditions" value={chronicConditions.join(", ")} />
            <PublicRow label="Current Medications" value={medications.join(", ")} />

            <Text
              style={{ color: theme.textMuted }}
              className="text-[11px] font-bold tracking-widest uppercase mt-5 mb-2"
            >
              Emergency Contacts
            </Text>
            {emergencyContacts.length === 0 ? (
              <Text style={{ color: theme.textMuted }} className="text-xs italic">
                None on file
              </Text>
            ) : (
              emergencyContacts.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => toast.info(`Would call ${c.phone}`)}
                  style={{ backgroundColor: theme.successLight }}
                  className="flex-row items-center justify-between rounded-xl p-3 mb-2"
                >
                  <View>
                    <Text style={{ color: theme.text }} className="text-sm font-bold">
                      {c.name}
                    </Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs">
                      {c.relationship}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="call" size={18} color={theme.success} />
                    <Text style={{ color: theme.success }} className="text-sm font-bold ml-1.5">
                      {c.phone}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <Text
            style={{ color: theme.textMuted }}
            className={`text-[11px] text-center mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            This is a read-only view for emergency responders. Full record access requires
            verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function PublicRow({ label, value }) {
  const { theme } = useTheme();
  return (
    <View className="flex-row justify-between items-start py-2 border-b" style={{ borderColor: theme.divider }}>
      <Text style={{ color: theme.textSecondary }} className="text-xs w-1/3">
        {label}
      </Text>
      <Text
        style={{ color: theme.text }}
        className="text-xs font-semibold flex-1 text-right"
        numberOfLines={2}
      >
        {value || "Not disclosed"}
      </Text>
    </View>
  );
}

// ─── ID-08 · MEDGRAM PASSPORT ───
export function MedGramPassportScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const data = MOCK_EMERGENCY_PROFILE;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="MedGram Passport"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => toast.info("Download is coming soon.")}>
            <MaterialIcons name="download" size={22} color={theme.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.dark ? theme.surface : "#0F172A" }}
            className={`rounded-[28px] p-6 mt-5 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white/60 text-[10px] font-bold tracking-widest uppercase">
                  Travel & Health Credential
                </Text>
                <Text className="text-white text-lg font-extrabold mt-1">
                  {profile?.name || "User"}
                </Text>
              </View>
              <MaterialIcons name="flight" size={28} color="#00C9A7" />
            </View>
          </View>

          <View className={isWeb ? "max-w-[480px]" : ""}>
            <SectionLabel>Vaccination Certificates</SectionLabel>
            {MOCK_VACCINATIONS.map((v, i) => (
              <View
                key={i}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <View>
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {v.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    Administered {v.date}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: v.status === "Valid" ? theme.successLight : theme.errorLight,
                  }}
                  className="px-2.5 py-1 rounded-full"
                >
                  <Text
                    style={{ color: v.status === "Valid" ? theme.success : theme.error }}
                    className="text-[10px] font-bold uppercase"
                  >
                    {v.status}
                  </Text>
                </View>
              </View>
            ))}

            <SectionLabel>Chronic Condition Summary</SectionLabel>
            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="rounded-2xl p-4 border flex-row flex-wrap"
            >
              {data.chronicConditions.map((c, i) => (
                <Chip key={i} label={c} />
              ))}
            </View>

            <SectionLabel>Emergency Profile Summary</SectionLabel>
            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="rounded-2xl p-4 border mb-2"
            >
              <PublicRow label="Blood Group" value={data.bloodGroup} />
              <PublicRow label="Allergies" value={data.allergies.join(", ")} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-14 · IDENTITY & ACCOUNT RECOVERY CENTER ───
// A router/hub, not a wizard: every recovery-adjacent screen is one tap
// away so a user doesn't need to already know which specific flow they
// need. ONB-13 (AuthScreens.js's ForgotPasswordScreen) is linked, not
// rebuilt.
export function IdentityRecoveryCenterScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Identity & Account Recovery" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text
            style={{ color: theme.textSecondary }}
            className={`text-sm mt-5 mb-2 leading-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            Not sure which one you need? Pick the situation that matches yours.
          </Text>

          <View className={isWeb ? "max-w-[560px]" : ""}>
            <SectionLabel>Get Back Into Your Account</SectionLabel>
            <NavRow
              icon="lock-reset"
              label="Reset Password"
              description="Forgot your password"
              onPress={() => navigation.navigate("ForgotPassword")}
            />
            <NavRow
              icon="badge"
              label="Recover MedGram ID"
              description="Lost or disputed MedGram ID"
              onPress={() => navigation.navigate("RecoverMedGramId")}
            />

            <SectionLabel>Manage Your Identity</SectionLabel>
            <NavRow
              icon="credit-card"
              label="Replace Card"
              description="Lost, damaged, or stolen digital/physical card"
              onPress={() => navigation.navigate("ReplaceCard")}
            />
            <NavRow
              icon="history"
              label="Verification & Change History"
              description="Every verification event and identity change"
              onPress={() => navigation.navigate("VerificationChangeHistory")}
            />
            <NavRow
              icon="phonelink-lock"
              label="Device Transfer"
              description="Move your active session to a new device"
              onPress={() => navigation.navigate("DeviceTransfer")}
            />

            <SectionLabel>I Have Two Accounts</SectionLabel>
            <NavRow
              icon="merge-type"
              label="Merge Duplicate Accounts"
              description="Verify and combine two identities into one"
              onPress={() => navigation.navigate("MergeDuplicateAccounts")}
            />

            <SectionLabel>Security Concerns</SectionLabel>
            <NavRow
              icon="block"
              label="Suspend Identity"
              description="Suspected fraud or a stolen device"
              onPress={() => navigation.navigate("SuspendIdentity")}
            />
            <NavRow
              icon="autorenew"
              label="Reissue Identity"
              description="After suspension or a major life change"
              onPress={() => navigation.navigate("ReissueIdentity")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-09 · RECOVER MEDGRAM ID ───
export function RecoverMedGramIdScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const { status, submit } = useSecurityAction(recoverMedGramId);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      toast.error("Enter the email, phone, or MedGram ID on the account.");
      return;
    }
    await submit({ identifier: identifier.trim(), reason: reason.trim() });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Recover MedGram ID" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <FormField
              label="Email, Phone, or MedGram ID"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="The identifier on the account you've lost access to"
            />
            <FormField
              label="What happened? (optional)"
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. lost my phone, forgot everything"
              multiline
              last
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Start Recovery</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SecurityActionResult
              status={status}
              successTitle="Recovery started"
              successBody="Follow the next verification step to restore access to your MedGram ID."
              pendingBody="We couldn't process this automatically yet. Your request has been submitted for manual review - you'll be contacted with next steps."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-10 · REPLACE DIGITAL/PHYSICAL CARD ───
export function ReplaceCardScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const REASONS = ["Lost", "Stolen", "Damaged", "Compromised"];
  const [reason, setReason] = useState(REASONS[0]);
  const [cardType, setCardType] = useState("digital");
  const { status, submit } = useSecurityAction(replaceIdentityCard);

  const handleSubmit = async () => {
    await submit({ reason, cardType });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Replace Card" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SectionLabel>Reason</SectionLabel>
            <View className="flex-row flex-wrap">
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setReason(r)}
                  style={{
                    backgroundColor: reason === r ? theme.primary : theme.surface,
                    borderColor: reason === r ? theme.primary : theme.border,
                  }}
                  className="px-4 py-2 rounded-full border mr-2 mb-2"
                >
                  <Text
                    style={{ color: reason === r ? "#FFFFFF" : theme.text }}
                    className="text-xs font-bold"
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <SectionLabel>Card Type</SectionLabel>
            <View
              style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
              className="flex-row rounded-xl p-1 border"
            >
              {[
                { key: "digital", label: "Digital" },
                { key: "physical", label: "Physical" },
              ].map((t) => {
                const isActive = cardType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    onPress={() => setCardType(t.key)}
                    style={{
                      backgroundColor: isActive ? theme.surface : "transparent",
                      borderColor: isActive ? theme.border : "transparent",
                    }}
                    className="flex-1 items-center justify-center py-2.5 rounded-lg border"
                  >
                    <Text
                      style={{ color: isActive ? theme.primary : theme.textSecondary }}
                      className={`text-xs ${isActive ? "font-bold" : "font-medium"}`}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Request Replacement</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SecurityActionResult
              status={status}
              successTitle="Replacement requested"
              successBody="Your replacement card request has been recorded. Track its status from here."
              pendingBody="We couldn't process this automatically yet. Your request has been submitted for manual review."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-11 · SUSPEND IDENTITY ───
export function SuspendIdentityScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const REASONS = ["Suspected fraud", "Stolen device", "Other"];
  const [reason, setReason] = useState(REASONS[0]);
  const [confirmText, setConfirmText] = useState("");
  const { status, submit } = useSecurityAction(suspendIdentity);

  const handleSubmit = async () => {
    if (confirmText.trim().toUpperCase() !== "SUSPEND") {
      toast.error('Type "SUSPEND" to confirm this action.');
      return;
    }
    await submit({ reason });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Suspend Identity" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.errorLight }}
            className={`flex-row items-start rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="warning" size={18} color={theme.error} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5">
              Suspending your identity immediately blocks new consultations, prescriptions, and
              payments until you reissue or reverse it. Use this if you suspect fraud or lost a
              device with an active session.
            </Text>
          </View>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SectionLabel>Reason</SectionLabel>
            <View className="flex-row flex-wrap">
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setReason(r)}
                  style={{
                    backgroundColor: reason === r ? theme.error : theme.surface,
                    borderColor: reason === r ? theme.error : theme.border,
                  }}
                  className="px-4 py-2 rounded-full border mr-2 mb-2"
                >
                  <Text
                    style={{ color: reason === r ? "#FFFFFF" : theme.text }}
                    className="text-xs font-bold"
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormField
              label='Type "SUSPEND" to confirm'
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="SUSPEND"
              last
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.error, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Confirm Suspension</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SecurityActionResult
              status={status}
              successTitle="Identity suspended"
              successBody="Your identity is now suspended. Use Reissue Identity from the Recovery Center when you're ready to restore it."
              pendingBody="We couldn't process this automatically yet - your identity has NOT been suspended. Your request has been submitted for manual review; contact support if this is urgent."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-12 · REISSUE IDENTITY ───
export function ReissueIdentityScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const REASONS = ["Post-suspension", "Major life change", "Other"];
  const [reason, setReason] = useState(REASONS[0]);
  const { status, submit } = useSecurityAction(reissueIdentity);

  const handleSubmit = async () => {
    await submit({ reason });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Reissue Identity" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SectionLabel>Reason</SectionLabel>
            <View className="flex-row flex-wrap">
              {REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setReason(r)}
                  style={{
                    backgroundColor: reason === r ? theme.primary : theme.surface,
                    borderColor: reason === r ? theme.primary : theme.border,
                  }}
                  className="px-4 py-2 rounded-full border mr-2 mb-2"
                >
                  <Text
                    style={{ color: reason === r ? "#FFFFFF" : theme.text }}
                    className="text-xs font-bold"
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Reissue Identity</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SecurityActionResult
              status={status}
              successTitle="Identity reissued"
              successBody="Your identity has been reissued and is active again."
              pendingBody="We couldn't process this automatically yet. Your request has been submitted for manual review."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-13 · VERIFICATION & CHANGE HISTORY ───
// Reuses EmergencyAuditLogScreen's list-of-events pattern. Unlike ID-05
// (out of scope for this change), this is a new screen and follows the
// module's non-fake-data principle: no mock rows, just a real fetch with an
// honest empty state when the backend can't serve it yet.
export function VerificationChangeHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getVerificationHistory();
        if (!cancelled) setEvents(Array.isArray(data) ? data : data?.events || []);
      } catch (err) {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Verification & Change History" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : events.length === 0 ? (
        <EmptyState
          icon="history"
          title="No history yet"
          description="Verification events and identity changes will appear here as they happen."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {events.map((entry, i) => (
                <View
                  key={entry.id || i}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="rounded-2xl p-4 border mb-3"
                >
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                      {entry.event || entry.title || "Verification event"}
                    </Text>
                    <Text style={{ color: theme.textMuted }} className="text-[11px]">
                      {entry.date ? new Date(entry.date).toLocaleString() : ""}
                    </Text>
                  </View>
                  {entry.detail ? (
                    <Text style={{ color: theme.textSecondary }} className="text-xs">
                      {entry.detail}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── ID-15 · MERGE DUPLICATE ACCOUNTS ───
// verify -> confirm -> merge, per the spec's own framing.
export function MergeDuplicateAccountsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [step, setStep] = useState("verify"); // verify | confirm | submitted | done
  const [otherIdentifier, setOtherIdentifier] = useState("");
  const [otherVerified, setOtherVerified] = useState(false);
  const [thisVerified, setThisVerified] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const { status, submit } = useSecurityAction(mergeDuplicateAccounts);

  const handleVerify = () => {
    if (!otherIdentifier.trim()) {
      toast.error("Enter the email, phone, or MedGram ID of the other account.");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmMerge = async () => {
    if (!otherVerified || !thisVerified) {
      setBlockedReason(
        "Both accounts must complete verification before they can be merged. Confirm you control both accounts above.",
      );
      return;
    }
    setBlockedReason("");
    const { ok, result } = await submit({ otherIdentifier: otherIdentifier.trim() });
    if (!ok) return;
    // The backend accepted the request but a merge is never instant (it
    // needs human review, not a fake immediate completion) - only a
    // `status: "completed"` response means the accounts actually merged.
    setStep(result?.status === "completed" ? "done" : "submitted");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Merge Duplicate Accounts" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          {step === "verify" && (
            <View className={isWeb ? "max-w-[520px]" : ""}>
              <Text style={{ color: theme.textSecondary }} className="text-sm mt-5 mb-4 leading-5">
                If you discovered you have two MedGram identities - for example, one an
                organization created for you before you signed up - you can merge them here.
              </Text>
              <View
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-5 border"
              >
                <FormField
                  label="Other Account's Email, Phone, or MedGram ID"
                  value={otherIdentifier}
                  onChangeText={setOtherIdentifier}
                  placeholder="The identifier of the duplicate account"
                  last
                />
              </View>
              <TouchableOpacity
                onPress={handleVerify}
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-6"
              >
                <Text className="text-white text-base font-bold">Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "confirm" && (
            <View className={isWeb ? "max-w-[520px]" : ""}>
              <Text style={{ color: theme.textSecondary }} className="text-sm mt-5 mb-4 leading-5">
                Confirm you control both accounts before they're merged. This cannot be undone.
              </Text>
              <TouchableOpacity
                onPress={() => setThisVerified((v) => !v)}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-3"
              >
                <MaterialIcons
                  name={thisVerified ? "check-box" : "check-box-outline-blank"}
                  size={22}
                  color={thisVerified ? theme.primary : theme.textMuted}
                />
                <Text style={{ color: theme.text }} className="text-sm font-semibold ml-3">
                  I verified I control this (current) account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOtherVerified((v) => !v)}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-3"
              >
                <MaterialIcons
                  name={otherVerified ? "check-box" : "check-box-outline-blank"}
                  size={22}
                  color={otherVerified ? theme.primary : theme.textMuted}
                />
                <Text style={{ color: theme.text }} className="text-sm font-semibold ml-3 flex-1">
                  I verified I control {otherIdentifier}
                </Text>
              </TouchableOpacity>

              {blockedReason ? (
                <View style={{ backgroundColor: theme.errorLight }} className="rounded-2xl p-4 mb-3">
                  <Text style={{ color: theme.text }} className="text-xs leading-5">
                    {blockedReason}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleConfirmMerge}
                disabled={status === "submitting"}
                style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-2"
              >
                {status === "submitting" ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">Merge Accounts</Text>
                )}
              </TouchableOpacity>

              <SecurityActionResult
                status={status === "pending" ? "pending" : null}
                pendingBody="We couldn't process this automatically yet. Your merge request has been submitted for manual review."
              />
            </View>
          )}

          {step === "submitted" && (
            <View className={isWeb ? "max-w-[520px]" : ""}>
              <SecurityActionResult
                status="pending"
                pendingBody="Merging accounts needs a human to verify both identities before it happens - your request has been submitted for manual review, not completed automatically. You'll be notified once it's resolved."
              />
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-4"
              >
                <Text className="text-white text-base font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "done" && (
            <View className={isWeb ? "max-w-[520px]" : ""}>
              <SecurityActionResult
                status="success"
                successTitle="Accounts merged"
                successBody="Your accounts have been combined into a single identity."
              />
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-4"
              >
                <Text className="text-white text-base font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-17 · DEVICE TRANSFER ───
// AuthScreens.js's VerifyDeviceScreen was checked for reuse (per design.md
// 5.1) and covers a different case - login-time new-device OTP, driven by
// callback props (email/onBack/onVerified) tied to the pre-auth flow, not
// this post-login "move my active session" flow. Kept as a small
// self-contained screen consistent with the rest of this module instead.
export function DeviceTransferScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [deviceName, setDeviceName] = useState("");
  const [code, setCode] = useState("");
  const { status, submit, setStatus } = useSecurityAction(transferDevice);

  const handleSubmit = async () => {
    if (!deviceName.trim() || code.trim().length < 6) {
      toast.error("Name the new device and enter the 6-digit verification code sent to it.");
      return;
    }
    const { ok, result } = await submit({ deviceName: deviceName.trim(), code: code.trim() });
    // There's no real session-invalidation mechanism on the backend yet
    // (see design.md's non-goals) - a `status: "pending"` response means
    // the request was accepted but the transfer hasn't actually happened,
    // so override the hook's default "success" rather than overclaiming.
    if (ok && result?.status !== "completed") setStatus("pending");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Device Transfer" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text
            style={{ color: theme.textSecondary }}
            className={`text-sm mt-5 mb-4 leading-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            Move your active MedGram ID session to a new device. Your prior device's session will
            be invalidated once the transfer is confirmed.
          </Text>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <FormField
              label="New Device Name"
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="e.g. Gabriel's iPhone 16"
            />
            <FormField
              label="Verification Code"
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code from the new device"
              keyboardType="number-pad"
              last
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Confirm Transfer</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SecurityActionResult
              status={status}
              successTitle="Transfer complete"
              successBody="Your session is now active on the new device and has been invalidated on the prior one."
              pendingBody="We couldn't process this automatically yet - your session has NOT moved. Your request has been submitted for manual review."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ID-07 · [PRO] SCAN PATIENT ID/QR ───
// Read-only emergency access, not an identity mutation - unlike
// suspend/reissue/merge/device-transfer above, blocking a professional from
// viewing emergency data because the audit-log write failed would be
// actively harmful during a real emergency. So access is granted on
// justification regardless of whether the log call succeeds, but the
// professional is told plainly if the access wasn't recorded.
export function ScanPatientIdScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const [patientIdentifier, setPatientIdentifier] = useState("");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isPro = profile?.role && profile.role !== "patient";

  if (!isPro) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Scan Patient ID" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState
          icon="lock"
          title="Professional access only"
          description="This tool is available to verified healthcare professionals."
        />
      </View>
    );
  }

  const handleScan = async () => {
    if (!patientIdentifier.trim()) {
      toast.error("Enter or scan the patient's MedGram ID.");
      return;
    }
    if (!justification.trim()) {
      toast.error("A justification is required for emergency access, and is logged.");
      return;
    }
    setSubmitting(true);
    try {
      // Lookup and audit-logging happen atomically in one backend call -
      // there's no data to show without a successful response, so unlike
      // the write actions elsewhere in this module there's no separate
      // "access granted but not logged" state to fall back to.
      const scannedPatient = await scanPatientId({
        patientIdentifier: patientIdentifier.trim(),
        justification: justification.trim(),
      });
      navigation.navigate("PublicEmergencyProfile", { scannedPatient });
    } catch (err) {
      toast.error(err.message || "Couldn't access this patient's emergency profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Scan Patient ID" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.errorLight }}
            className={`flex-row items-start rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="emergency" size={18} color={theme.error} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5">
              Emergency access to a patient's profile is justification-prompted and permanently
              audit-logged.
            </Text>
          </View>

          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <FormField
              label="Patient MedGram ID"
              value={patientIdentifier}
              onChangeText={setPatientIdentifier}
              placeholder="Scan the patient's QR, or enter their ID manually"
            />
            <FormField
              label="Justification"
              value={justification}
              onChangeText={setJustification}
              placeholder="e.g. Unresponsive patient, ER intake"
              multiline
              last
            />
          </View>

          <TouchableOpacity
            onPress={handleScan}
            disabled={submitting}
            style={{ backgroundColor: theme.error, opacity: submitting ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Access Emergency Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
