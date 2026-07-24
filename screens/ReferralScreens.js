import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the referrals API lands.
const REFERRAL_STAGES = ["created", "sent", "accepted", "scheduled", "closed"];
const STAGE_LABELS = {
  created: "Created",
  sent: "Sent",
  accepted: "Accepted",
  scheduled: "Scheduled",
  closed: "Closed",
};

const MOCK_REFERRALS = [
  {
    id: "1",
    specialistName: "Dr. Amara Nwosu",
    specialty: "Dermatology",
    referringProvider: "Dr. Chidi Eze",
    referringSpecialty: "General Physician",
    reason: "Persistent skin rash, suspected contact dermatitis",
    notes: "Patient has tried OTC antihistamines with no improvement over 3 weeks.",
    status: "scheduled",
    createdDate: "Jul 10, 2026",
    appointmentDate: "Jul 29, 2026 · 2:00 PM",
  },
  {
    id: "2",
    specialistName: "Dr. Femi Bankole",
    specialty: "Cardiology",
    referringProvider: "Dr. Chidi Eze",
    referringSpecialty: "General Physician",
    reason: "Abnormal ECG findings during routine checkup",
    notes: "Recommend echocardiogram and stress test.",
    status: "sent",
    createdDate: "Jul 18, 2026",
    appointmentDate: null,
  },
  {
    id: "3",
    specialistName: "Dr. Sarah Coker",
    specialty: "Orthopedics",
    referringProvider: "Dr. Elena Cruz",
    referringSpecialty: "Emergency Medicine",
    reason: "Suspected ligament tear, left knee",
    notes: "MRI recommended before follow-up.",
    status: "closed",
    createdDate: "May 2, 2026",
    appointmentDate: "May 14, 2026 · 10:00 AM",
  },
];

function getReferral(id) {
  return MOCK_REFERRALS.find((r) => r.id === id) || MOCK_REFERRALS[0];
}

