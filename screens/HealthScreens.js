import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";

// ─── MOCK DATA ───
const MOCK_APPOINTMENTS = [
  {
    id: "1",
    doctorName: "Dr. Chidi Eze",
    specialty: "Cardiology",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80",
    date: "May 15, 2026",
    time: "10:30 AM",
    type: "Video Consultation",
    status: "upcoming",
    location: "MedGram Video Room",
    duration: "30 min",
    prep: "Please have your recent blood pressure readings ready before joining.",
  },
  {
    id: "2",
    doctorName: "Dr. Amara Nwosu",
    specialty: "Dermatology",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
    date: "May 22, 2026",
    time: "02:00 PM",
    type: "In-Person",
    status: "upcoming",
    location: "MedGram Clinic, Victoria Island, Lagos",
    duration: "45 min",
    prep: "Bring a valid ID and your MedGram digital health card.",
  },
  {
    id: "3",
    doctorName: "Dr. Sarah",
    specialty: "General Physician",
    avatar:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
    date: "April 2, 2026",
    time: "09:30 AM",
    type: "Video Consultation",
    status: "completed",
    location: "MedGram Video Room",
    duration: "30 min",
    prep: "None — this consultation has already taken place.",
  },
  {
    id: "4",
    doctorName: "Dr. Mark",
    specialty: "Cardiologist",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
    date: "March 18, 2026",
    time: "11:00 AM",
    type: "Chat Consultation",
    status: "completed",
    location: "MedGram Chat",
    duration: "20 min",
    prep: "None — this consultation has already taken place.",
  },
  {
    id: "5",
    doctorName: "Dr. Elena",
    specialty: "Dermatologist",
    avatar:
      "https://images.unsplash.com/photo-1580281657702-257584239a55?auto=format&fit=crop&w=150&q=80",
    date: "March 5, 2026",
    time: "03:30 PM",
    type: "Video Consultation",
    status: "cancelled",
    location: "MedGram Video Room",
    duration: "30 min",
    prep: "None — this appointment was cancelled.",
  },
];

const RECORDS_ITEMS = [
  {
    key: "phr",
    icon: "folder-shared",
    title: "Health Records",
    subtitle: "Diagnoses, medications, immunizations",
  },
  {
    key: "lab",
    icon: "biotech",
    title: "Lab & Imaging",
    subtitle: "Results and trend charts",
  },
  {
    key: "vlt",
    icon: "inventory-2",
    title: "Document Vault",
    subtitle: "Scanned documents & ID papers",
  },
];

const IDENTITY_ITEMS = [
  {
    key: "id",
    icon: "badge",
    title: "Digital Health ID",
    subtitle: "QR code & emergency card",
  },
  {
    key: "passport",
    icon: "flight",
    title: "MedGram Passport",
    subtitle: "Vaccination & travel credential",
  },
  {
    key: "ins",
    icon: "shield",
    title: "Insurance",
    subtitle: "Plans & claims history",
  },
];

const INSIGHTS_ITEMS = [
  {
    key: "ai",
    icon: "insights",
    title: "Health Insights",
    subtitle: "AI risk trends & summaries",
  },
  {
    key: "timeline",
    icon: "timeline",
    title: "Health Timeline",
    subtitle: "Full chronological history",
  },
];

