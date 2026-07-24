import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState, FormField } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the care-circle API lands.
const ROLES = ["Full Access", "View Only", "Emergency Only"];

const MOCK_CARE_CIRCLE = [
  { id: "m1", name: "Amaka Obi", relationship: "Spouse", role: "Full Access" },
  { id: "m2", name: "Chidi Obi Jr.", relationship: "Son", role: "View Only" },
  { id: "m3", name: "Ngozi Eze", relationship: "Sister", role: "Emergency Only" },
];

const MOCK_DEPENDENTS = [
  {
    id: "dep1",
    name: "Amaka Obi",
    relationship: "Spouse",
    age: 32,
    upcomingAppointment: "Jul 29, 2026 · Dermatology",
    medicationDue: "Prenatal vitamins - today",
    alerts: 0,
  },
  {
    id: "dep2",
    name: "Chidi Jr.",
    relationship: "Son",
    age: 6,
    upcomingAppointment: "Aug 3, 2026 · Pediatric Vaccination",
    medicationDue: "None due",
    alerts: 1,
  },
];

const MOCK_DELEGATION_REQUESTS = [
  {
    id: "del1",
    requesterName: "Amaka Obi",
    relationship: "Spouse",
    scope: "Manage appointments and prescriptions on your behalf",
    date: "Requested Jul 21, 2026",
  },
];

const MOCK_CARE_AUDIT_LOG = [
  { id: "1", actor: "Amaka Obi", action: "Booked an appointment for Chidi Jr.", date: "Jul 20, 2026 · 4:10 PM" },
  { id: "2", actor: "Ngozi Eze", action: "Viewed Emergency Profile", date: "Jul 12, 2026 · 8:32 AM" },
  { id: "3", actor: "You", action: "Updated Amaka Obi's permission to Full Access", date: "Jun 30, 2026 · 6:05 PM" },
];

const PERMISSION_CATEGORIES = ["Health Record", "Appointments", "Prescriptions", "Wallet", "Emergency Profile"];

function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function getMember(id) {
  return MOCK_CARE_CIRCLE.find((m) => m.id === id) || MOCK_CARE_CIRCLE[0];
}

