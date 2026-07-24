import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, StatusBadge, Chip, FormField } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the provider-discovery/consultation API lands.
const MOCK_PROFESSIONALS = [
  {
    id: "pr1",
    name: "Dr. Sarah Coker",
    specialty: "Orthopedics",
    rating: 4.9,
    reviews: 128,
    fee: 15000,
    languages: ["English", "Yoruba"],
    nextAvailable: "Today, 2:00 PM",
    consultTypes: ["Video", "Chat", "Physical"],
    orgId: "org1",
    orgName: "MedGram Clinic, Victoria Island",
    experience: "12 years",
    bio: "Board-certified orthopedic surgeon focused on sports medicine and joint care.",
  },
  {
    id: "pr2",
    name: "Dr. Chidi Eze",
    specialty: "General Physician",
    rating: 4.8,
    reviews: 342,
    fee: 8000,
    languages: ["English", "Igbo"],
    nextAvailable: "Tomorrow, 9:00 AM",
    consultTypes: ["Video", "Chat", "Physical", "Audio"],
    orgId: "org1",
    orgName: "MedGram Clinic, Victoria Island",
    experience: "15 years",
    bio: "Family medicine physician focused on preventive care and chronic disease management.",
  },
  {
    id: "pr3",
    name: "Dr. Amara Nwosu",
    specialty: "Dermatology",
    rating: 5.0,
    reviews: 89,
    fee: 12000,
    languages: ["English"],
    nextAvailable: "Today, 4:30 PM",
    consultTypes: ["Video", "Chat"],
    orgId: "org2",
    orgName: "Lekki Skin & Wellness Clinic",
    experience: "8 years",
    bio: "Dermatologist specializing in acne, eczema, and cosmetic dermatology.",
  },
];

const MOCK_ORGANIZATIONS = [
  {
    id: "org1",
    name: "MedGram Clinic, Victoria Island",
    type: "Multi-specialty Clinic",
    rating: 4.8,
    address: "12 Ozumba Mbadiwe Ave, Victoria Island, Lagos",
    hours: "Mon-Sat, 8:00 AM - 6:00 PM",
    services: ["General Practice", "Orthopedics", "Laboratory", "Pharmacy"],
  },
  {
    id: "org2",
    name: "Lekki Skin & Wellness Clinic",
    type: "Dermatology Clinic",
    rating: 4.9,
    address: "45 Admiralty Way, Lekki Phase 1, Lagos",
    hours: "Mon-Fri, 9:00 AM - 5:00 PM",
    services: ["Dermatology", "Aesthetics"],
  },
];

const FILTER_CHIPS = ["Specialty", "Fee", "Rating", "Language", "Availability", "Consult Type"];

const MOCK_CONSULT_HISTORY = [
  { id: "ch1", proName: "Dr. Chidi Eze", specialty: "General Physician", date: "Jul 15, 2026", type: "Video", status: "completed" },
  { id: "ch2", proName: "Dr. Amara Nwosu", specialty: "Dermatology", date: "Jun 22, 2026", type: "Chat", status: "completed" },
  { id: "ch3", proName: "Dr. Mark Bello", specialty: "Cardiology", date: "May 3, 2026", type: "Video", status: "cancelled" },
];

