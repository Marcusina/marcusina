import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, FormField, EmptyState } from "../components/ScreenKit";
import {
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  checkInAppointment,
  getQueuePosition,
  createAppointment,
} from "../api/appointments.api";
import { saveAppointmentReminder, getAppointmentReminder } from "../utils/storage";
import { STATUS_COLORS, formatDate, JOINABLE_STATUSES } from "./AppointmentsListScreen";

function providerNameOf(item) {
  if (!item?.provider_id) return "Provider";
  return (
    `${item.provider_id.profile?.first_name || ""} ${item.provider_id.profile?.last_name || ""}`.trim() ||
    item.provider_id.username ||
    "Provider"
  );
}

function schedulerNameOf(item) {
  if (!item?.scheduler_id) return "Patient";
  return (
    `${item.scheduler_id.profile?.first_name || ""} ${item.scheduler_id.profile?.last_name || ""}`.trim() ||
    item.scheduler_id.username ||
    "Patient"
  );
}

// Shared result panel. `pendingTitle`/`pendingBody` now describe a genuine
// failure from a real endpoint (validation error, ineligible appointment
// state, network issue) rather than "not built yet" - reschedule/check-in/
// queue-position are all backed by real routes as of add-appointment-management's
// backend implementation.
function ActionResult({ status, successTitle, successBody, pendingTitle = "Couldn't complete this", pendingBody }) {
  const { theme } = useTheme();
  if (status === "success") {
    return (
      <View style={{ backgroundColor: theme.successLight }} className="rounded-2xl p-4 mt-4">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="check-circle" size={18} color={theme.success} />
          <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
            {successTitle}
          </Text>
        </View>
        <Text style={{ color: theme.textSecondary }} className="text-xs leading-5">
          {successBody}
        </Text>
      </View>
    );
  }
  if (status === "pending") {
    return (
      <View style={{ backgroundColor: theme.warningLight }} className="rounded-2xl p-4 mt-4">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="error-outline" size={18} color={theme.warning} />
          <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
            {pendingTitle}
          </Text>
        </View>
        <Text style={{ color: theme.textSecondary }} className="text-xs leading-5">
          {pendingBody}
        </Text>
      </View>
    );
  }
  return null;
}

function useAsyncAction(apiFn) {
  const [status, setStatus] = useState("idle"); // idle | submitting | success | pending
  const [error, setError] = useState(null);
  const run = async (...args) => {
    setStatus("submitting");
    setError(null);
    try {
      const result = await apiFn(...args);
      setStatus("success");
      return { ok: true, result };
    } catch (err) {
      setStatus("pending");
      setError(err);
      return { ok: false, error: err };
    }
  };
  return { status, error, run };
}

