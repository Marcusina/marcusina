import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export function ConsultBookingScreen({ onBack, onProceed, onGoHome }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Sarah");
  const [selectedService, setSelectedService] = useState("Video Call");
  const [selectedDate, setSelectedDate] = useState("WED 19");
  const [selectedSlot, setSelectedSlot] = useState("09:30 AM");

  const doctors = [
    { name: "Dr. Sarah", rating: "4.9", specialty: "General Physician" },
    { name: "Dr. Mark", rating: "4.8", specialty: "Cardiologist" },
    { name: "Dr. Elena", rating: "5.0", specialty: "Dermatologist" },
    { name: "Dr. James", rating: "4.7", specialty: "Pediatrician" },
    { name: "Dr. Chen", rating: "4.8", specialty: "Neurologist" },
  ];

  const dates = [
    { label: "MON", day: "17" },
    { label: "TUE", day: "18" },
    { label: "WED", day: "19" },
    { label: "THU", day: "20" },
    { label: "FRI", day: "21" },
    { label: "SAT", day: "22" },
  ];

  const morningSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
  ];
  const afternoonSlots = ["02:00 PM", "03:30 PM", "04:00 PM"];

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
            Book Consultation
          </Text>
          <View className="w-6" />
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingTop: isWeb ? 0 : 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={isWeb ? "px-0" : "px-5"}>
          <View className={`mt-5 gap-6 ${isWeb ? "flex-row items-start" : ""}`}>
            {/* Main Content Pane */}
            <View className={isWeb ? "flex-[1.5]" : "flex-1"}>
              <View className="flex-row justify-between items-center mb-4">
                <Text
                  style={{ color: theme.text }}
                  className="text-lg font-bold"
                >
                  Select Specialist
                </Text>
                <TouchableOpacity>
                  <Text
                    style={{ color: theme.primary }}
                    className="text-sm font-semibold"
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {doctors.map((doctor) => {
                  const isSelected = selectedDoctor === doctor.name;
                  return (
                    <TouchableOpacity
                      key={doctor.name}
                      style={{
                        backgroundColor: theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                      className="w-[140px] rounded-[20px] p-4 mr-4 items-center border"
                      onPress={() => setSelectedDoctor(doctor.name)}
                    >
                      <View
                        style={{ backgroundColor: theme.background }}
                        className="w-16 h-16 rounded-full items-center justify-center mb-3 relative"
                      >
                        <MaterialIcons
                          name="person"
                          size={32}
                          color={isSelected ? theme.primary : "#9CA3AF"}
                        />
                        {isSelected && (
                          <View
                            style={{
                              backgroundColor: theme.primary,
                              borderColor: theme.surface,
                            }}
                            className="absolute bottom-0 right-0 w-5 h-5 rounded-full items-center justify-center border-2"
                          >
                            <MaterialIcons
                              name="check"
                              size={12}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                      </View>
                      <Text
                        style={{
                          color: isSelected ? theme.primary : theme.text,
                        }}
                        className="text-sm font-semibold mb-1"
                      >
                        {doctor.name}
                      </Text>
                      <Text
                        style={{ color: theme.textSecondary }}
                        className="text-[11px] mb-2 text-center"
                      >
                        {doctor.specialty}
                      </Text>
                      <View
                        style={{ backgroundColor: theme.warningLight }}
                        className="flex-row items-center px-2 py-1 rounded-e-lg"
                      >
                        <MaterialIcons name="star" size={14} color="#FBBF24" />
                        <Text
                          style={{ color: theme.warning }}
                          className="text-xs font-bold ml-1"
                        >
                          {doctor.rating}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text
                style={{ color: theme.text }}
                className="text-lg font-bold mb-4"
              >
                Service Type
              </Text>
              <View className={`gap-3 ${isWeb ? "flex-row flex-wrap" : ""}`}>
                {[
                  { label: "Video Call", icon: "videocam", price: "$25" },
                  { label: "Voice Call", icon: "call", price: "$15" },
                  { label: "Chat", icon: "chat", price: "$10" },
                ].map((item) => {
                  const isSelected = selectedService === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={{
                        backgroundColor: theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      }}
                      className={`flex-row items-center rounded-2xl p-4 border ${isWeb ? "flex-1 min-w-[200px]" : ""}`}
                      onPress={() => setSelectedService(item.label)}
                    >
                      <View
                        style={{
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.primaryLight,
                        }}
                        className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={24}
                          color={isSelected ? "#FFFFFF" : theme.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{
                            color: isSelected ? theme.primary : theme.text,
                          }}
                          className="text-[15px] font-semibold"
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={{ color: theme.textSecondary }}
                          className="text-xs mt-0.5"
                        >
                          {item.price}
                        </Text>
                      </View>
                      {isSelected && (
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sidebar / Scheduling Area */}
            <View className={isWeb ? "flex-1" : "w-full"}>
              <View
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  ...Platform.select({
                    web: { boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
                  }),
                }}
                className="rounded-[24px] p-6 border"
              >
                <View className="flex-row justify-between items-center mb-5">
                  <Text
                    style={{ color: theme.text }}
                    className="text-lg font-bold"
                  >
                    Schedule
                  </Text>
                  <Text
                    style={{ color: theme.textSecondary }}
                    className="text-sm font-semibold"
                  >
                    June 2024
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {dates.map((date) => {
                    const key = `${date.label} ${date.day}`;
                    const isSelected = selectedDate === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={{
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.background,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        }}
                        className="w-16 h-20 rounded-2xl items-center justify-center mr-3 border"
                        onPress={() => setSelectedDate(key)}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? "rgba(255,255,255,0.8)"
                              : theme.textSecondary,
                          }}
                          className="text-[11px] font-semibold mb-1"
                        >
                          {date.label}
                        </Text>
                        <Text
                          style={{
                            color: isSelected
                              ? theme.mode === "dark"
                                ? "#000000"
                                : "#FFFFFF"
                              : theme.text,
                          }}
                          className="text-18 font-bold"
                        >
                          {date.day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text
                  style={{ color: theme.textMuted }}
                  className="text-[12px] font-bold tracking-wider mt-3 mb-3 uppercase"
                >
                  MORNING SLOTS
                </Text>
                <View className="flex-row flex-wrap gap-2.5 mb-5">
                  {morningSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={{
                          backgroundColor: isSelected
                            ? theme.primaryLight
                            : theme.background,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        }}
                        className="px-4 py-2.5 rounded-xl border"
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? theme.primary
                              : theme.textSecondary,
                          }}
                          className="text-xs font-semibold"
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text
                  style={{ color: theme.textMuted }}
                  className="text-[12px] font-bold tracking-wider mt-3 mb-3 uppercase"
                >
                  AFTERNOON SLOTS
                </Text>
                <View className="flex-row flex-wrap gap-2.5 mb-5">
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={{
                          backgroundColor: isSelected
                            ? theme.primaryLight
                            : theme.background,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        }}
                        className="px-4 py-2.5 rounded-xl border"
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? theme.primary
                              : theme.textSecondary,
                          }}
                          className="text-xs font-semibold"
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={{ backgroundColor: theme.primary }}
                  className="flex-row items-center justify-center py-4 rounded-xl mt-3"
                  onPress={onProceed}
                >
                  <Text
                    style={{
                      color: theme.mode === "dark" ? "#000000" : "#FFFFFF",
                    }}
                    className="text-base font-bold mr-2"
                  >
                    Confirm Booking
                  </Text>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={theme.mode === "dark" ? "#000000" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function ConsultConfirmScreen({ onBack, onDone }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web" && width >= 768;

  return (
    <View className="flex-1 bg-transparent">
      <View className="flex-1 items-center justify-center px-8">
        <View
          style={{ backgroundColor: theme.success }}
          className="w-[100px] h-[100px] rounded-full items-center justify-center mb-8"
        >
          <MaterialIcons name="check" size={60} color="#FFFFFF" />
        </View>
        <Text
          style={{ color: theme.text }}
          className="text-3xl font-black text-center mb-3"
        >
          Booking Confirmed!
        </Text>
        <Text
          style={{ color: theme.textSecondary }}
          className="text-base text-center leading-6 mb-10"
        >
          Your consultation with Dr. Sarah has been scheduled for June 19, 2024
          at 09:30 AM.
        </Text>

        <View
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className={`w-full rounded-[24px] p-6 border mb-10 ${isWeb ? "max-w-[500px]" : ""}`}
        >
          <View className="flex-row justify-between items-center py-2">
            <Text
              style={{ color: theme.textSecondary }}
              className="text-[15px]"
            >
              Doctor
            </Text>
            <Text
              style={{ color: theme.text }}
              className="text-[15px] font-semibold"
            >
              Dr. Sarah
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text
              style={{ color: theme.textSecondary }}
              className="text-[15px]"
            >
              Service
            </Text>
            <Text
              style={{ color: theme.text }}
              className="text-[15px] font-semibold"
            >
              Video Call
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text
              style={{ color: theme.textSecondary }}
              className="text-[15px]"
            >
              Time
            </Text>
            <Text
              style={{ color: theme.text }}
              className="text-[15px] font-semibold"
            >
              09:30 AM
            </Text>
          </View>
          <View
            style={{ backgroundColor: theme.border }}
            className="h-[1px] my-3"
          />
          <View className="flex-row justify-between items-center py-2">
            <Text
              style={{ color: theme.textSecondary }}
              className="text-[15px]"
            >
              Total Payment
            </Text>
            <Text
              style={{ color: theme.primary }}
              className="text-xl font-extrabold"
            >
              $25.00
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          className={`px-12 py-4 rounded-xl ${isWeb ? "min-w-[240px]" : ""}`}
          onPress={onDone}
        >
          <Text
            style={{ color: theme.mode === "dark" ? "#000000" : "#FFFFFF" }}
            className="text-base font-bold text-center"
          >
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
