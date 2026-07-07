import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Days of the week starting from Sunday
const DAYS_ORDER = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Generate 12-hour AM/PM intervals (e.g. 12:00 AM, 12:30 AM, 01:00 AM...)
const TIME_OPTIONS = [];
const periods = ["AM", "PM"];
for (const period of periods) {
  for (let h = 0; h < 12; h++) {
    const hour = h === 0 ? 12 : h;
    const hourStr = String(hour).padStart(2, "0");
    TIME_OPTIONS.push(`${hourStr}:00 ${period}`);
    TIME_OPTIONS.push(`${hourStr}:30 ${period}`);
  }
}

export function AvailabilitySchedulePicker({ theme, value = [], onChange }) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeDay, setActiveDay] = useState("");
  const [activeField, setActiveField] = useState(""); // "start_time" or "end_time"
  const [selectedValue, setSelectedValue] = useState("");

  const getDayConfig = (dayName) => {
    return (
      value.find((d) => d.day_of_week === dayName) || {
        day_of_week: dayName,
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: false,
      }
    );
  };

  const handleToggleDay = (dayName, newVal) => {
    let updated = [...value];
    const index = updated.findIndex((d) => d.day_of_week === dayName);

    if (index > -1) {
      updated[index] = { ...updated[index], is_available: newVal };
    } else {
      updated.push({
        day_of_week: dayName,
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: newVal,
      });
    }
    onChange(updated);
  };

  const handleTimeTextChange = (dayName, field, text) => {
    let updated = [...value];
    const index = updated.findIndex((d) => d.day_of_week === dayName);

    if (index > -1) {
      updated[index] = { ...updated[index], [field]: text };
    } else {
      updated.push({
        day_of_week: dayName,
        start_time: field === "start_time" ? text : "09:00 AM",
        end_time: field === "end_time" ? text : "05:00 PM",
        is_available: true,
      });
    }
    onChange(updated);
  };

  const openPicker = (dayName, field, currentVal) => {
    setActiveDay(dayName);
    setActiveField(field);
    setSelectedValue(currentVal || (field === "start_time" ? "09:00 AM" : "05:00 PM"));
    setPickerVisible(true);
  };

  const selectTime = (time) => {
    let updated = [...value];
    const index = updated.findIndex((d) => d.day_of_week === activeDay);

    if (index > -1) {
      updated[index] = { ...updated[index], [activeField]: time };
    } else {
      updated.push({
        day_of_week: activeDay,
        start_time: activeField === "start_time" ? time : "09:00 AM",
        end_time: activeField === "end_time" ? time : "05:00 PM",
        is_available: true,
      });
    }

    onChange(updated);
    setPickerVisible(false);
  };

  return (
    <View
      className="mb-6 rounded-[16px] border p-4"
      style={{
        backgroundColor: theme.surfaceSubtle,
        borderColor: theme.border,
      }}
    >
      <Text className="text-[15px] font-bold mb-1" style={{ color: theme.text }}>
        Availability Schedule *
      </Text>
      <Text
        className="text-xs mb-4"
        style={{ color: theme.textSecondary }}
      >
        Set the days and hours you are available. You can type the times manually (e.g. 09:00 AM) or click the clock icon.
      </Text>

      <View className="gap-3">
        {DAYS_ORDER.map((day) => {
          const config = getDayConfig(day);
          return (
            <View
              key={day}
              className="flex-row items-center justify-between py-2 border-b animate-fade-in"
              style={{
                borderColor: theme.border,
              }}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Switch
                  value={config.is_available}
                  onValueChange={(val) => handleToggleDay(day, val)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={config.is_available ? "#FFF" : "#F4F3F0"}
                />
                <Text
                  className="text-sm font-semibold capitalize ml-3"
                  style={{ color: theme.text }}
                >
                  {day}
                </Text>
              </View>

              {config.is_available ? (
                <View className="flex-row items-center gap-2">
                  {/* Start Time input group */}
                  <View className="flex-row items-center rounded-[8px] border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    <TextInput
                      value={config.start_time}
                      onChangeText={(text) => handleTimeTextChange(day, "start_time", text)}
                      className="w-16 h-8 text-center text-xs px-1"
                      style={{ color: theme.text }}
                    />
                    <TouchableOpacity
                      onPress={() => openPicker(day, "start_time", config.start_time)}
                      className="p-1 border-l justify-center items-center h-8"
                      style={{ borderColor: theme.border }}
                    >
                      <MaterialIcons name="access-time" size={14} color={theme.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.textSecondary }}
                  >
                    to
                  </Text>

                  {/* End Time input group */}
                  <View className="flex-row items-center rounded-[8px] border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                    <TextInput
                      value={config.end_time}
                      onChangeText={(text) => handleTimeTextChange(day, "end_time", text)}
                      className="w-16 h-8 text-center text-xs px-1"
                      style={{ color: theme.text }}
                    />
                    <TouchableOpacity
                      onPress={() => openPicker(day, "end_time", config.end_time)}
                      className="p-1 border-l justify-center items-center h-8"
                      style={{ borderColor: theme.border }}
                    >
                      <MaterialIcons name="access-time" size={14} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text
                  className="text-xs italic"
                  style={{ color: theme.textMuted }}
                >
                  Unavailable
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Time Picker Popup Modal */}
      <Modal
        visible={pickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/60 px-6"
          onPress={() => setPickerVisible(false)}
        >
          <View
            className="w-full max-w-[360px] rounded-[24px] border overflow-hidden p-6 shadow-2xl"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: theme.border }}>
              <View>
                <Text className="text-base font-extrabold capitalize" style={{ color: theme.text }}>
                  {activeField === "start_time" ? "Start" : "End"} Time
                </Text>
                <Text className="text-xs capitalize" style={{ color: theme.textSecondary }}>
                  For {activeDay}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <MaterialIcons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
              <View className="gap-[6px]">
                {TIME_OPTIONS.map((time) => {
                  const isSelected = time === selectedValue;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => selectTime(time)}
                      className="py-3 px-4 rounded-[12px] flex-row justify-between items-center"
                      style={{
                        backgroundColor: isSelected ? theme.primaryLight : "transparent",
                      }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isSelected ? theme.primary : theme.text,
                        }}
                      >
                        {time}
                      </Text>
                      {isSelected && (
                        <MaterialIcons name="check" size={18} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