// ─── CARE-01 · MY CARE CIRCLE ───
export function CareCircleListScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Care Circle"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => navigation.navigate("InviteMember")}>
            <MaterialIcons name="person-add-alt" size={22} color={theme.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            {MOCK_CARE_CIRCLE.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => navigation.navigate("PermissionEditor", { memberId: m.id })}
                activeOpacity={0.7}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-full items-center justify-center mr-3">
                  <Text style={{ color: theme.primary }} className="text-sm font-bold">{initials(m.name)}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{m.name}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{m.relationship}</Text>
                </View>
                <View style={{ backgroundColor: theme.primaryLight }} className="px-2.5 py-1 rounded-full mr-2">
                  <Text style={{ color: theme.primary }} className="text-[10px] font-bold">{m.role}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => navigation.navigate("InviteMember")}
              style={{ borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mt-1 mb-3"
            >
              <MaterialIcons name="person-add-alt" size={18} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">Invite Member</Text>
            </TouchableOpacity>

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => navigation.navigate("DependentsSwitcher")}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-1 items-center py-3.5 rounded-xl border"
              >
                <MaterialIcons name="family-restroom" size={18} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-xs font-bold mt-1">Dependents</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("CareCircleAuditLog")}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-1 items-center py-3.5 rounded-xl border"
              >
                <MaterialIcons name="history" size={18} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-xs font-bold mt-1">Activity Log</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("FamilyDashboard")}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-1 items-center py-3.5 rounded-xl border"
              >
                <MaterialIcons name="dashboard" size={18} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-xs font-bold mt-1">Dashboard</Text>
              </TouchableOpacity>
            </View>

            {MOCK_DELEGATION_REQUESTS.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("DelegationRequest", { requestId: MOCK_DELEGATION_REQUESTS[0].id })}
                style={{ backgroundColor: theme.warningLight }}
                className="flex-row items-center rounded-2xl p-4 mt-3"
              >
                <MaterialIcons name="pending-actions" size={20} color={theme.warning} />
                <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1">
                  {MOCK_DELEGATION_REQUESTS.length} pending delegation request needs your review
                </Text>
                <MaterialIcons name="chevron-right" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CARE-02 · INVITE MEMBER FLOW ───
export function InviteMemberScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [relationship, setRelationship] = useState("");
  const [role, setRole] = useState(ROLES[1]);

  const handleInvite = () => {
    if (!name.trim() || !contact.trim()) {
      toast.error("Enter a name and email or phone number.");
      return;
    }
    toast.success(`Invitation sent to ${name}.`);
    navigation.goBack();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Invite to Care Circle" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[480px]" : ""}`}>
            <FormField label="Full Name" value={name} onChangeText={setName} placeholder="e.g. Amaka Obi" />
            <FormField label="Email or Phone" value={contact} onChangeText={setContact} placeholder="How they'll receive the invite" />
            <FormField label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="e.g. Spouse, Parent, Sibling" />

            <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-2">Access Level</Text>
            {ROLES.map((r) => {
              const active = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={{
                    backgroundColor: active ? theme.primaryLight : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                  className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
                >
                  <Text style={{ color: active ? theme.primary : theme.text }} className="text-sm font-semibold">{r}</Text>
                  {active && <MaterialIcons name="check-circle" size={18} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleInvite}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Send Invitation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CARE-03 · GRANULAR PERMISSION EDITOR ───
export function PermissionEditorScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const member = getMember(route?.params?.memberId);
  const [permissions, setPermissions] = useState(
    PERMISSION_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: member.role === "Full Access" }), {}),
  );

  const toggle = (cat) => setPermissions((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={member.name} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-sm mt-5 mb-4 ${isWeb ? "max-w-[520px]" : ""}`}>
            Choose exactly what {member.name} ({member.relationship}) can access.
          </Text>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            {PERMISSION_CATEGORIES.map((cat) => (
              <View
                key={cat}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <Text style={{ color: theme.text }} className="text-sm font-semibold">{cat}</Text>
                <Switch value={permissions[cat]} onValueChange={() => toggle(cat)} trackColor={{ true: theme.primary }} />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.success("Permissions updated.")}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl mt-2 mb-3"
            >
              <Text className="text-white text-base font-bold">Save Permissions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toast.error(`${member.name} removed from your Care Circle.`)}
              style={{ backgroundColor: theme.errorLight }}
              className="flex-row items-center justify-center py-3.5 rounded-xl"
            >
              <MaterialIcons name="person-remove" size={18} color={theme.error} />
              <Text style={{ color: theme.error }} className="text-sm font-bold ml-2">Remove from Care Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CARE-04 · MANAGED PROFILES / DEPENDENTS SWITCHER ───
export function DependentsSwitcherScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [activeId, setActiveId] = useState(null);

  const switchTo = (dep) => {
    setActiveId(dep.id);
    toast.success(`Switched to ${dep.name}'s profile.`);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Managed Profiles" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            <TouchableOpacity
              onPress={() => switchTo({ id: null, name: "your own" })}
              style={{
                backgroundColor: activeId === null ? theme.primaryLight : theme.surface,
                borderColor: activeId === null ? theme.primary : theme.border,
              }}
              className="flex-row items-center rounded-2xl p-4 border mb-2.5"
            >
              <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="person" size={20} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text }} className="text-sm font-bold flex-1">My Own Profile</Text>
              {activeId === null && <MaterialIcons name="check-circle" size={20} color={theme.primary} />}
            </TouchableOpacity>

            {MOCK_DEPENDENTS.map((dep) => (
              <TouchableOpacity
                key={dep.id}
                onPress={() => switchTo(dep)}
                style={{
                  backgroundColor: activeId === dep.id ? theme.primaryLight : theme.surface,
                  borderColor: activeId === dep.id ? theme.primary : theme.border,
                }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text style={{ color: theme.primary }} className="text-xs font-bold">{initials(dep.name)}</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{dep.name}</Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{dep.relationship} · {dep.age} yrs</Text>
                </View>
                {activeId === dep.id && <MaterialIcons name="check-circle" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("Adding a dependent is coming soon.")}
              style={{ borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mt-1"
            >
              <MaterialIcons name="add" size={18} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">Add Dependent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CARE-05 · DELEGATION REQUEST/APPROVAL SCREEN ───
export function DelegationRequestScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const request = MOCK_DELEGATION_REQUESTS.find((r) => r.id === route?.params?.requestId) || MOCK_DELEGATION_REQUESTS[0];

  const respond = (approved) => {
    toast.success(approved ? "Delegation approved." : "Delegation declined.");
    navigation.goBack();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Delegation Request" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <View className="flex-row items-center mb-3">
              <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-full items-center justify-center mr-3">
                <Text style={{ color: theme.primary }} className="text-sm font-bold">{initials(request.requesterName)}</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.text }} className="text-sm font-bold">{request.requesterName}</Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{request.relationship}</Text>
              </View>
            </View>
            <Text style={{ color: theme.text }} className="text-sm leading-5 mb-2">{request.scope}</Text>
            <Text style={{ color: theme.textMuted }} className="text-xs">{request.date}</Text>
          </View>

          <View className={`mt-6 gap-3 ${isWeb ? "flex-row max-w-[520px]" : ""}`}>
            <TouchableOpacity
              onPress={() => respond(true)}
              style={{ backgroundColor: theme.primary }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            >
              <Text className="text-white text-base font-bold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => respond(false)}
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

// ─── CARE-06 · CARE CIRCLE ACTIVITY & AUDIT LOG ───
export function CareCircleAuditLogScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Care Circle Activity" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            {MOCK_CARE_AUDIT_LOG.map((entry) => (
              <View key={entry.id} style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-2.5">
                <View className="flex-row justify-between items-start mb-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">{entry.actor}</Text>
                  <Text style={{ color: theme.textMuted }} className="text-[11px]">{entry.date}</Text>
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs">{entry.action}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── CARE-07 · FAMILY DASHBOARD ───
export function FamilyDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Family Dashboard" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
            {MOCK_DEPENDENTS.map((dep) => (
              <View
                key={dep.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
              >
                <View className="flex-row items-center mb-3">
                  <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Text style={{ color: theme.primary }} className="text-xs font-bold">{initials(dep.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{dep.name}</Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{dep.relationship} · {dep.age} yrs</Text>
                  </View>
                  {dep.alerts > 0 && (
                    <View style={{ backgroundColor: theme.errorLight }} className="w-6 h-6 rounded-full items-center justify-center">
                      <Text style={{ color: theme.error }} className="text-[10px] font-extrabold">{dep.alerts}</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center py-1.5">
                  <MaterialIcons name="event" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary }} className="text-xs ml-2 flex-1">{dep.upcomingAppointment}</Text>
                </View>
                <View className="flex-row items-center py-1.5">
                  <MaterialIcons name="medication" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textSecondary }} className="text-xs ml-2 flex-1">{dep.medicationDue}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
