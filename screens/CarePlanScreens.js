import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the care-plans API lands.
const MOCK_CARE_PLANS = [
  {
    id: "cp1",
    title: "Type 2 Diabetes Management",
    type: "Chronic Disease Management",
    provider: "Dr. Chidi Eze",
    startDate: "Jan 12, 2025",
    tasks: [
      { id: "t1", title: "Log fasting blood glucose", frequency: "Daily", done: true },
      { id: "t2", title: "Take Metformin 500mg", frequency: "Twice daily", done: true },
      { id: "t3", title: "30-minute walk", frequency: "5x per week", done: false },
      { id: "t4", title: "HbA1c lab test", frequency: "Every 3 months", done: false },
      { id: "t5", title: "Follow-up consultation", frequency: "Monthly", done: false },
    ],
  },
  {
    id: "cp2",
    title: "Postpartum Wellness Program",
    type: "Wellness Program",
    provider: "Dr. Amara Nwosu",
    startDate: "May 3, 2026",
    tasks: [
      { id: "t6", title: "Postpartum check-up", frequency: "Week 6", done: true },
      { id: "t7", title: "Mental health screening", frequency: "Week 6", done: false },
      { id: "t8", title: "Nutrition consultation", frequency: "Once", done: false },
    ],
  },
];

function planProgress(plan) {
  if (!plan.tasks.length) return 0;
  return Math.round((plan.tasks.filter((t) => t.done).length / plan.tasks.length) * 100);
}

function getPlan(id) {
  return MOCK_CARE_PLANS.find((p) => p.id === id) || MOCK_CARE_PLANS[0];
}

// ─── CRP-01 · MY CARE PLANS ───
export function CarePlansListScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const hasPlans = MOCK_CARE_PLANS.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Care Plans" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {!hasPlans ? (
        <EmptyState icon="checklist" title="No care plans yet" description="Chronic disease management and wellness programs from your care team will show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={`mt-5 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
              {MOCK_CARE_PLANS.map((plan) => {
                const progress = planProgress(plan);
                return (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => navigation.navigate("CarePlanDetail", { planId: plan.id })}
                    activeOpacity={0.7}
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                  >
                    <View className="flex-row justify-between items-start mb-1.5">
                      <Text style={{ color: theme.text }} className="text-[15px] font-bold flex-1 pr-2">
                        {plan.title}
                      </Text>
                      <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mb-3">
                      {plan.type} · {plan.provider}
                    </Text>
                    <View style={{ backgroundColor: theme.surfaceSubtle }} className="h-2 rounded-full overflow-hidden mb-1.5">
                      <View style={{ backgroundColor: theme.primary, width: `${progress}%` }} className="h-full rounded-full" />
                    </View>
                    <Text style={{ color: theme.textMuted }} className="text-xs">
                      {progress}% complete · {plan.tasks.filter((t) => t.done).length}/{plan.tasks.length} tasks
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── CRP-02 · CARE PLAN DETAIL & TASK TRACKER ───
export function CarePlanDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const initialPlan = getPlan(route?.params?.planId);
  const [tasks, setTasks] = useState(initialPlan.tasks);
  const progress = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={initialPlan.title} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text style={{ color: theme.textSecondary }} className="text-xs mb-1">
              {initialPlan.type} · Started {initialPlan.startDate}
            </Text>
            <Text style={{ color: theme.text }} className="text-sm font-bold mb-4">
              Managed by {initialPlan.provider}
            </Text>
            <View style={{ backgroundColor: theme.surfaceSubtle }} className="h-3 rounded-full overflow-hidden mb-2">
              <View style={{ backgroundColor: theme.primary, width: `${progress}%` }} className="h-full rounded-full" />
            </View>
            <Text style={{ color: theme.text }} className="text-sm font-bold">
              {progress}% complete
            </Text>
          </View>

          <SectionLabel>Task Tracker</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {tasks.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => toggleTask(t.id)}
                activeOpacity={0.7}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: t.done ? theme.primary : "transparent",
                    borderWidth: 2,
                    borderColor: t.done ? theme.primary : theme.border,
                  }}
                >
                  {t.done && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                </View>
                <View className="flex-1">
                  <Text
                    style={{
                      color: t.done ? theme.textMuted : theme.text,
                      textDecorationLine: t.done ? "line-through" : "none",
                    }}
                    className="text-sm font-semibold"
                  >
                    {t.title}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {t.frequency}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("Messaging your care team is coming soon.")}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border mt-2"
            >
              <MaterialIcons name="chat" size={18} color={theme.text} />
              <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                Message Care Team
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