const MOCK_INCOMING_REQUESTS = [
  { id: "req1", patientName: "Tunde Balogun", reason: "Follow-up on blood pressure medication", requestedType: "Video", time: "In 45 min" },
  { id: "req2", patientName: "Ngozi Adeyemi", reason: "New patient - persistent cough", requestedType: "Chat", time: "Today, 4:00 PM" },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_OPTIONS = ["Morning", "Afternoon", "Evening"];

const SUGGESTED_NOTE_PHRASES = [
  "Patient reports improvement in symptoms.",
  "No adverse reactions to current medication.",
  "Advised to continue current treatment plan.",
  "Follow-up recommended in 2 weeks.",
];

const MOCK_PATIENT_CHART = {
  name: "Tunde Balogun",
  age: 34,
  bloodType: "O+",
  allergies: ["Penicillin"],
  medications: ["Lisinopril 10mg"],
  vitals: "BP 132/85 · HR 78bpm · Last recorded Jul 20, 2026",
};

function getProfessional(id) {
  return MOCK_PROFESSIONALS.find((p) => p.id === id) || MOCK_PROFESSIONALS[0];
}
function getOrganization(id) {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id) || MOCK_ORGANIZATIONS[0];
}
function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// ─── CNS-01 · FIND A PROFESSIONAL/ORGANIZATION ───
export function FindDoctorScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [query, setQuery] = useState("");

  const filtered = MOCK_PROFESSIONALS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.specialty.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Find a Professional" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <View className={isWeb ? "px-6 pt-5" : "px-5 pt-5"}>
        <View
          style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
          className={`flex-row items-center rounded-xl px-3 border mb-3 ${isWeb ? "max-w-[640px]" : ""}`}
        >
          <MaterialIcons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={{ color: theme.text }}
            className="flex-1 py-2.5 px-2 text-sm"
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or specialty"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-2">
          {FILTER_CHIPS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => toast.info(`${f} filter is coming soon.`)}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-row items-center px-3.5 py-2 rounded-full border"
            >
              <Text style={{ color: theme.textSecondary }} className="text-xs font-semibold">
                {f}
              </Text>
              <MaterialIcons name="expand-more" size={14} color={theme.textMuted} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className={`flex-row items-center mb-2 ${isWeb ? "max-w-[640px]" : ""}`}>
          <MaterialIcons name="auto-awesome" size={14} color={theme.primary} />
          <Text style={{ color: theme.textMuted }} className="text-[11px] ml-1.5">
            Ranked for you based on your health profile
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-2 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
            {filtered.map((pro) => (
              <TouchableOpacity
                key={pro.id}
                onPress={() => navigation.navigate("ProfessionalProfile", { proId: pro.id })}
                activeOpacity={0.7}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
              >
                <View className="flex-row items-center mb-2">
                  <View style={{ backgroundColor: theme.primaryLight }} className="w-12 h-12 rounded-full items-center justify-center mr-3">
                    <Text style={{ color: theme.primary }} className="font-bold">{initials(pro.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{pro.name}</Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{pro.specialty} · {pro.orgName}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons name="star" size={14} color="#F59E0B" />
                    <Text style={{ color: theme.text }} className="text-xs font-bold ml-1">{pro.rating}</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs ml-1">({pro.reviews})</Text>
                  </View>
                  <Text style={{ color: theme.success }} className="text-xs font-semibold">{pro.nextAvailable}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-02 · PROFESSIONAL PROFILE ───
export function ProfessionalProfileScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const pro = getProfessional(route?.params?.proId);
  const [consultType, setConsultType] = useState(pro.consultTypes[0]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Professional Profile" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`items-center mt-6 mb-4 ${isWeb ? "max-w-[560px]" : ""}`}>
            <View style={{ backgroundColor: theme.primaryLight }} className="w-20 h-20 rounded-full items-center justify-center mb-3">
              <Text style={{ color: theme.primary }} className="text-2xl font-bold">{initials(pro.name)}</Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ color: theme.text }} className="text-lg font-extrabold">{pro.name}</Text>
              <MaterialIcons name="verified" size={16} color={theme.primary} style={{ marginLeft: 4 }} />
            </View>
            <Text style={{ color: theme.textSecondary }} className="text-sm mt-0.5">{pro.specialty} · {pro.experience}</Text>
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="star" size={16} color="#F59E0B" />
              <Text style={{ color: theme.text }} className="text-sm font-bold ml-1">{pro.rating}</Text>
              <Text style={{ color: theme.textMuted }} className="text-sm ml-1">({pro.reviews} reviews)</Text>
            </View>
          </View>

          <View className={isWeb ? "max-w-[560px]" : ""}>
            <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-2">
              <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">{pro.bio}</Text>
            </View>

            <SectionLabel>Languages</SectionLabel>
            <View className="flex-row flex-wrap">
              {pro.languages.map((l) => <Chip key={l} label={l} />)}
            </View>

            <SectionLabel>Consultation Type</SectionLabel>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {pro.consultTypes.map((t) => {
                const active = consultType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setConsultType(t)}
                    style={{ backgroundColor: active ? theme.primary : theme.surfaceSubtle }}
                    className="px-3.5 py-2 rounded-full"
                  >
                    <Text style={{ color: active ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold">{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("OrganizationProfile", { orgId: pro.orgId })}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-row items-center rounded-2xl p-4 border mt-4"
            >
              <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                <MaterialIcons name="domain" size={20} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.text }} className="text-sm font-bold">{pro.orgName}</Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">View organization</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: theme.surface, borderTopColor: theme.border }} className="border-t px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase">Fee</Text>
          <Text style={{ color: theme.text }} className="text-base font-extrabold">₦{pro.fee.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("ConsultBooking")}
          style={{ backgroundColor: theme.primary }}
          className="flex-row items-center justify-center px-8 py-3.5 rounded-xl"
        >
          <Text className="text-white text-sm font-bold">Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CNS-03 · ORGANIZATION PROFILE ───
export function OrganizationProfileScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const org = getOrganization(route?.params?.orgId);
  const orgProfessionals = MOCK_PROFESSIONALS.filter((p) => p.orgId === org.id);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Organization Profile" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row items-center mb-3">
              <View style={{ backgroundColor: theme.primaryLight }} className="w-14 h-14 rounded-xl items-center justify-center mr-3">
                <MaterialIcons name="domain" size={26} color={theme.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.text }} className="text-base font-extrabold">{org.name}</Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{org.type}</Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text style={{ color: theme.text }} className="text-xs font-bold ml-1">{org.rating}</Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center py-1.5">
              <MaterialIcons name="place" size={16} color={theme.textMuted} />
              <Text style={{ color: theme.textSecondary }} className="text-xs ml-2">{org.address}</Text>
            </View>
            <View className="flex-row items-center py-1.5">
              <MaterialIcons name="schedule" size={16} color={theme.textMuted} />
              <Text style={{ color: theme.textSecondary }} className="text-xs ml-2">{org.hours}</Text>
            </View>
          </View>

          <SectionLabel>Services</SectionLabel>
          <View className={`flex-row flex-wrap ${isWeb ? "max-w-[560px]" : ""}`}>
            {org.services.map((s) => <Chip key={s} label={s} />)}
          </View>

          <SectionLabel>Professionals at This Organization</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {orgProfessionals.map((pro) => (
              <TouchableOpacity
                key={pro.id}
                onPress={() => navigation.navigate("ProfessionalProfile", { proId: pro.id })}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text style={{ color: theme.primary }} className="text-xs font-bold">{initials(pro.name)}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{pro.name}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{pro.specialty}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-06 · PRE-CONSULTATION WAITING ROOM ───
export function WaitingRoomScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { proName = "Dr. Chidi Eze", consultType = "Video" } = route?.params || {};
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(consultType !== "Chat");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleJoin = () => {
    if (consultType === "Chat") {
      navigation.replace("ChatConsult", { proName });
    } else {
      navigation.replace("LiveConsult", { proName, consultType });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Waiting Room" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={`flex-1 items-center justify-center ${isWeb ? "px-6" : "px-8"}`}>
          <View style={{ backgroundColor: theme.primaryLight }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
            <Text style={{ color: theme.primary }} className="text-2xl font-bold">{initials(proName)}</Text>
          </View>
          <Text style={{ color: theme.text }} className="text-lg font-extrabold text-center">{proName}</Text>
          <Text style={{ color: theme.textSecondary }} className="text-sm text-center mt-1 mb-8">
            {ready ? "Your provider is ready for you" : "Your provider will join shortly..."}
          </Text>

          {consultType !== "Chat" && (
            <View className={`w-full gap-3 mb-8 ${isWeb ? "max-w-[420px]" : ""}`}>
              <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="flex-row items-center justify-between rounded-2xl p-4 border">
                <View className="flex-row items-center">
                  <MaterialIcons name="mic" size={18} color={theme.textSecondary} />
                  <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2">Microphone</Text>
                </View>
                <Switch value={micOn} onValueChange={setMicOn} trackColor={{ true: theme.primary }} />
              </View>
              <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="flex-row items-center justify-between rounded-2xl p-4 border">
                <View className="flex-row items-center">
                  <MaterialIcons name="videocam" size={18} color={theme.textSecondary} />
                  <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2">Camera</Text>
                </View>
                <Switch value={cameraOn} onValueChange={setCameraOn} trackColor={{ true: theme.primary }} />
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleJoin}
            disabled={!ready}
            style={{ backgroundColor: ready ? theme.primary : theme.surfaceSubtle }}
            className={`flex-row items-center justify-center py-4 rounded-xl w-full ${isWeb ? "max-w-[420px]" : ""}`}
          >
            <Text style={{ color: ready ? "#FFFFFF" : theme.textMuted }} className="text-base font-bold">
              {ready ? "Join Now" : "Waiting for provider..."}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-07 · LIVE VIDEO/AUDIO CONSULTATION UI ───
export function LiveConsultScreen({ navigation, route }) {
  const { proName = "Dr. Chidi Eze", consultType = "Video" } = route?.params || {};
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(consultType === "Video");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <View className="flex-1 items-center justify-between py-16" style={{ backgroundColor: "#0F172A" }}>
      <View className="items-center mt-10">
        <Text className="text-white/60 text-sm mb-1">{consultType} Consultation</Text>
        <Text className="text-white text-xl font-bold">{formatTime(seconds)}</Text>
      </View>

      <View className="items-center">
        <View className="w-28 h-28 rounded-full bg-white/10 items-center justify-center mb-5">
          <Text className="text-white text-3xl font-extrabold">{initials(proName)}</Text>
        </View>
        <Text className="text-white text-2xl font-extrabold">{proName}</Text>
        <Text className="text-white/60 text-sm mt-1">{videoOn ? "Camera on" : "Connected"}</Text>
      </View>

      <View className="flex-row items-center gap-5">
        <TouchableOpacity
          onPress={() => setMuted(!muted)}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: muted ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}
        >
          <MaterialIcons name={muted ? "mic-off" : "mic"} size={24} color={muted ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        {consultType === "Video" && (
          <TouchableOpacity
            onPress={() => setVideoOn(!videoOn)}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: !videoOn ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}
          >
            <MaterialIcons name={videoOn ? "videocam" : "videocam-off"} size={24} color={!videoOn ? "#0F172A" : "#FFFFFF"} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.replace("ConsultSummary", { proName })}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: "#EF4444" }}
        >
          <MaterialIcons name="call-end" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CNS-08 · ASYNC CHAT-BASED CONSULTATION UI ───
const MOCK_CONSULT_MESSAGES = [
  { id: "cm1", fromMe: false, text: "Hi! I've reviewed your intake form - tell me more about when the symptoms started." },
  { id: "cm2", fromMe: true, text: "It started about 3 days ago, mostly in the mornings." },
  { id: "cm3", fromMe: false, text: "Understood. Any fever or nausea alongside it?" },
];

export function ChatConsultScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { proName = "Dr. Chidi Eze" } = route?.params || {};
  const [messages, setMessages] = useState(MOCK_CONSULT_MESSAGES);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, fromMe: true, text: draft.trim() }]);
    setDraft("");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title={proName}
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => navigation.replace("ConsultSummary", { proName })}>
            <Text style={{ color: theme.error }} className="text-sm font-bold">End</Text>
          </TouchableOpacity>
        }
      />
      <View className={isWeb ? "px-6 pt-3" : "px-5 pt-3"}>
        <View style={{ backgroundColor: theme.successLight }} className={`flex-row items-center rounded-xl p-2.5 ${isWeb ? "max-w-[640px]" : ""}`}>
          <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
          <Text style={{ color: theme.text }} className="text-xs">Consultation in progress</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            {messages.map((m) => (
              <View key={m.id} className={`mb-3 ${m.fromMe ? "items-end" : "items-start"}`}>
                <View
                  style={{ backgroundColor: m.fromMe ? theme.primary : theme.surface, borderColor: m.fromMe ? theme.primary : theme.border }}
                  className="max-w-[78%] rounded-2xl px-4 py-3 border"
                >
                  <Text style={{ color: m.fromMe ? "#FFFFFF" : theme.text }} className="text-sm leading-5">{m.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={{ backgroundColor: theme.surface, borderTopColor: theme.border }} className="flex-row items-center px-3 py-2.5 border-t gap-2">
        <TextInput
          style={{ backgroundColor: theme.surfaceSubtle, color: theme.text }}
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity onPress={handleSend} style={{ backgroundColor: theme.primary }} className="w-9 h-9 rounded-full items-center justify-center">
          <MaterialIcons name="arrow-upward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CNS-09 · POST-VISIT CONSULTATION SUMMARY ───
export function ConsultSummaryScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { proName = "Dr. Chidi Eze", consultId } = route?.params || {};

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Consultation Summary" onBack={() => navigation.navigate("Tabs", { screen: "Home" })} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.successLight }}
            className={`flex-row items-center rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <MaterialIcons name="check-circle" size={22} color={theme.success} />
            <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2.5 flex-1">
              Consultation with {proName} completed
            </Text>
          </View>

          <SectionLabel>Diagnosis & Notes</SectionLabel>
          <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className={`rounded-2xl p-4 border ${isWeb ? "max-w-[560px]" : ""}`}>
            <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">
              Likely tension headache, exacerbated by dehydration and poor sleep. No red-flag
              symptoms noted.
            </Text>
          </View>

          <SectionLabel>Prescriptions Issued</SectionLabel>
          <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className={`flex-row items-center rounded-2xl p-4 border ${isWeb ? "max-w-[560px]" : ""}`}>
            <MaterialIcons name="medication" size={18} color={theme.primary} />
            <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2.5 flex-1">Ibuprofen 400mg - as needed</Text>
          </View>

          <SectionLabel>Follow-Up</SectionLabel>
          <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className={`rounded-2xl p-4 border ${isWeb ? "max-w-[560px]" : ""}`}>
            <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">
              Return if symptoms persist beyond 5 days or worsen. No scheduled follow-up needed.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("RateReview", { proName, consultId })}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <MaterialIcons name="star-border" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-bold ml-2">Rate This Consultation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-10 · CONSULTATION HISTORY LIST ───
export function ConsultationHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Consultation History" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
            {MOCK_CONSULT_HISTORY.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => navigation.navigate("ConsultSummary", { proName: c.proName, consultId: c.id })}
                activeOpacity={0.7}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">{c.proName}</Text>
                  <StatusBadge label={c.status} color={c.status === "completed" ? theme.success : theme.error} />
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs">{c.specialty} · {c.type} · {c.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-11 · RATE & REVIEW PROFESSIONAL ───
export function RateReviewScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { proName = "your provider" } = route?.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please choose a rating.");
      return;
    }
    toast.success("Thanks for your review!");
    navigation.navigate("Tabs", { screen: "Home" });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Rate & Review" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-sm mt-5 mb-4 ${isWeb ? "max-w-[480px]" : ""}`}>
            How was your consultation with {proName}?
          </Text>
          <View className={`flex-row justify-center gap-2 mb-6 ${isWeb ? "max-w-[480px]" : ""}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialIcons name={star <= rating ? "star" : "star-border"} size={36} color={star <= rating ? "#F59E0B" : theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
          <View className={isWeb ? "max-w-[480px]" : ""}>
            <FormField label="Additional comments (optional)" value={comment} onChangeText={setComment} placeholder="Tell us about your experience" multiline last />
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Submit Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-12 · INSTANT/EMERGENCY CONSULTATION ───
export function InstantConsultScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMatched(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const matchedPro = MOCK_PROFESSIONALS[1];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Connect Me Now" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={`flex-1 items-center justify-center ${isWeb ? "px-6" : "px-8"}`}>
          {!matched ? (
            <>
              <View style={{ backgroundColor: theme.primaryLight }} className="w-24 h-24 rounded-full items-center justify-center mb-6">
                <MaterialIcons name="podcasts" size={40} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text }} className="text-lg font-extrabold text-center">
                Finding the next available doctor...
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-sm text-center mt-1 max-w-[280px]">
                You'll be connected instantly with a general physician.
              </Text>
            </>
          ) : (
            <>
              <View style={{ backgroundColor: theme.successLight }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="check-circle" size={36} color={theme.success} />
              </View>
              <Text style={{ color: theme.text }} className="text-lg font-extrabold text-center mb-1">
                Matched with {matchedPro.name}
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-sm text-center mb-8">
                {matchedPro.specialty} · Ready now
              </Text>
              <TouchableOpacity
                onPress={() => navigation.replace("WaitingRoom", { proName: matchedPro.name, consultType: "Video" })}
                style={{ backgroundColor: theme.primary }}
                className={`flex-row items-center justify-center py-4 rounded-xl w-full ${isWeb ? "max-w-[420px]" : ""}`}
              >
                <Text className="text-white text-base font-bold">Start Now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-13 · [Pro] INCOMING CONSULTATION REQUESTS QUEUE ───
export function IncomingRequestsQueueScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [requests, setRequests] = useState(MOCK_INCOMING_REQUESTS);

  const respond = (id, accepted) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(accepted ? "Request accepted." : "Request declined.");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Incoming Requests" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          {requests.length === 0 ? (
            <Text style={{ color: theme.textMuted }} className="text-sm text-center mt-10">
              No pending requests.
            </Text>
          ) : (
            <View className={`mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
              {requests.map((r) => (
                <View key={r.id} style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-3">
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">{r.patientName}</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">{r.time}</Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mb-1">{r.requestedType} Consultation</Text>
                  <Text style={{ color: theme.textMuted }} className="text-xs mb-3">{r.reason}</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => respond(r.id, true)}
                      style={{ backgroundColor: theme.primary }}
                      className="flex-1 items-center py-2.5 rounded-xl"
                    >
                      <Text className="text-white text-xs font-bold">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => respond(r.id, false)}
                      style={{ backgroundColor: theme.surfaceSubtle }}
                      className="flex-1 items-center py-2.5 rounded-xl"
                    >
                      <Text style={{ color: theme.textSecondary }} className="text-xs font-bold">Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-14 · [Pro] AVAILABILITY MANAGER ───
export function AvailabilityManagerScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [schedule, setSchedule] = useState(
    WEEKDAYS.reduce((acc, day) => ({ ...acc, [day]: { active: day !== "Sunday", slots: ["Morning", "Afternoon"] } }), {}),
  );

  const toggleDay = (day) =>
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], active: !prev[day].active } }));

  const toggleSlot = (day, slot) =>
    setSchedule((prev) => {
      const current = prev[day].slots;
      const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
      return { ...prev, [day]: { ...prev[day], slots: next } };
    });

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Availability" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-2.5">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{day}</Text>
                  <Switch value={schedule[day].active} onValueChange={() => toggleDay(day)} trackColor={{ true: theme.primary }} />
                </View>
                {schedule[day].active && (
                  <View className="flex-row gap-2">
                    {SLOT_OPTIONS.map((slot) => {
                      const active = schedule[day].slots.includes(slot);
                      return (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => toggleSlot(day, slot)}
                          style={{ backgroundColor: active ? theme.primary : theme.surfaceSubtle }}
                          className="px-3 py-1.5 rounded-full"
                        >
                          <Text style={{ color: active ? "#FFFFFF" : theme.textSecondary }} className="text-[11px] font-bold">{slot}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.success("Availability saved.")}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl mt-4"
            >
              <Text className="text-white text-base font-bold">Save Availability</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-15 · [Pro] IN-CONSULTATION CLINICAL DOCUMENTATION PANEL ───
export function ClinicalDocumentationScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { patientName = "Tunde Balogun" } = route?.params || {};
  const [note, setNote] = useState("");

  const appendPhrase = (phrase) => setNote((prev) => (prev ? `${prev} ${phrase}` : phrase));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Clinical Note" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-xs mt-5 mb-3 ${isWeb ? "max-w-[560px]" : ""}`}>
            Patient: {patientName}
          </Text>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            <TextInput
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              className="rounded-xl px-4 py-3 border text-[15px] h-40"
              value={note}
              onChangeText={setNote}
              placeholder="Start typing your clinical note..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
            />

            <SectionLabel>AI-Suggested Phrases</SectionLabel>
            <View className="flex-row flex-wrap">
              {SUGGESTED_NOTE_PHRASES.map((phrase) => (
                <TouchableOpacity
                  key={phrase}
                  onPress={() => appendPhrase(phrase)}
                  style={{ backgroundColor: theme.primaryLight }}
                  className="px-3 py-2 rounded-xl mr-2 mb-2"
                >
                  <Text style={{ color: theme.primary }} className="text-xs font-semibold">{phrase}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => toast.success("Clinical note saved.")}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl mt-4"
            >
              <Text className="text-white text-base font-bold">Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CNS-16 · [Pro] QUICK PATIENT CHART VIEW DURING LIVE CONSULT ───
export function PatientChartQuickViewScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const chart = MOCK_PATIENT_CHART;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Patient Chart" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-lg font-extrabold mb-1">{chart.name}</Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm mb-4">
              {chart.age} yrs · Blood Group {chart.bloodType}
            </Text>

            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase mb-2">Allergies</Text>
            <View className="flex-row flex-wrap mb-3">
              {chart.allergies.map((a) => <Chip key={a} label={a} />)}
            </View>

            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase mb-2">Current Medications</Text>
            <View className="flex-row flex-wrap mb-3">
              {chart.medications.map((m) => <Chip key={m} label={m} />)}
            </View>

            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase mb-2">Recent Vitals</Text>
            <Text style={{ color: theme.text }} className="text-sm font-semibold">{chart.vitals}</Text>
          </View>

          <TouchableOpacity
            onPress={() => toast.info("Full patient chart is coming soon.")}
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`flex-row items-center justify-center py-3.5 rounded-xl border mt-4 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-sm font-bold">View Full Chart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
