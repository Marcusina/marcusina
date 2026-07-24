import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the AI assistant API lands.
const SUGGESTED_PROMPTS = [
  { key: "symptoms", label: "Check my symptoms", icon: "sick" },
  { key: "labs", label: "Explain a lab result", icon: "science" },
  { key: "meds", label: "Medication questions", icon: "medication" },
  { key: "book", label: "Help me book a consultation", icon: "event" },
];

const SYMPTOM_STEPS = [
  {
    key: "main",
    question: "What's your main symptom?",
    multi: false,
    options: ["Headache", "Fever", "Cough", "Stomach pain", "Fatigue", "Other"],
  },
  {
    key: "duration",
    question: "How long have you had it?",
    multi: false,
    options: ["Less than 1 day", "1-3 days", "4-7 days", "More than a week"],
  },
  {
    key: "severity",
    question: "How severe is it?",
    multi: false,
    options: ["Mild", "Moderate", "Severe"],
  },
  {
    key: "other",
    question: "Any other symptoms?",
    multi: true,
    options: ["Nausea", "Dizziness", "Shortness of breath", "None"],
  },
];

const MOCK_CONSIDERATIONS = [
  { condition: "Tension Headache", likelihood: "Common" },
  { condition: "Dehydration", likelihood: "Possible" },
  { condition: "Migraine", likelihood: "Less Likely" },
];

const LIKELIHOOD_COLOR = {
  Common: "#EF4444",
  Possible: "#F59E0B",
  "Less Likely": "#9A9A9A",
};

const MOCK_INSIGHTS = [
  { key: "diabetes", label: "Diabetes Risk", value: "Low", trend: "flat", icon: "monitor-heart", tone: "success" },
  { key: "bp", label: "Blood Pressure Trend", value: "Improving", trend: "down", icon: "favorite", tone: "success" },
  { key: "adherence", label: "Medication Adherence", value: "92%", trend: "up", icon: "medication", tone: "success" },
  { key: "activity", label: "Activity Level", value: "Below Goal", trend: "down", icon: "directions-walk", tone: "warning" },
];

const MOCK_TREND_HIGHLIGHTS = [
  { title: "HbA1c improved from 7.9% to 6.8%", detail: "Over the last 6 months - keep up the current care plan.", icon: "trending-down" },
  { title: "3 missed medication reminders this month", detail: "Consider adjusting reminder times in Prescriptions.", icon: "notifications-active" },
  { title: "No overdue vaccinations", detail: "Your immunization record is fully up to date.", icon: "verified" },
];

function AIBubble({ fromAI, text, children }) {
  const { theme } = useTheme();
  return (
    <View className={`mb-3 ${fromAI ? "items-start" : "items-end"}`}>
      <View
        style={{
          backgroundColor: fromAI ? theme.surface : theme.primary,
          borderColor: fromAI ? theme.border : theme.primary,
        }}
        className="max-w-[85%] rounded-2xl px-4 py-3 border"
      >
        {text ? (
          <Text style={{ color: fromAI ? theme.text : "#FFFFFF" }} className="text-sm leading-5">
            {text}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

// ─── AI-01 · AI CHAT HOME ───
export function AIChatHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const handlePrompt = (prompt) => {
    if (prompt.key === "symptoms") {
      navigation.navigate("SymptomCheck");
      return;
    }
    if (prompt.key === "book") {
      navigation.navigate("ConsultBooking");
      return;
    }
    sendMessage(prompt.label);
  };

  const sendMessage = (text) => {
    const userMsg = { id: `u-${Date.now()}`, fromAI: false, text };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          fromAI: true,
          text: "Based on what you described, here's some general guidance. This is decision support, not a diagnosis - a licensed professional should confirm anything important.",
          showBreakdown: true,
        },
      ]);
    }, 700);
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="AI Assistant" onBack={() => navigation.goBack()} isWeb={isWeb} />

      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingTop: 12, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            {messages.length === 0 ? (
              <View className="items-center mt-6 mb-8">
                <View style={{ backgroundColor: theme.primaryLight }} className="w-16 h-16 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="auto-awesome" size={28} color={theme.primary} />
                </View>
                <Text style={{ color: theme.text }} className="text-lg font-extrabold text-center">
                  How can I help today?
                </Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs text-center mt-1 max-w-[280px]">
                  I offer decision support, not medical diagnosis. For anything urgent, contact a
                  professional directly.
                </Text>
              </View>
            ) : (
              messages.map((m) => (
                <AIBubble key={m.id} fromAI={m.fromAI} text={m.text}>
                  {m.showBreakdown && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate("AIResponse")}
                      className="flex-row items-center mt-2"
                    >
                      <Text style={{ color: theme.primary }} className="text-xs font-bold">
                        See detailed breakdown
                      </Text>
                      <MaterialIcons name="chevron-right" size={16} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                </AIBubble>
              ))
            )}

            {messages.length === 0 && (
              <View className="flex-row flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => handlePrompt(p)}
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="flex-row items-center px-3.5 py-2.5 rounded-full border"
                  >
                    <MaterialIcons name={p.icon} size={16} color={theme.primary} />
                    <Text style={{ color: theme.text }} className="text-xs font-semibold ml-1.5">
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: theme.surface, borderTopColor: theme.border }} className="flex-row items-center px-3 py-2.5 border-t gap-2">
        <TextInput
          style={{ backgroundColor: theme.surfaceSubtle, color: theme.text }}
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask the AI Assistant..."
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity onPress={handleSend} style={{ backgroundColor: theme.primary }} className="w-9 h-9 rounded-full items-center justify-center">
          <MaterialIcons name="arrow-upward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── AI-02 · GUIDED SYMPTOM-CHECK CONVERSATION ───
