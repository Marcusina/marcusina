import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import {
  useIsWeb,
  ScreenHeader,
  SectionLabel,
  StatusBadge,
  EmptyState,
  FormField,
  NavRow,
  Chip,
} from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the personal-health-record API lands.
const TABS = [
  "Overview",
  "Diagnoses",
  "Allergies",
  "Medications",
  "Immunizations",
  "Labs",
  "Imaging",
  "Surgical History",
  "Vitals",
  "Family History",
];

const TAB_ICONS = {
  Diagnoses: "monitor-heart",
  Allergies: "warning",
  Medications: "medication",
  Immunizations: "vaccines",
  Labs: "science",
  Imaging: "biotech",
  "Surgical History": "content-cut",
  Vitals: "favorite",
  "Family History": "family-restroom",
};

const MOCK_RECORDS = {
  Diagnoses: [
    {
      id: "d1",
      title: "Type 2 Diabetes Mellitus",
      org: "MedGram Clinic, Victoria Island",
      provider: "Dr. Chidi Eze",
      date: "Jan 12, 2025",
      source: "clinical",
      notes: "Diagnosed following elevated fasting glucose across two visits. Started on Metformin.",
    },
    {
      id: "d2",
      title: "Hypertension (Stage 1)",
      org: "MedGram Clinic, Victoria Island",
      provider: "Dr. Chidi Eze",
      date: "Mar 3, 2025",
      source: "clinical",
      notes: "Blood pressure consistently above 135/85. Lifestyle modification recommended.",
    },
  ],
  Allergies: [
    {
      id: "a1",
      title: "Penicillin",
      org: "Self-reported",
      provider: "—",
      date: "Reported Feb 2024",
      source: "self",
      notes: "Hives and swelling after a course of amoxicillin as a child.",
    },
    {
      id: "a2",
      title: "Peanuts",
      org: "Self-reported",
      provider: "—",
      date: "Reported Feb 2024",
      source: "self",
      notes: "Mild oral itching. No epinephrine required historically.",
    },
  ],
  Medications: [
    {
      id: "m1",
      title: "Metformin 500mg",
      org: "MedGram Clinic, Victoria Island",
      provider: "Dr. Chidi Eze",
      date: "Since Jan 2025",
      source: "clinical",
      notes: "Twice daily with meals for Type 2 Diabetes management.",
    },
  ],
  Immunizations: [
    {
      id: "i1",
      title: "Yellow Fever Vaccine",
      org: "Lagos State Health Dept.",
      provider: "Nurse Adaeze Obi",
      date: "Mar 2024",
      source: "clinical",
      notes: "Single dose, lifetime validity per WHO guidance.",
    },
    {
      id: "i2",
      title: "COVID-19 Booster",
      org: "MedGram Clinic, Victoria Island",
      provider: "Nurse Femi Alade",
      date: "Nov 2025",
      source: "clinical",
      notes: "Bivalent booster dose.",
    },
  ],
  Labs: [
    {
      id: "l1",
      title: "HbA1c Panel",
      org: "MedGram Diagnostics Lab",
      provider: "Dr. Chidi Eze",
      date: "Jun 20, 2026",
      source: "clinical",
      notes: "Result: 6.8% — improved from 7.9% at last check.",
    },
  ],
  Imaging: [
    {
      id: "img1",
      title: "Chest X-Ray",
      org: "MedGram Diagnostics Lab",
      provider: "Dr. Elena Cruz",
      date: "Feb 14, 2026",
      source: "clinical",
      notes: "No acute cardiopulmonary abnormality.",
    },
  ],
  "Surgical History": [],
  Vitals: [
    {
      id: "v1",
      title: "Routine Vitals Check",
      org: "MedGram Clinic, Victoria Island",
      provider: "Nurse Femi Alade",
      date: "Jun 20, 2026",
      source: "clinical",
      notes: "BP 128/82 · HR 76bpm · Temp 36.7°C · SpO2 98%",
    },
  ],
  "Family History": [
    {
      id: "f1",
      title: "Type 2 Diabetes (Mother)",
      org: "Self-reported",
      provider: "—",
      date: "Reported Feb 2024",
      source: "self",
      notes: "Diagnosed in her late 40s, managed with medication.",
    },
  ],
};

function allRecords() {
  return Object.entries(MOCK_RECORDS).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category })),
  );
}

function findRecord(id) {
  return allRecords().find((r) => r.id === id) || allRecords()[0];
}

