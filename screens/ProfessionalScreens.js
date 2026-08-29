import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { useIsWeb, ScreenHeader, SectionLabel, Chip, EmptyState } from "../components/ScreenKit";
import { getMyPatients, getPatientChart, getMyClinicalNotes, getMyAnalytics } from "../api/professional.api";

// Shared error panel for this module's read screens, distinct from the
// "no data yet" empty state - these are reads of sensitive PHI, so a fetch
// failure is shown honestly as a load error rather than silently falling
// back to an empty list that looks the same as "genuinely no data".
function LoadErrorPanel({ title, description }) {
  return <EmptyState icon="cloud-off" title={title} description={description} />;
}

function useProGate() {
  const { profile } = useUser();
  return !!(profile?.role && profile.role !== "patient");
}

function ProAccessDenied({ navigation, title }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <EmptyState
        icon="lock"
        title="Professional access only"
        description="This tool is available to verified healthcare professionals."
      />
    </View>
  );
}

// ─── PRO-01 · MY PATIENTS ───
export function MyPatientsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const isPro = useProGate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyPatients();
        if (!cancelled) setPatients(Array.isArray(data) ? data : data?.patients || []);
      } catch (err) {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPro]);

  if (!isPro) return <ProAccessDenied navigation={navigation} title="My Patients" />;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="My Patients" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : failed || patients.length === 0 ? (
        <LoadErrorPanel
          title={failed ? "Couldn't load your patients" : "No authorized patients yet"}
          description={
            failed
              ? "Something went wrong loading your patient roster. Pull to refresh or try again shortly."
              : "Patients you've had a consultation with will appear here."
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {patients.map((p, i) => (
                <TouchableOpacity
                  key={p.id || p._id || i}
                  onPress={() =>
                    navigation.navigate("PatientChart", {
                      patientId: p.id || p._id,
                      patientName: p.name,
                    })
                  }
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="flex-row items-center rounded-2xl p-4 border mb-3 mt-3"
                >
                  <View
                    style={{ backgroundColor: theme.primaryLight }}
                    className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  >
                    <MaterialIcons name="person" size={22} color={theme.primary} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-sm font-bold">
                      {p.name}
                    </Text>
                    {p.lastVisit ? (
                      <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                        Last visit {p.lastVisit}
                      </Text>
                    ) : null}
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── PRO-02 · PATIENT CHART (full authorized view) ───
export function PatientChartScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const isPro = useProGate();
  const { patientId, patientName } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState(null);
  const [denied, setDenied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isPro || !patientId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getPatientChart(patientId);
        if (!cancelled) setChart(data);
      } catch (err) {
        if (cancelled) return;
        // Authorization is enforced server-side (see design.md) - a 403
        // is a real denial, distinct from "endpoint not built yet".
        if (/403|forbidden/i.test(err.message || "")) {
          setDenied(true);
        } else {
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPro, patientId]);

  if (!isPro) return <ProAccessDenied navigation={navigation} title="Patient Chart" />;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={patientName || "Patient Chart"} onBack={() => navigation.goBack()} isWeb={isWeb} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : denied ? (
        <EmptyState
          icon="block"
          title="Access denied"
          description="You don't have an authorized care relationship with this patient."
        />
      ) : failed || !chart ? (
        <LoadErrorPanel
          title="Couldn't load this chart"
          description="Something went wrong loading this patient's chart. Pull to refresh or try again shortly."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
            >
              <Text style={{ color: theme.text }} className="text-lg font-extrabold mb-1">
                {chart.name || patientName}
              </Text>
              {chart.age || chart.bloodType ? (
                <Text style={{ color: theme.textSecondary }} className="text-sm mb-4">
                  {chart.age ? `${chart.age} yrs` : ""}
                  {chart.age && chart.bloodType ? " · " : ""}
                  {chart.bloodType ? `Blood Group ${chart.bloodType}` : ""}
                </Text>
              ) : null}

              {chart.allergies?.length ? (
                <>
                  <SectionLabel>Allergies</SectionLabel>
                  <View className="flex-row flex-wrap">
                    {chart.allergies.map((a) => (
                      <Chip key={a} label={a} />
                    ))}
                  </View>
                </>
              ) : null}

              {chart.medications?.length ? (
                <>
                  <SectionLabel>Current Medications</SectionLabel>
                  <View className="flex-row flex-wrap">
                    {chart.medications.map((m) => (
                      <Chip key={m} label={m} />
                    ))}
                  </View>
                </>
              ) : null}

              {chart.diagnoses?.length ? (
                <>
                  <SectionLabel>Diagnoses</SectionLabel>
                  <View className="flex-row flex-wrap">
                    {chart.diagnoses.map((d) => (
                      <Chip key={d} label={d} />
                    ))}
                  </View>
                </>
              ) : null}

              {chart.vitals ? (
                <>
                  <SectionLabel>Recent Vitals</SectionLabel>
                  <Text style={{ color: theme.text }} className="text-sm font-semibold">
                    {chart.vitals}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── PRO-03 · CLINICAL NOTES LIBRARY ───
export function ClinicalNotesLibraryScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const isPro = useProGate();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyClinicalNotes();
        if (!cancelled) setNotes(Array.isArray(data) ? data : data?.notes || []);
      } catch (err) {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPro]);

  if (!isPro) return <ProAccessDenied navigation={navigation} title="Clinical Notes" />;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Clinical Notes" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : failed || notes.length === 0 ? (
        <LoadErrorPanel
          title={failed ? "Couldn't load your notes" : "No notes yet"}
          description={
            failed
              ? "Something went wrong loading your clinical notes. Pull to refresh or try again shortly."
              : "Notes you author during consultations will show up here, most recent first."
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {notes.map((n, i) => (
                <View
                  key={n.id || n._id || i}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="rounded-2xl p-4 border mb-3 mt-3"
                >
                  <View className="flex-row justify-between items-start mb-1.5">
                    <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                      {n.patientName || "Patient"}
                    </Text>
                    <Text style={{ color: theme.textMuted }} className="text-[11px]">
                      {n.date}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-xs" numberOfLines={3}>
                    {n.content}
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

// ─── PRO-04 · PROFESSIONAL ANALYTICS DASHBOARD ───
export function ProfessionalAnalyticsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const isPro = useProGate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getMyAnalytics();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPro]);

  if (!isPro) return <ProAccessDenied navigation={navigation} title="Analytics" />;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="My Analytics" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : failed || !stats ? (
        <LoadErrorPanel
          title="Couldn't load your analytics"
          description="Something went wrong loading your activity summary. Pull to refresh or try again shortly."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={`flex-row flex-wrap gap-3 mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
              {Object.entries(stats).map(([key, value]) => (
                <View
                  key={key}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="rounded-2xl p-4 border flex-1 min-w-[140px]"
                >
                  <Text style={{ color: theme.primary }} className="text-2xl font-extrabold">
                    {String(value)}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-1 capitalize">
                    {key.replace(/_/g, " ")}
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