function ReferralStepper({ status }) {
  const { theme } = useTheme();
  const activeIndex = REFERRAL_STAGES.indexOf(status);
  return (
    <View className="flex-row items-center">
      {REFERRAL_STAGES.map((stage, i) => {
        const done = i <= activeIndex;
        return (
          <React.Fragment key={stage}>
            <View className="items-center" style={{ width: 56 }}>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: done ? theme.primary : theme.surfaceSubtle, borderWidth: 1, borderColor: done ? theme.primary : theme.border }}
              >
                {done ? (
                  <MaterialIcons name="check" size={14} color="#FFFFFF" />
                ) : (
                  <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold">
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={{ color: done ? theme.text : theme.textMuted }}
                className="text-[9px] font-bold uppercase mt-1 text-center"
                numberOfLines={1}
              >
                {STAGE_LABELS[stage]}
              </Text>
            </View>
            {i < REFERRAL_STAGES.length - 1 && (
              <View
                className="flex-1 h-[2px] -mt-4"
                style={{ backgroundColor: i < activeIndex ? theme.primary : theme.border }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── REF-01 · MY REFERRALS ───
export function ReferralsListScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const hasReferrals = MOCK_REFERRALS.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Referrals" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {!hasReferrals ? (
        <EmptyState
          icon="share"
          title="No referrals yet"
          description="Referrals your provider sends to a specialist will show up here."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "flex-row flex-wrap gap-4 mt-5" : "mt-5"}>
              {MOCK_REFERRALS.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => navigation.navigate("ReferralDetail", { referralId: r.id })}
                  activeOpacity={0.7}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text style={{ color: theme.text }} className="text-[15px] font-bold">
                        {r.specialistName}
                      </Text>
                      <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                        {r.specialty} · Referred by {r.referringProvider}
                      </Text>
                    </View>
                    <Text style={{ color: theme.textMuted }} className="text-[11px]">
                      {r.createdDate}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mb-3" numberOfLines={2}>
                    {r.reason}
                  </Text>
                  <ReferralStepper status={r.status} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── REF-02 · REFERRAL DETAIL ───
export function ReferralDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const referral = getReferral(route?.params?.referralId);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Referral Detail" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <ReferralStepper status={referral.status} />
          </View>

          <View className={isWeb ? "max-w-[560px]" : ""}>
            <SectionLabel>Receiving Specialist</SectionLabel>
            <InfoCard
              icon="person"
              title={referral.specialistName}
              subtitle={referral.specialty}
            />

            <SectionLabel>Referring Provider</SectionLabel>
            <InfoCard
              icon="local-hospital"
              title={referral.referringProvider}
              subtitle={referral.referringSpecialty}
            />

            <SectionLabel>Reason for Referral</SectionLabel>
            <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-2">
              <Text style={{ color: theme.text }} className="text-sm leading-5">
                {referral.reason}
              </Text>
            </View>

            {referral.notes ? (
              <>
                <SectionLabel>Clinical Notes</SectionLabel>
                <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border mb-2">
                  <Text style={{ color: theme.textSecondary }} className="text-sm leading-5">
                    {referral.notes}
                  </Text>
                </View>
              </>
            ) : null}

            {referral.appointmentDate ? (
              <>
                <SectionLabel>Appointment</SectionLabel>
                <InfoCard icon="event" title={referral.appointmentDate} subtitle="Scheduled with specialist" />
              </>
            ) : null}

            <View className="mt-6 gap-3">
              {referral.status === "sent" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("ReferralConsent", { referralId: referral.id })}
                  style={{ backgroundColor: theme.primary }}
                  className="flex-row items-center justify-center py-4 rounded-xl"
                >
                  <MaterialIcons name="fact-check" size={20} color="#FFFFFF" />
                  <Text className="text-white text-base font-bold ml-2">Review & Approve</Text>
                </TouchableOpacity>
              )}
              {referral.status === "closed" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("ReferralFeedback", { referralId: referral.id })}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="flex-row items-center justify-center py-4 rounded-xl border"
                >
                  <MaterialIcons name="rate-review" size={20} color={theme.text} />
                  <Text style={{ color: theme.text }} className="text-base font-bold ml-2">
                    Leave Feedback
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({ icon, title, subtitle }) {
  const { theme } = useTheme();
  return (
    <View
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className="flex-row items-center rounded-2xl p-4 border mb-2"
    >
      <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
        <MaterialIcons name={icon} size={20} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text style={{ color: theme.text }} className="text-sm font-bold">
          {title}
        </Text>
        <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// ─── REF-03 · REFERRAL CONSENT / APPROVAL ───
export function ReferralConsentScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const referral = getReferral(route?.params?.referralId);
  const [submitting, setSubmitting] = useState(false);

  const respond = (approved) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(approved ? "Referral approved." : "Referral declined.");
      navigation.goBack();
    }, 500);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Referral Consent" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text
            style={{ color: theme.textSecondary }}
            className={`text-sm mt-5 mb-4 leading-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {referral.referringProvider} wants to refer you to {referral.specialistName} (
            {referral.specialty}). Approving will share the record sections below with the
            receiving specialist.
          </Text>

          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-sm font-bold mb-3">
              Data to be shared
            </Text>
            {["Reason for referral", "Relevant diagnoses", "Current medications", "Recent lab results"].map(
              (item) => (
                <View key={item} className="flex-row items-center py-2">
                  <MaterialIcons name="check-circle" size={16} color={theme.success} />
                  <Text style={{ color: theme.textSecondary }} className="text-sm ml-2">
                    {item}
                  </Text>
                </View>
              ),
            )}
          </View>

          <View className={`mt-6 gap-3 ${isWeb ? "flex-row max-w-[520px]" : ""}`}>
            <TouchableOpacity
              onPress={() => respond(true)}
              disabled={submitting}
              style={{ backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl"
            >
              <Text className="text-white text-base font-bold">Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => respond(false)}
              disabled={submitting}
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="flex-1 flex-row items-center justify-center py-4 rounded-xl border"
            >
              <Text style={{ color: theme.text }} className="text-base font-bold">
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── REF-04 · REFERRAL FEEDBACK ───
export function ReferralFeedbackScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const referral = getReferral(route?.params?.referralId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please choose a rating.");
      return;
    }
    toast.success("Thanks for your feedback!");
    navigation.goBack();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Referral Feedback" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className={`text-sm mt-5 mb-4 ${isWeb ? "max-w-[480px]" : ""}`}>
            How was your visit with {referral.specialistName}?
          </Text>

          <View className={`flex-row justify-center gap-2 mb-6 ${isWeb ? "max-w-[480px]" : ""}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialIcons
                  name={star <= rating ? "star" : "star-border"}
                  size={36}
                  color={star <= rating ? "#F59E0B" : theme.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View className={isWeb ? "max-w-[480px]" : ""}>
            <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-2">
              Additional comments (optional)
            </Text>
            <TextInput
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
              className="rounded-xl px-4 py-3 border text-[15px] h-28"
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us more about your experience"
              placeholderTextColor={theme.textMuted}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