function HubItem({ icon, title, subtitle, onPress, isWeb }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className={`flex-row items-center rounded-2xl p-4 border ${isWeb ? "w-[48.5%]" : "w-full"}`}
    >
      <View
        style={{ backgroundColor: theme.primaryLight }}
        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
      >
        <MaterialIcons name={icon} size={24} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text
          style={{ color: theme.text }}
          className="text-[15px] font-semibold mb-0.5"
        >
          {title}
        </Text>
        <Text style={{ color: theme.textMuted }} className="text-xs">
          {subtitle}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function HubSection({ title, items, isWeb, onItemPress }) {
  const { theme } = useTheme();
  return (
    <View className="mb-8">
      <Text
        style={{ color: theme.textMuted }}
        className="text-[11px] font-bold tracking-widest uppercase mb-3"
      >
        {title}
      </Text>
      <View className={`gap-3 ${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>
        {items.map((item) => (
          <HubItem
            key={item.key}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            isWeb={isWeb}
            onPress={() => onItemPress(item)}
          />
        ))}
      </View>
    </View>
  );
}

export function HealthHubScreen({ onOpenAppointments, onOpenConsult }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;

  const careItems = [
    {
      key: "apt",
      icon: "event",
      title: "Appointments",
      subtitle: "Upcoming & past bookings",
      onPress: onOpenAppointments,
    },
    {
      key: "cns",
      icon: "medical-services",
      title: "Consultations",
      subtitle: "Book or continue a consult",
      onPress: onOpenConsult,
    },
    {
      key: "rx",
      icon: "medication",
      title: "Prescriptions",
      subtitle: "Active & expired scripts",
    },
    {
      key: "ref",
      icon: "share",
      title: "Referrals",
      subtitle: "Track referral status",
    },
    {
      key: "crp",
      icon: "checklist",
      title: "Care Plans",
      subtitle: "Chronic disease management",
    },
  ];

  const handleItemPress = (item) => {
    if (item.onPress) {
      item.onPress();
      return;
    }
    toast.info(`${item.title} is coming soon.`);
  };

  return (
    <View className="flex-1 bg-transparent">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingTop: isWeb ? 20 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {/* Header */}
          <View
            className={`mt-5 mb-6 ${isWeb ? "flex-row items-center justify-between" : ""}`}
          >
            <View>
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-extrabold"
              >
                Health Hub
              </Text>
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm mt-1"
              >
                Records, care, identity & insights — all in one place.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toast.info("Health report generation is coming soon.")}
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${isWeb ? "" : "mt-4 self-start"}`}
            >
              <MaterialIcons
                name="picture-as-pdf"
                size={18}
                color={theme.primary}
                className="mr-1.5"
              />
              <Text
                style={{ color: theme.primary }}
                className="font-semibold text-sm ml-1.5"
              >
                Generate Report
              </Text>
            </TouchableOpacity>
          </View>

          <HubSection
            title="Care"
            items={careItems}
            isWeb={isWeb}
            onItemPress={handleItemPress}
          />
          <HubSection
            title="Records"
            items={RECORDS_ITEMS}
            isWeb={isWeb}
            onItemPress={handleItemPress}
          />
          <HubSection
            title="Identity & Coverage"
            items={IDENTITY_ITEMS}
            isWeb={isWeb}
            onItemPress={handleItemPress}
          />
          <HubSection
            title="Insights"
            items={INSIGHTS_ITEMS}
            isWeb={isWeb}
            onItemPress={handleItemPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function statusColors(theme, status) {
  if (status === "upcoming") {
    return { bg: theme.primaryLight, fg: theme.primary, label: "Upcoming" };
  }
  if (status === "cancelled") {
    return { bg: theme.errorLight, fg: theme.error, label: "Cancelled" };
  }
  return { bg: theme.successLight, fg: theme.success, label: "Completed" };
}

function AppointmentCard({ appointment, isWeb, onPress }) {
  const { theme } = useTheme();
  const { bg, fg, label } = statusColors(theme, appointment.status);
  const [month, day] = appointment.date.split(" ");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className={`flex-row items-center rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
    >
      <View
        style={{ backgroundColor: theme.background }}
        className="w-14 h-14 rounded-xl items-center justify-center mr-3"
      >
        <Text
          style={{ color: theme.text }}
          className="text-base font-extrabold"
        >
          {day.replace(",", "")}
        </Text>
        <Text
          style={{ color: theme.primary }}
          className="text-[9px] font-bold tracking-wider uppercase"
        >
          {month}
        </Text>
      </View>
      <View className="flex-1 mr-2">
        <Text
          style={{ color: theme.text }}
          className="text-[15px] font-semibold mb-0.5"
          numberOfLines={1}
        >
          {appointment.doctorName}
        </Text>
        <Text
          style={{ color: theme.textSecondary }}
          className="text-xs mb-1"
          numberOfLines={1}
        >
          {appointment.specialty} · {appointment.type}
        </Text>
        <Text style={{ color: theme.textMuted }} className="text-xs">
          {appointment.time}
        </Text>
      </View>
      <View className="items-end">
        <View
          style={{ backgroundColor: bg }}
          className="px-2.5 py-1 rounded-full mb-2"
        >
          <Text style={{ color: fg }} className="text-[10px] font-bold">
            {label}
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

export function AppointmentsScreen({ onBack, onOpenDetail, onBookNew }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const [activeTab, setActiveTab] = useState("upcoming");

  const filtered = MOCK_APPOINTMENTS.filter((a) =>
    activeTab === "upcoming"
      ? a.status === "upcoming"
      : a.status === "completed" || a.status === "cancelled",
  );

  return (
    <View className="flex-1 bg-transparent">
      {!isWeb && (
        <View
          style={{
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          }}
          className="flex-row items-center justify-between px-5 py-3 border-b"
        >
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-lg font-bold">
            My Appointments
          </Text>
          <View className="w-6" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {isWeb && (
            <View className="flex-row items-center justify-between mt-5 mb-6">
              <Text
                style={{ color: theme.text }}
                className="text-2xl font-extrabold"
              >
                My Appointments
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center px-5 py-2.5 rounded-xl"
                onPress={onBookNew}
              >
                <MaterialIcons name="add" size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold text-sm ml-1.5">
                  Book New
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Segmented Control */}
          <View
            style={{
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border,
            }}
            className="flex-row rounded-xl p-1 border mt-4 mb-5"
          >
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor: isActive ? theme.surface : "transparent",
                    borderColor: isActive ? theme.border : "transparent",
                  }}
                  className="flex-1 items-center justify-center py-2 rounded-lg border"
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: isActive ? theme.primary : theme.textSecondary,
                    }}
                    className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filtered.length > 0 ? (
            <View
              className={isWeb ? "flex-row flex-wrap justify-between" : ""}
            >
              {filtered.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isWeb={isWeb}
                  onPress={() => onOpenDetail(appointment.id)}
                />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-16">
              <MaterialIcons name="event-busy" size={54} color="#D1D5DB" />
              <Text
                style={{ color: theme.textMuted }}
                className="mt-3 text-sm text-center font-medium"
              >
                {activeTab === "upcoming"
                  ? "No upcoming appointments."
                  : "No past appointments yet."}
              </Text>
            </View>
          )}

          {!isWeb && (
            <TouchableOpacity
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-4 rounded-xl mt-4"
              onPress={onBookNew}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">
                Book New Appointment
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }) {
  const { theme } = useTheme();
  return (
    <View className="flex-row justify-between items-center py-2.5">
      <Text style={{ color: theme.textSecondary }} className="text-[15px]">
        {label}
      </Text>
      <Text
        style={{ color: theme.text }}
        className="text-[15px] font-semibold"
      >
        {value}
      </Text>
    </View>
  );
}

export function AppointmentDetailScreen({
  appointmentId,
  onBack,
  onOpenConsult,
}) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const appointment =
    MOCK_APPOINTMENTS.find((a) => a.id === appointmentId) ||
    MOCK_APPOINTMENTS[0];
  const { bg, fg, label } = statusColors(theme, appointment.status);
  const isJoinable =
    appointment.status === "upcoming" && appointment.type !== "In-Person";

  return (
    <View className="flex-1 bg-transparent">
      {!isWeb && (
        <View
          style={{
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          }}
          className="flex-row items-center justify-between px-5 py-3 border-b"
        >
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-lg font-bold">
            Appointment Details
          </Text>
          <View className="w-6" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingTop: isWeb ? 20 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          {isWeb && (
            <TouchableOpacity
              onPress={onBack}
              className="flex-row items-center mt-5 mb-5"
            >
              <MaterialIcons
                name="arrow-back"
                size={18}
                color={theme.textSecondary}
              />
              <Text
                style={{ color: theme.textSecondary }}
                className="text-sm font-semibold ml-1.5"
              >
                Back to Appointments
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className={`rounded-[24px] p-6 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row items-center mb-5">
              <Image
                source={{ uri: appointment.avatar }}
                className="w-16 h-16 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text
                  style={{ color: theme.text }}
                  className="text-lg font-bold mb-0.5"
                >
                  {appointment.doctorName}
                </Text>
                <Text
                  style={{ color: theme.textSecondary }}
                  className="text-sm"
                >
                  {appointment.specialty}
                </Text>
              </View>
              <View style={{ backgroundColor: bg }} className="px-3 py-1.5 rounded-full">
                <Text style={{ color: fg }} className="text-xs font-bold">
                  {label}
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: theme.border }}
              className="h-[1px] my-1"
            />

            <DetailRow label="Date" value={appointment.date} />
            <DetailRow label="Time" value={appointment.time} />
            <DetailRow label="Type" value={appointment.type} />
            <DetailRow label="Location" value={appointment.location} />
            <DetailRow label="Duration" value={appointment.duration} />

            <View
              style={{ backgroundColor: theme.border }}
              className="h-[1px] my-3"
            />

            <Text
              style={{ color: theme.textMuted }}
              className="text-[11px] font-bold tracking-wider uppercase mb-2"
            >
              Preparation Instructions
            </Text>
            <Text
              style={{ color: theme.textSecondary }}
              className="text-sm leading-5"
            >
              {appointment.prep}
            </Text>
          </View>

          <View className={`mt-6 gap-3 ${isWeb ? "flex-row" : ""}`}>
            {isJoinable && (
              <TouchableOpacity
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-4 rounded-xl flex-1"
                onPress={onOpenConsult}
              >
                <MaterialIcons name="videocam" size={20} color="#FFFFFF" />
                <Text className="text-white text-base font-bold ml-2">
                  Join Consultation
                </Text>
              </TouchableOpacity>
            )}
            {appointment.status === "upcoming" && (
              <>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  className="flex-row items-center justify-center py-4 rounded-xl border flex-1"
                  onPress={() =>
                    toast.info("Reschedule flow is coming in the next update.")
                  }
                >
                  <MaterialIcons
                    name="event-repeat"
                    size={20}
                    color={theme.text}
                  />
                  <Text
                    style={{ color: theme.text }}
                    className="text-base font-bold ml-2"
                  >
                    Reschedule
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.errorLight,
                    borderColor: theme.errorLight,
                  }}
                  className="flex-row items-center justify-center py-4 rounded-xl border flex-1"
                  onPress={() =>
                    toast.info("Cancellation flow is coming in the next update.")
                  }
                >
                  <MaterialIcons name="close" size={20} color={theme.error} />
                  <Text
                    style={{ color: theme.error }}
                    className="text-base font-bold ml-2"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