// ─── PHR-01 · HEALTH RECORD HOME ───
export function HealthRecordHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [activeTab, setActiveTab] = useState("Overview");
  const entries = MOCK_RECORDS[activeTab] || [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Health Record"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => navigation.navigate("ShareHealthRecord")}>
            <MaterialIcons name="ios-share" size={22} color={theme.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomColor: theme.border }}
        className="border-b flex-none"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: isActive ? theme.primary : theme.surfaceSubtle,
              }}
              className="px-4 py-2 rounded-full"
            >
              <Text
                style={{ color: isActive ? "#FFFFFF" : theme.textSecondary }}
                className="text-xs font-bold"
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          {activeTab === "Overview" ? (
            <View className={`mt-5 gap-3 ${isWeb ? "flex-row flex-wrap" : ""}`}>
              {TABS.filter((t) => t !== "Overview").map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className={`flex-row items-center rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                >
                  <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                    <MaterialIcons name={TAB_ICONS[tab] || "folder"} size={22} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-[14px] font-bold">
                      {tab}
                    </Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                      {(MOCK_RECORDS[tab] || []).length} entr{(MOCK_RECORDS[tab] || []).length === 1 ? "y" : "ies"}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={TAB_ICONS[activeTab] || "folder-open"}
              title={`No ${activeTab.toLowerCase()} on file`}
              description="Entries added by your providers, or self-reported by you, will show up here."
            />
          ) : (
            <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
              {entries.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => navigation.navigate("RecordEntryDetail", { entryId: entry.id })}
                  activeOpacity={0.7}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                >
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text style={{ color: theme.text }} className="text-[15px] font-bold flex-1 pr-2">
                      {entry.title}
                    </Text>
                    <StatusBadge
                      label={entry.source === "self" ? "Self-reported" : "Clinical"}
                      color={entry.source === "self" ? theme.warning : theme.success}
                    />
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mb-1">
                    {entry.org} · {entry.date}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs" numberOfLines={2}>
                    {entry.notes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab !== "Overview" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AddSelfReportedInfo", { category: activeTab })}
              style={{ borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mt-2"
            >
              <MaterialIcons name="add" size={18} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">
                Add Self-Reported Info
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PHR-02 · RECORD ENTRY DETAIL ───
export function RecordEntryDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const entry = findRecord(route?.params?.entryId);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={entry.category} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row justify-between items-start mb-3">
              <Text style={{ color: theme.text }} className="text-lg font-extrabold flex-1 pr-2">
                {entry.title}
              </Text>
              <StatusBadge
                label={entry.source === "self" ? "Self-reported" : "Clinical"}
                color={entry.source === "self" ? theme.warning : theme.success}
              />
            </View>

            <DetailRow label="Source" value={entry.org} />
            <DetailRow label="Provider" value={entry.provider} />
            <DetailRow label="Date" value={entry.date} />

            <View style={{ backgroundColor: theme.border }} className="h-[1px] my-3" />

            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold tracking-wider uppercase mb-2">
              Notes
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">
              {entry.notes}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("DocumentViewer", { entryId: entry.id })}
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`flex-row items-center justify-center py-3.5 rounded-xl border mt-4 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <MaterialIcons name="description" size={18} color={theme.text} />
            <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
              View Source Document
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }) {
  const { theme } = useTheme();
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text style={{ color: theme.textSecondary }} className="text-sm">
        {label}
      </Text>
      <Text style={{ color: theme.text }} className="text-sm font-semibold">
        {value}
      </Text>
    </View>
  );
}

// ─── PHR-03 · ADD SELF-REPORTED INFO ───
export function AddSelfReportedInfoScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const categories = ["Allergies", "Lifestyle", "Family History"];
  const [category, setCategory] = useState(route?.params?.category || categories[0]);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error("Please describe what you'd like to add.");
      return;
    }
    toast.success("Added to your health record as patient-reported.");
    navigation.goBack();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Add Self-Reported Info" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.warningLight }}
            className={`flex-row items-start rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="info" size={18} color={theme.warning} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5">
              Self-reported entries are clearly marked and kept separate from clinician-verified
              records.
            </Text>
          </View>

          <View className={`mt-4 ${isWeb ? "max-w-[520px]" : ""}`}>
            <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-2">
              Category
            </Text>
            <View className="flex-row gap-2 mb-4">
              {categories.map((c) => {
                const isActive = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={{
                      backgroundColor: isActive ? theme.primary : theme.surfaceSubtle,
                    }}
                    className="px-3.5 py-2 rounded-full"
                  >
                    <Text
                      style={{ color: isActive ? "#FFFFFF" : theme.textSecondary }}
                      className="text-xs font-bold"
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Allergic reaction to shellfish - mild swelling"
              multiline
              last
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Save to Health Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PHR-04 · CONSENT & ACCESS LOG FOR THE RECORD ───
const MOCK_RECORD_ACCESS_LOG = [
  {
    id: "1",
    accessor: "Dr. Amara Nwosu",
    org: "MedGram Clinic",
    action: "Viewed diagnosis history",
    date: "Jul 15, 2026 · 3:20 PM",
  },
  {
    id: "2",
    accessor: "MedGram Diagnostics Lab",
    org: "Lab partner",
    action: "Uploaded new lab result",
    date: "Jun 20, 2026 · 9:05 AM",
  },
];

export function RecordConsentLogScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Record Access Log" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-sm mt-5 mb-4 leading-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            Everyone who has viewed or updated your health record, and every active consent
            behind it, is tracked here.
          </Text>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_RECORD_ACCESS_LOG.map((entry) => (
              <View
                key={entry.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                    {entry.accessor}
                  </Text>
                  <Text style={{ color: theme.textMuted }} className="text-[11px]">
                    {entry.date}
                  </Text>
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs">
                  {entry.org} · {entry.action}
                </Text>
              </View>
            ))}
          </View>

          <NavRow
            icon="lock"
            label="Manage Consents"
            description="Review or revoke who can access your records"
            onPress={() => navigation.navigate("Consent")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PHR-05 · SHARE HEALTH RECORD ───
export function ShareHealthRecordScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [selected, setSelected] = useState({
    Diagnoses: true,
    Medications: true,
    Labs: false,
    Imaging: false,
    Immunizations: false,
  });
  const [duration, setDuration] = useState("7 days");
  const [link, setLink] = useState(null);

  const toggle = (key) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGenerate = () => {
    const anySelected = Object.values(selected).some(Boolean);
    if (!anySelected) {
      toast.error("Select at least one record type to share.");
      return;
    }
    setLink(`https://medgram.app/share/${Math.random().toString(36).slice(2, 10)}`);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Share Health Record" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <SectionLabel>What to Share</SectionLabel>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            {Object.keys(selected).map((key) => (
              <View
                key={key}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <Text style={{ color: theme.text }} className="text-sm font-semibold">
                  {key}
                </Text>
                <Switch
                  value={selected[key]}
                  onValueChange={() => toggle(key)}
                  trackColor={{ true: theme.primary }}
                />
              </View>
            ))}

            <SectionLabel>Link Duration</SectionLabel>
            <View className="flex-row gap-2 mb-2">
              {["24 hours", "7 days", "30 days"].map((d) => {
                const isActive = duration === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDuration(d)}
                    style={{ backgroundColor: isActive ? theme.primary : theme.surfaceSubtle }}
                    className="px-3.5 py-2 rounded-full"
                  >
                    <Text style={{ color: isActive ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold">
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleGenerate}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl mt-4"
            >
              <MaterialIcons name="link" size={18} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">Generate Share Link</Text>
            </TouchableOpacity>

            {link && (
              <View
                style={{ backgroundColor: theme.primaryLight }}
                className="flex-row items-center justify-between rounded-xl p-3.5 mt-4"
              >
                <Text style={{ color: theme.text }} className="text-xs flex-1 pr-2" numberOfLines={1}>
                  {link}
                </Text>
                <TouchableOpacity onPress={() => toast.success("Link copied.")}>
                  <MaterialIcons name="content-copy" size={18} color={theme.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PHR-06 · DOCUMENT / REPORT VIEWER ───
export function DocumentViewerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const entry = findRecord(route?.params?.entryId);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Document Viewer"
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
            style={{ backgroundColor: theme.successLight }}
            className={`flex-row items-center rounded-xl p-3 mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="offline-pin" size={16} color={theme.success} />
            <Text style={{ color: theme.text }} className="text-xs ml-2">
              Cached for offline access via Download Center
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border,
              minHeight: 420,
            }}
            className={`rounded-2xl border items-center justify-center mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="description" size={64} color={theme.textMuted} />
            <Text style={{ color: theme.text }} className="text-sm font-bold mt-4">
              {entry.title}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-xs mt-1">
              {entry.org} · {entry.date}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PHR-07 · VACCINATION RECORD & CERTIFICATE ───
const MOCK_VACCINATIONS = [
  { id: "v1", name: "Yellow Fever", date: "Mar 2024", provider: "Lagos State Health Dept.", status: "Valid" },
  { id: "v2", name: "COVID-19 (Booster)", date: "Nov 2025", provider: "MedGram Clinic", status: "Valid" },
  { id: "v3", name: "Meningitis (ACWY)", date: "Jan 2022", provider: "MedGram Clinic", status: "Expired" },
];

export function VaccinationRecordScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Vaccination Record" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            {MOCK_VACCINATIONS.map((v) => (
              <View
                key={v.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text style={{ color: theme.text }} className="text-[15px] font-bold">
                    {v.name}
                  </Text>
                  <StatusBadge label={v.status} color={v.status === "Valid" ? theme.success : theme.error} />
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs mb-3">
                  {v.provider} · Administered {v.date}
                </Text>
                <TouchableOpacity
                  onPress={() => toast.info("Certificate preview is coming soon.")}
                  style={{ backgroundColor: theme.primaryLight }}
                  className="flex-row items-center justify-center py-2.5 rounded-xl self-start px-4"
                >
                  <MaterialIcons name="verified" size={16} color={theme.primary} />
                  <Text style={{ color: theme.primary }} className="text-xs font-bold ml-1.5">
                    View Certificate
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <NavRow
              icon="flight"
              label="Add to MedGram Passport"
              description="Include these certificates in your travel credential"
              onPress={() => navigation.navigate("MedGramPassport")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