export function SymptomCheckScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const step = SYMPTOM_STEPS[stepIndex];
  const selected = answers[step.key] || (step.multi ? [] : null);

  const selectOption = (option) => {
    setAnswers((prev) => {
      if (!step.multi) return { ...prev, [step.key]: option };
      const current = prev[step.key] || [];
      const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [step.key]: next };
    });
  };

  const isSelected = (option) => (step.multi ? selected.includes(option) : selected === option);
  const canProceed = step.multi ? true : !!selected;

  const handleNext = () => {
    if (!canProceed) {
      toast.error("Please make a selection.");
      return;
    }
    if (stepIndex < SYMPTOM_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      navigation.navigate("AIResponse");
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Symptom Check"
        onBack={() => (stepIndex === 0 ? navigation.goBack() : setStepIndex(stepIndex - 1))}
        isWeb={isWeb}
      />
      <View className={isWeb ? "px-6 pt-5" : "px-5 pt-5"}>
        <View className={`flex-row gap-1.5 mb-6 ${isWeb ? "max-w-[480px]" : ""}`}>
          {SYMPTOM_STEPS.map((s, i) => (
            <View
              key={s.key}
              className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: i <= stepIndex ? theme.primary : theme.surfaceSubtle }}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.text }} className={`text-xl font-extrabold mb-5 ${isWeb ? "max-w-[480px]" : ""}`}>
            {step.question}
          </Text>

          <View className={`gap-2.5 ${isWeb ? "max-w-[480px]" : ""}`}>
            {step.options.map((option) => {
              const active = isSelected(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => selectOption(option)}
                  style={{
                    backgroundColor: active ? theme.primaryLight : theme.surface,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                  className="flex-row items-center justify-between rounded-2xl p-4 border"
                >
                  <Text style={{ color: active ? theme.primary : theme.text }} className="text-sm font-semibold">
                    {option}
                  </Text>
                  <MaterialIcons
                    name={step.multi ? (active ? "check-box" : "check-box-outline-blank") : active ? "radio-button-checked" : "radio-button-unchecked"}
                    size={20}
                    color={active ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-8 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">
              {stepIndex < SYMPTOM_STEPS.length - 1 ? "Next" : "See Results"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── AI-03 · AI RESPONSE VIEW ───
export function AIResponseScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="AI Response" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.warningLight }}
            className={`flex-row items-start rounded-2xl p-4 mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <MaterialIcons name="info" size={18} color={theme.warning} />
            <Text style={{ color: theme.text }} className="text-xs ml-2.5 flex-1 leading-5 font-semibold">
              AI Decision Support - not a diagnosis. Please confirm anything important with a
              licensed professional.
            </Text>
          </View>

          <SectionLabel>Possible Considerations</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_CONSIDERATIONS.map((c) => (
              <View
                key={c.condition}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <Text style={{ color: theme.text }} className="text-sm font-semibold">
                  {c.condition}
                </Text>
                <View
                  className="px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${LIKELIHOOD_COLOR[c.likelihood]}20` }}
                >
                  <Text
                    style={{ color: LIKELIHOOD_COLOR[c.likelihood] }}
                    className="text-[10px] font-bold uppercase"
                  >
                    {c.likelihood}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("AIHandoff")}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">See Recommended Next Step</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── AI-04 · HAND-OFF SCREEN ───
export function AIHandoffScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Recommended Next Step" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <View style={{ backgroundColor: theme.primaryLight }} className="w-12 h-12 rounded-xl items-center justify-center mb-3">
              <MaterialIcons name="medical-services" size={24} color={theme.primary} />
            </View>
            <Text style={{ color: theme.text }} className="text-base font-bold mb-1.5">
              Consult a General Physician
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">
              Based on your symptoms, a consultation would help confirm what's going on and rule
              out anything more serious.
            </Text>
          </View>

          <View className={`mt-5 gap-3 ${isWeb ? "max-w-[520px]" : ""}`}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ConsultBooking")}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl"
            >
              <MaterialIcons name="event" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">Book Consultation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toast.info("Lab test ordering is coming soon.")}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-row items-center justify-center py-4 rounded-xl border"
            >
              <MaterialIcons name="science" size={20} color={theme.text} />
              <Text style={{ color: theme.text }} className="text-base font-bold ml-2">Order Lab Test</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Tabs", { screen: "Home" })} className="items-center py-2">
              <Text style={{ color: theme.textMuted }} className="text-sm font-semibold">
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── AI-05 · HEALTH INSIGHTS & ANALYTICS DASHBOARD ───
export function AIInsightsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const toneColor = (tone) => (tone === "success" ? theme.success : tone === "warning" ? theme.warning : theme.textMuted);
  const trendIcon = (trend) => (trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "trending-flat");

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Health Insights" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`flex-row flex-wrap gap-3 mt-5 ${isWeb ? "max-w-[640px]" : ""}`}>
            {MOCK_INSIGHTS.map((insight) => (
              <View
                key={insight.key}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border w-[47%]"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <MaterialIcons name={insight.icon} size={20} color={theme.primary} />
                  <MaterialIcons name={trendIcon(insight.trend)} size={16} color={toneColor(insight.tone)} />
                </View>
                <Text style={{ color: theme.text }} className="text-base font-extrabold">
                  {insight.value}
                </Text>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                  {insight.label}
                </Text>
              </View>
            ))}
          </View>

          <SectionLabel>Trend Highlights</SectionLabel>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            {MOCK_TREND_HIGHLIGHTS.map((h) => (
              <View
                key={h.title}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-start rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-9 h-9 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name={h.icon} size={18} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {h.title}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {h.detail}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("The full Health Timeline is coming soon.")}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border mt-2"
            >
              <MaterialIcons name="timeline" size={18} color={theme.text} />
              <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                View Full Health Timeline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
