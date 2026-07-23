import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, Chip, FormField, NavRow } from "../components/ScreenKit";

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
export function PublicEmergencyProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const data = MOCK_EMERGENCY_PROFILE;

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
          <View
            style={{ backgroundColor: theme.warningLight }}
            className={`flex-row items-center rounded-2xl p-3 mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="wifi-off" size={16} color={theme.warning} />
            <Text style={{ color: theme.text }} className="text-xs ml-2">
              Showing cached data - last synced Jul 20, 2026
            </Text>
          </View>

          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-xl font-extrabold mb-1">
              {profile?.name || "MedGram User"}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm mb-4">
              Blood Group {data.bloodGroup} · Genotype {data.genotype}
            </Text>

            <PublicRow label="Allergies" value={data.allergies.join(", ")} />
            <PublicRow label="Chronic Conditions" value={data.chronicConditions.join(", ")} />
            <PublicRow label="Current Medications" value={data.medications.join(", ")} />

            <Text
              style={{ color: theme.textMuted }}
              className="text-[11px] font-bold tracking-widest uppercase mt-5 mb-2"
            >
              Emergency Contacts
            </Text>
            {data.emergencyContacts.map((c, i) => (
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
            ))}
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