// ─── APT-03 · APPOINTMENT DETAIL ───
export function AppointmentDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const queryClient = useQueryClient();
  const { appointmentId } = route?.params || {};

  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
    enabled: !!appointmentId,
  });

  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const reschedule = useAsyncAction((payload) => rescheduleAppointment(appointmentId, payload));

  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLead, setReminderLead] = useState(30);

  React.useEffect(() => {
    if (!appointmentId) return;
    getAppointmentReminder(appointmentId).then((r) => {
      if (r) {
        setReminderEnabled(!!r.enabled);
        setReminderLead(r.leadTimeMinutes || 30);
      }
    });
  }, [appointmentId]);

  const handleToggleReminder = async (enabled) => {
    setReminderEnabled(enabled);
    await saveAppointmentReminder(appointmentId, { enabled, leadTimeMinutes: reminderLead });
    toast.success(enabled ? "Reminder on." : "Reminder off.");
  };

  const handleChangeLead = async (lead) => {
    setReminderLead(lead);
    await saveAppointmentReminder(appointmentId, { enabled: reminderEnabled, leadTimeMinutes: lead });
  };

  const handleReschedule = async () => {
    if (!newDate.trim() || !newTime.trim()) {
      toast.error("Enter a new date and time.");
      return;
    }
    const newStart = new Date(`${newDate.trim()}T${newTime.trim()}`);
    if (Number.isNaN(newStart.getTime())) {
      toast.error("Enter a valid date (YYYY-MM-DD) and time (HH:MM).");
      return;
    }
    const { ok } = await reschedule.run({ scheduled_start_time: newStart.toISOString() });
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(appointmentId, "Cancelled by patient");
      toast.success("Appointment cancelled.");
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancel(false);
    } catch (err) {
      toast.error(err.message || "Couldn't cancel this appointment.");
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Appointment" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState icon="event-busy" title="Appointment not found" />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[appointment.status] || theme.textMuted;
  const isRemote = appointment.appointment_type !== "Physical";
  const isJoinable = isRemote && JOINABLE_STATUSES.includes(appointment.status);
  const isCheckinable = !isRemote && JOINABLE_STATUSES.includes(appointment.status);
  const isCancellable = !["completed", "cancelled", "no_show"].includes(appointment.status);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Appointment" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row justify-between items-start mb-3">
              <Text style={{ color: theme.text }} className="text-lg font-extrabold flex-1 pr-2">
                {providerNameOf(appointment)}
              </Text>
              <View style={{ backgroundColor: `${statusColor}20` }} className="px-2.5 py-1 rounded-full">
                <Text style={{ color: statusColor }} className="text-[10px] font-bold uppercase">
                  {appointment.status?.replace("_", " ")}
                </Text>
              </View>
            </View>
            <DetailRow icon="event" label={formatDate(appointment.scheduled_start_time)} />
            <DetailRow icon="category" label={appointment.appointment_type} />
            {appointment.consultation_reason ? (
              <DetailRow icon="notes" label={appointment.consultation_reason} />
            ) : null}
            <DetailRow
              icon={isRemote ? "videocam" : "place"}
              label={isRemote ? "Remote - join link opens from this screen" : "In-person visit"}
            />
          </View>

          {isJoinable && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("WaitingRoom", {
                  proName: providerNameOf(appointment),
                  consultType: appointment.appointment_type,
                  appointmentId: appointment._id,
                })
              }
              style={{ backgroundColor: theme.primary }}
              className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[560px]" : ""}`}
            >
              <MaterialIcons name="video-call" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">Join Waiting Room</Text>
            </TouchableOpacity>
          )}
          {isCheckinable && (
            <TouchableOpacity
              onPress={() => navigation.navigate("AppointmentCheckIn", { appointmentId: appointment._id })}
              style={{ backgroundColor: theme.primary }}
              className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[560px]" : ""}`}
            >
              <MaterialIcons name="qr-code-scanner" size={20} color="#FFFFFF" />
              <Text className="text-white text-base font-bold ml-2">Check In</Text>
            </TouchableOpacity>
          )}

          <View className={isWeb ? "max-w-[560px]" : ""}>
            <SectionLabel>Reminder</SectionLabel>
            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="rounded-2xl p-4 border"
            >
              <TouchableOpacity
                onPress={() => handleToggleReminder(!reminderEnabled)}
                className="flex-row items-center justify-between"
              >
                <Text style={{ color: theme.text }} className="text-sm font-bold">
                  Remind me before this appointment
                </Text>
                <MaterialIcons
                  name={reminderEnabled ? "toggle-on" : "toggle-off"}
                  size={32}
                  color={reminderEnabled ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
              {reminderEnabled && (
                <View className="flex-row flex-wrap mt-3">
                  {[15, 30, 60, 1440].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => handleChangeLead(mins)}
                      style={{
                        backgroundColor: reminderLead === mins ? theme.primary : theme.surfaceSubtle,
                      }}
                      className="px-3 py-1.5 rounded-full mr-2 mb-2"
                    >
                      <Text
                        style={{ color: reminderLead === mins ? "#FFFFFF" : theme.textSecondary }}
                        className="text-xs font-bold"
                      >
                        {mins < 60 ? `${mins}m` : mins === 60 ? "1h" : "1d"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {isCancellable && (
            <View className={isWeb ? "max-w-[560px]" : ""}>
              <SectionLabel>Manage</SectionLabel>
              {!showReschedule ? (
                <TouchableOpacity
                  onPress={() => setShowReschedule(true)}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="flex-row items-center justify-center py-3.5 rounded-xl border mb-3"
                >
                  <MaterialIcons name="event-repeat" size={18} color={theme.text} />
                  <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                    Reschedule
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="rounded-2xl p-4 border mb-3"
                >
                  <FormField label="New Date" value={newDate} onChangeText={setNewDate} placeholder="YYYY-MM-DD" />
                  <FormField label="New Time" value={newTime} onChangeText={setNewTime} placeholder="e.g. 14:30" last />
                  <TouchableOpacity
                    onPress={handleReschedule}
                    disabled={reschedule.status === "submitting"}
                    style={{ backgroundColor: theme.primary, opacity: reschedule.status === "submitting" ? 0.7 : 1 }}
                    className="flex-row items-center justify-center py-3.5 rounded-xl mt-2"
                  >
                    {reschedule.status === "submitting" ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="text-white text-sm font-bold">Confirm New Time</Text>
                    )}
                  </TouchableOpacity>
                  <ActionResult
                    status={reschedule.status}
                    successTitle="Rescheduled"
                    successBody="Your appointment has been moved to the new time."
                    pendingTitle="Couldn't reschedule"
                    pendingBody={
                      reschedule.error?.message ||
                      "This appointment couldn't be rescheduled. It may no longer be eligible - try again or contact your provider."
                    }
                  />
                </View>
              )}

              {!showCancel ? (
                <TouchableOpacity
                  onPress={() => setShowCancel(true)}
                  style={{ borderColor: theme.error }}
                  className="flex-row items-center justify-center py-3.5 rounded-xl border"
                >
                  <MaterialIcons name="cancel" size={18} color={theme.error} />
                  <Text style={{ color: theme.error }} className="text-sm font-bold ml-2">
                    Cancel Appointment
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: theme.errorLight }} className="rounded-2xl p-4">
                  <Text style={{ color: theme.text }} className="text-sm mb-3">
                    Cancel this appointment? This can't be undone.
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setShowCancel(false)}
                      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                      className="flex-1 items-center justify-center py-3 rounded-xl border"
                    >
                      <Text style={{ color: theme.text }} className="text-sm font-bold">
                        Keep it
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancel}
                      disabled={cancelling}
                      style={{ backgroundColor: theme.error, opacity: cancelling ? 0.7 : 1 }}
                      className="flex-1 items-center justify-center py-3 rounded-xl"
                    >
                      {cancelling ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text className="text-white text-sm font-bold">Yes, cancel</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label }) {
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center mb-2">
      <MaterialIcons name={icon} size={16} color={theme.textMuted} />
      <Text style={{ color: theme.textSecondary }} className="text-xs ml-2 flex-1">
        {label}
      </Text>
    </View>
  );
}

// ─── APT-05 · CHECK-IN ───
export function CheckInScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { appointmentId } = route?.params || {};
  const METHODS = [
    { key: "qr", label: "QR Code", placeholder: "Code shown under your Digital Health ID QR" },
    { key: "medgram_id", label: "MedGram ID", placeholder: "e.g. MG-2847-9931-XK" },
    { key: "code", label: "Confirmation Code", placeholder: "From your booking confirmation" },
  ];
  const [method, setMethod] = useState("medgram_id");
  const [value, setValue] = useState("");
  const { status, error, run } = useAsyncAction((payload) => checkInAppointment(appointmentId, payload));

  const handleCheckIn = async () => {
    if (!value.trim()) {
      toast.error("Enter your check-in details.");
      return;
    }
    const { ok } = await run({ method, value: value.trim() });
    if (ok) {
      navigation.replace("AppointmentQueueTracker", { appointmentId });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Check In" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            <SectionLabel>Method</SectionLabel>
            <View className="flex-row flex-wrap">
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => {
                    setMethod(m.key);
                    setValue("");
                  }}
                  style={{
                    backgroundColor: method === m.key ? theme.primary : theme.surface,
                    borderColor: method === m.key ? theme.primary : theme.border,
                  }}
                  className="px-4 py-2 rounded-full border mr-2 mb-2"
                >
                  <Text style={{ color: method === m.key ? "#FFFFFF" : theme.text }} className="text-xs font-bold">
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="rounded-2xl p-5 border"
            >
              <FormField
                label={METHODS.find((m) => m.key === method)?.label}
                value={value}
                onChangeText={setValue}
                placeholder={METHODS.find((m) => m.key === method)?.placeholder}
                last
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCheckIn}
            disabled={status === "submitting"}
            style={{ backgroundColor: theme.primary, opacity: status === "submitting" ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            {status === "submitting" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-bold">Check In</Text>
            )}
          </TouchableOpacity>

          <View className={isWeb ? "max-w-[520px]" : ""}>
            <ActionResult
              status={status === "pending" ? "pending" : null}
              pendingTitle="Couldn't check in"
              pendingBody={
                error?.message ||
                "This appointment couldn't be checked into right now. Make sure it's an in-person appointment that hasn't already been checked into."
              }
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── APT-06 · LIVE QUEUE POSITION TRACKER ───
export function QueueTrackerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { appointmentId } = route?.params || {};

  const { data, isLoading, error } = useQuery({
    queryKey: ["queue-position", appointmentId],
    queryFn: () => getQueuePosition(appointmentId),
    enabled: !!appointmentId,
    refetchInterval: 15000,
    retry: false,
  });

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Queue Position" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : error || !data ? (
        <EmptyState
          icon="hourglass-empty"
          title="No queue position yet"
          description="You may not be checked in yet, or something went wrong loading your position. Pull down to refresh once you've checked in."
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ color: theme.textSecondary }} className="text-sm mb-2">
            Your position
          </Text>
          <Text style={{ color: theme.primary }} className="text-6xl font-extrabold">
            {data.position ?? "-"}
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-xs mt-4 text-center">
            Updates automatically every 15 seconds.
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── APT-02 · BOOK APPOINTMENT (direct / rebooking) ───
// Full doctor discovery is FindDoctorScreen/ConsultBookingScreen's job
// (fix-consultation-booking-flow) - this screen's real value is rebooking
// with a provider the patient has already met, without re-running discovery.
export function BookAppointmentScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const queryClient = useQueryClient();
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments"], queryFn: getAppointments });

  const knownProviders = useMemo(() => {
    const seen = new Map();
    for (const a of appointments) {
      if (!a.provider_id?._id && !a.provider_id?.username) continue;
      const key = a.provider_id._id || a.provider_id.username;
      if (!seen.has(key)) {
        seen.set(key, {
          id: a.provider_id._id,
          name: providerNameOf(a),
          type: a.appointment_type,
          provider_type: a.provider_type,
        });
      }
    }
    return Array.from(seen.values());
  }, [appointments]);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [appointmentType, setAppointmentType] = useState("Video");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async () => {
    if (!selectedProvider) {
      toast.error("Choose a provider to book with.");
      return;
    }
    if (!date.trim() || !time.trim()) {
      toast.error("Choose a date and time.");
      return;
    }
    const start = new Date(`${date.trim()}T${time.trim()}`);
    if (Number.isNaN(start.getTime())) {
      toast.error("Enter a valid date (YYYY-MM-DD) and time (HH:MM).");
      return;
    }
    const end = new Date(start.getTime() + 30 * 60000);
    setSubmitting(true);
    try {
      await createAppointment({
        provider_id: selectedProvider.id,
        provider_type: selectedProvider.provider_type,
        appointment_type: appointmentType,
        consultation_reason: reason.trim() || undefined,
        scheduled_start_time: start.toISOString(),
        scheduled_end_time: end.toISOString(),
      });
      toast.success("Appointment booked.");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      navigation.goBack();
    } catch (err) {
      toast.error(err.message || "Couldn't book this appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Book Appointment" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          {knownProviders.length === 0 ? (
            <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
              <EmptyState
                icon="person-search"
                title="No past providers yet"
                description="Book your first appointment by finding a doctor."
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("FindDoctor")}
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-2"
              >
                <Text className="text-white text-base font-bold">Find a Doctor</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className={isWeb ? "max-w-[520px]" : ""}>
              <SectionLabel>Provider</SectionLabel>
              {knownProviders.map((p) => (
                <TouchableOpacity
                  key={p.id || p.name}
                  onPress={() => setSelectedProvider(p)}
                  style={{
                    backgroundColor: selectedProvider?.id === p.id ? theme.primaryLight : theme.surface,
                    borderColor: selectedProvider?.id === p.id ? theme.primary : theme.border,
                  }}
                  className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                >
                  <MaterialIcons
                    name="account-circle"
                    size={28}
                    color={selectedProvider?.id === p.id ? theme.primary : theme.textMuted}
                  />
                  <Text style={{ color: theme.text }} className="text-sm font-bold ml-3">
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => navigation.navigate("FindDoctor")} className="mb-2">
                <Text style={{ color: theme.primary }} className="text-xs font-bold">
                  + Find a new doctor instead
                </Text>
              </TouchableOpacity>

              <SectionLabel>Type</SectionLabel>
              <View className="flex-row flex-wrap">
                {["Video", "Audio", "Chat", "Physical"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setAppointmentType(t)}
                    style={{
                      backgroundColor: appointmentType === t ? theme.primary : theme.surface,
                      borderColor: appointmentType === t ? theme.primary : theme.border,
                    }}
                    className="px-4 py-2 rounded-full border mr-2 mb-2"
                  >
                    <Text style={{ color: appointmentType === t ? "#FFFFFF" : theme.text }} className="text-xs font-bold">
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-5 border mt-2"
              >
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
                  </View>
                  <View className="flex-1">
                    <FormField label="Time" value={time} onChangeText={setTime} placeholder="HH:MM" />
                  </View>
                </View>
                <FormField
                  label="Reason (optional)"
                  value={reason}
                  onChangeText={setReason}
                  placeholder="What's this appointment for?"
                  multiline
                  last
                />
              </View>

              <TouchableOpacity
                onPress={handleBook}
                disabled={submitting}
                style={{ backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }}
                className="flex-row items-center justify-center py-4 rounded-xl mt-6"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">Book Appointment</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── APT-08 · [PRO] TODAY'S AGENDA ───
export function TodaysAgendaScreen({ navigation }) {
  const { theme } = useTheme();
  const { profile } = useUser();
  const isWeb = useIsWeb();
  const isPro = profile?.role && profile.role !== "patient";

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
    enabled: isPro,
  });

  const todaysAppointments = useMemo(() => {
    const today = new Date();
    const isToday = (d) => {
      const dt = new Date(d);
      return (
        dt.getFullYear() === today.getFullYear() &&
        dt.getMonth() === today.getMonth() &&
        dt.getDate() === today.getDate()
      );
    };
    return appointments
      .filter((a) => a.scheduled_start_time && isToday(a.scheduled_start_time))
      .sort((a, b) => new Date(a.scheduled_start_time) - new Date(b.scheduled_start_time));
  }, [appointments]);

  if (!isPro) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Today's Agenda" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState
          icon="lock"
          title="Professional access only"
          description="This view is available to verified healthcare professionals."
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Today's Agenda" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : todaysAppointments.length === 0 ? (
        <EmptyState icon="event-available" title="Nothing on today's agenda" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "max-w-[560px]" : ""}>
              {todaysAppointments.map((item) => {
                const statusColor = STATUS_COLORS[item.status] || theme.textMuted;
                return (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item._id })}
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    className="rounded-2xl p-4 border mb-3 mt-3"
                  >
                    <View className="flex-row justify-between items-start mb-1.5">
                      <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                        {schedulerNameOf(item)}
                      </Text>
                      <View style={{ backgroundColor: `${statusColor}20` }} className="px-2 py-0.5 rounded-full">
                        <Text style={{ color: statusColor }} className="text-[10px] font-bold uppercase">
                          {item.status?.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-xs">
                      {item.appointment_type} · {formatDate(item.scheduled_start_time)}
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
