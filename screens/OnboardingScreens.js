import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { getSupportedCurrencies, getOrganizationsList } from "../api/auth.api";
import { ProfilePhotoPicker } from "../components/ProfilePhotoPicker";
import { LocationPicker } from "../components/LocationPicker";
import { AvailabilitySchedulePicker } from "../components/AvailabilitySchedulePicker";
import { CodeInputRow } from "./AuthScreens";

export function SelectRoleScreen() {
  const { theme } = useTheme();
  const { submitRole } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const roles = [
    {
      label: "Patient",
      value: "patient",
      icon: "person",
      desc: "Access care, consults, and health media",
    },
    {
      label: "Doctor",
      value: "doctor",
      icon: "healing",
      desc: "Consult patients and share professional media",
    },
    {
      label: "Nurse",
      value: "nurse",
      icon: "local-hospital",
      desc: "Assist care teams and manage patient health",
    },
    {
      label: "Counselor",
      value: "counselor",
      icon: "psychology",
      desc: "Provide mental health and support consults",
    },
    {
      label: "Pharmacist",
      value: "pharmacist",
      icon: "medication",
      desc: "Manage prescriptions and drug validation",
    },
    {
      label: "Social Worker",
      value: "socialworker",
      icon: "groups",
      desc: "Community outreach and family support",
    },
  ];

  const handleProceed = async () => {
    if (!selectedRole) {
      showToast("Please select a role to proceed", "error");
      return;
    }
    setLoading(true);
    try {
      await submitRole(selectedRole);
      showToast("Role assigned successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to assign role", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-8">
            <Text
              className="text-[28px] font-extrabold mb-2"
              style={{ color: theme.text }}
            >
              Choose Your Role
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.textSecondary }}
            >
              Select the role that matches your profession or purpose on
              Medgram.
            </Text>
          </View>

          <View className="gap-4 mb-6">
            {roles.map((r) => (
              <TouchableOpacity
                key={r.value}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(r.value)}
                className="flex-row items-center p-4 rounded-[16px] border"
                style={{
                  backgroundColor: theme.surface,
                  borderColor:
                    selectedRole === r.value ? theme.primary : theme.border,
                }}
              >
                <View
                  className="w-[44px] h-[44px] rounded-[12px] items-center justify-center mr-4"
                  style={{ backgroundColor: theme.surfaceSubtle }}
                >
                  <MaterialIcons
                    name={r.icon}
                    size={24}
                    color={
                      selectedRole === r.value
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-bold mb-[2px]"
                    style={{ color: theme.text }}
                  >
                    {r.label}
                  </Text>
                  <Text
                    className="text-xs leading-4"
                    style={{ color: theme.textSecondary }}
                  >
                    {r.desc}
                  </Text>
                </View>
                {selectedRole === r.value && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={theme.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceed}
            disabled={loading}
            className="h-12 rounded-[12px] items-center justify-center mt-3"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-base font-bold">Proceed</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function CreateBasicProfileScreen() {
  const { theme } = useTheme();
  const { submitBasicProfile } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    date_of_birth: "",
    gender: "male",
    bio: "",
    location_country: "",
    location_state: "",
    location_city: "",
    location_address: "",
    postal_code: "",
    preferred_language: "English",
    timezone: "UTC",
  });

  const handleSubmit = async () => {
    if (
      !form.first_name ||
      !form.last_name ||
      !form.date_of_birth ||
      !form.location_country ||
      !form.location_address
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });
      if (photoFile) {
        if (photoFile.size > 2 * 1024 * 1024) {
          showToast("Profile photo size exceeds the 2MB limit", "error");
          setLoading(false);
          return;
        }
        formData.append("image", photoFile);
      }
      await submitBasicProfile(formData);
      showToast("Basic profile created!", "success");
    } catch (err) {
      showToast(err.message || "Failed to create profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-8">
            <Text
              className="text-[28px] font-extrabold mb-2"
              style={{ color: theme.text }}
            >
              Basic Profile Details
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.textSecondary }}
            >
              Complete your profile information to personalize your account.
            </Text>
          </View>

          <View className="mb-6">
            <ProfilePhotoPicker
              imageUri={photoUri}
              onImageSelected={(file, uri) => {
                if (file && file.size > 2 * 1024 * 1024) {
                  showToast("Profile photo size exceeds the 2MB limit", "error");
                  return;
                }
                setPhotoFile(file);
                setPhotoUri(uri);
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              First Name *
            </Text>
            <TextInput
              placeholder="John"
              placeholderTextColor={theme.textMuted}
              value={form.first_name}
              onChangeText={(t) => setForm({ ...form, first_name: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Last Name *
            </Text>
            <TextInput
              placeholder="Doe"
              placeholderTextColor={theme.textMuted}
              value={form.last_name}
              onChangeText={(t) => setForm({ ...form, last_name: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Middle Name
            </Text>
            <TextInput
              placeholder="Edward"
              placeholderTextColor={theme.textMuted}
              value={form.middle_name}
              onChangeText={(t) => setForm({ ...form, middle_name: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Date of Birth * (YYYY-MM-DD)
            </Text>
            <TextInput
              placeholder="1990-01-01"
              placeholderTextColor={theme.textMuted}
              value={form.date_of_birth}
              onChangeText={(t) => setForm({ ...form, date_of_birth: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Gender *
            </Text>
            <View className="flex-row gap-4">
              {["male", "female", "other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setForm({ ...form, gender: g })}
                  className="flex-grow p-3 rounded-[12px] border items-center justify-center"
                  style={{
                    backgroundColor:
                      form.gender === g ? theme.primaryLight : theme.surface,
                    borderColor:
                      form.gender === g ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    className="capitalize font-bold"
                    style={{
                      color: form.gender === g ? theme.primary : theme.text,
                    }}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Bio
            </Text>
            <TextInput
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.textMuted}
              value={form.bio}
              onChangeText={(t) => setForm({ ...form, bio: t })}
              multiline
              numberOfLines={3}
              className="h-20 rounded-[12px] border p-3 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Country *
            </Text>
            <TextInput
              placeholder="Nigeria"
              placeholderTextColor={theme.textMuted}
              value={form.location_country}
              onChangeText={(t) => setForm({ ...form, location_country: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              State *
            </Text>
            <TextInput
              placeholder="Lagos"
              placeholderTextColor={theme.textMuted}
              value={form.location_state}
              onChangeText={(t) => setForm({ ...form, location_state: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              City *
            </Text>
            <TextInput
              placeholder="Ikeja"
              placeholderTextColor={theme.textMuted}
              value={form.location_city}
              onChangeText={(t) => setForm({ ...form, location_city: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Address *
            </Text>
            <TextInput
              placeholder="12 Allen Avenue"
              placeholderTextColor={theme.textMuted}
              value={form.location_address}
              onChangeText={(t) => setForm({ ...form, location_address: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />

            <Text
              className="text-sm font-semibold mb-2 mt-4"
              style={{ color: theme.text }}
            >
              Postal Code *
            </Text>
            <TextInput
              placeholder="100001"
              placeholderTextColor={theme.textMuted}
              value={form.postal_code}
              onChangeText={(t) => setForm({ ...form, postal_code: t })}
              className="h-12 rounded-[12px] border px-4 text-[15px]"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
            className="h-12 rounded-[12px] items-center justify-center mt-3"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-base font-bold">
                Save Profile
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function VerifyPhoneScreen() {
  const { theme } = useTheme();
  const { submitPhone, confirmPhoneOtp, skipPhoneVerification } = useUser();
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber.startsWith("+")) {
      showToast(
        "Phone number must include country code starting with '+'",
        "error",
      );
      return;
    }
    setLoading(true);
    try {
      await submitPhone(phoneNumber);
      setOtpSent(true);
      showToast("Verification OTP sent!", "success");
    } catch (err) {
      showToast(err.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      showToast("OTP must be 6 digits", "error");
      return;
    }
    setLoading(true);
    try {
      await confirmPhoneOtp(otpCode);
      showToast("Phone number verified successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to verify OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-8">
            <Text
              className="text-[28px] font-extrabold mb-2"
              style={{ color: theme.text }}
            >
              Phone Verification
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.textSecondary }}
            >
              Verify your phone number with a secure SMS OTP.
            </Text>
          </View>

          {!otpSent ? (
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2 mt-4"
                style={{ color: theme.text }}
              >
                Phone Number (with Country Code) *
              </Text>
              <TextInput
                placeholder="+2348030000000"
                placeholderTextColor={theme.textMuted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                className="h-12 rounded-[12px] border px-4 text-[15px]"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendOtp}
                disabled={loading}
                className="h-12 rounded-[12px] items-center justify-center mt-4"
                style={{ backgroundColor: theme.primary }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Send Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-4 mt-4 text-center"
                style={{ color: theme.text }}
              >
                Enter 6-Digit OTP code *
              </Text>
              <CodeInputRow length={6} values={otp} onChange={setOtp} />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleVerifyOtp}
                disabled={loading}
                className="h-12 rounded-[12px] items-center justify-center mt-4"
                style={{ backgroundColor: theme.primary }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white text-base font-bold">
                    Verify OTP
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOtpSent(false)}
                className="mt-4 items-center"
              >
                <Text style={{ color: theme.primary }}>
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={skipPhoneVerification}
            className="mt-6 items-center py-2"
          >
            <Text
              style={{ color: theme.textSecondary }}
              className="text-sm font-semibold underline"
            >
              Skip phone verification for now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function CreateRoleSpecificProfileScreen() {
  const { theme } = useTheme();
  const { user, submitRoleSpecificProfile } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const role = user?.role?.role_type || "patient";

  // Fetch pharmacy organizations for pharmacists
  useEffect(() => {
    if (role === "pharmacist") {
      const fetchOrgs = async () => {
        setLoadingOrgs(true);
        try {
          const res = await getOrganizationsList();
          const orgList = res?.data || res || [];
          setOrganizations(orgList);
        } catch (err) {
          console.warn("Failed to fetch pharmacy organizations:", err);
        } finally {
          setLoadingOrgs(false);
        }
      };
      fetchOrgs();
    }
  }, [role]);

  // Initial forms state based on role
  const getInitialState = () => {
    const defaultScheduleTemplate = [
      {
        day_of_week: "sunday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "monday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "tuesday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "wednesday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "thursday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "friday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: true,
      },
      {
        day_of_week: "saturday",
        start_time: "09:00 AM",
        end_time: "05:00 PM",
        is_available: false,
      },
    ];

    const commonFields = {
      location_geometry: null,
    };

    const providerCommonFields = {
      ...commonFields,
      availability_schedule: defaultScheduleTemplate,
      languages_spoken: "",
    };

    if (role === "doctor") {
      return {
        ...providerCommonFields,
        specialization: "",
        subspecialties: "",
        license_number: "",
        license_issuing_authority: "",
        license_expiry_date: "",
        years_of_experience: "",
        consultation_fee: "",
        medical_school: "",
        consultation_duration_minutes: "30",
        residency_program: "",
        board_certifications: "",
        hospital_affiliations: "",
        accepts_insurance: true,
        insurance_networks: "",
        is_accepting_patients: true,
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
        swift_code: "",
        iban: "",
        currency: "",
      };
    } else if (role === "patient") {
      return {
        ...commonFields,
        blood_group: "",
        height_cm: "",
        weight_kg: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
      };
    } else if (role === "nurse") {
      return {
        ...providerCommonFields,
        license_number: "",
        license_type: "",
        license_expiry_date: "",
        years_of_experience: "",
        consultation_fee: "",
        consultation_duration_minutes: "30",
        specialization: "",
        certification: "",
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
        swift_code: "",
        iban: "",
        currency: "",
      };
    } else if (role === "counselor") {
      return {
        ...providerCommonFields,
        license_number: "",
        license_type: "",
        license_expiry_date: "",
        years_of_experience: "",
        consultation_fee: "",
        consultation_duration_minutes: "30",
        specialization: "",
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
        swift_code: "",
        iban: "",
        currency: "",
      };
    } else if (role === "pharmacist") {
      return {
        ...providerCommonFields,
        license_number: "",
        license_expiry_date: "",
        years_of_experience: "",
        pharmacy_organization_id: "",
        consultation_fee: "",
        consultation_duration_minutes: "30",
        specialization: "",
        certification: "",
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
        swift_code: "",
        iban: "",
        currency: "",
      };
    } else if (role === "socialworker") {
      return {
        ...providerCommonFields,
        license_number: "",
        license_type: "",
        license_expiry_date: "",
        years_of_experience: "",
        consultation_fee: "",
        consultation_duration_minutes: "30",
        area_of_focus: "",
        certification: "",
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
        swift_code: "",
        iban: "",
        currency: "",
      };
    } else if (role === "admin") {
      return {
        bank_name: "",
        bank_branch: "",
        account_name: "",
        account_number: "",
      };
    }
    return {};
  };

  const [form, setForm] = useState(getInitialState());

  // Reset form state on role changes
  useEffect(() => {
    setForm(getInitialState());
  }, [role]);

  const handleSubmit = async () => {
    setLoading(true);

    const convertTo24Hour = (timeStr) => {
      if (!timeStr) return "09:00";
      const cleanStr = timeStr.trim().toUpperCase();
      const isPM = cleanStr.includes("PM");
      const isAM = cleanStr.includes("AM");
      const match = cleanStr.match(/(\d+):(\d+)/);
      if (!match) return "09:00";
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      if (isPM || isAM) {
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
      const hoursStr = String(hours).padStart(2, "0");
      return `${hoursStr}:${minutes}`;
    };

    // Validate Location Picker
    if (role !== "admin") {
      if (
        !form.location_geometry ||
        !form.location_geometry.coordinates ||
        form.location_geometry.coordinates.length !== 2
      ) {
        showToast("Location map selection is required", "error");
        setLoading(false);
        return;
      }
    }

    // Role-specific validation
    if (role === "doctor") {
      if (
        !form.specialization ||
        !form.license_number ||
        !form.license_issuing_authority ||
        !form.license_expiry_date ||
        !form.years_of_experience ||
        !form.consultation_fee ||
        !form.medical_school ||
        !form.consultation_duration_minutes ||
        !form.bank_name ||
        !form.bank_branch ||
        !form.account_name ||
        !form.account_number
      ) {
        showToast(
          "Please fill all required doctor fields and bank details",
          "error",
        );
        setLoading(false);
        return;
      }
    } else if (role === "patient") {
      if (
        !form.blood_group ||
        !form.height_cm ||
        !form.weight_kg ||
        !form.emergency_contact_name ||
        !form.emergency_contact_phone ||
        !form.emergency_contact_relationship
      ) {
        showToast(
          "Please fill all required patient and emergency fields",
          "error",
        );
        setLoading(false);
        return;
      }
    } else if (role === "nurse") {
      if (
        !form.license_number ||
        !form.license_type ||
        !form.license_expiry_date ||
        !form.years_of_experience ||
        !form.consultation_fee ||
        !form.consultation_duration_minutes ||
        !form.specialization ||
        !form.certification ||
        !form.bank_name ||
        !form.bank_branch ||
        !form.account_name ||
        !form.account_number
      ) {
        showToast(
          "Please fill all required nurse fields and bank details",
          "error",
        );
        setLoading(false);
        return;
      }
    } else if (role === "counselor") {
      if (
        !form.license_number ||
        !form.license_type ||
        !form.license_expiry_date ||
        !form.years_of_experience ||
        !form.consultation_fee ||
        !form.consultation_duration_minutes ||
        !form.specialization ||
        !form.bank_name ||
        !form.bank_branch ||
        !form.account_name ||
        !form.account_number
      ) {
        showToast(
          "Please fill all required counselor fields and bank details",
          "error",
        );
        setLoading(false);
        return;
      }
    } else if (role === "pharmacist") {
      if (
        !form.license_number ||
        !form.license_expiry_date ||
        !form.years_of_experience ||
        !form.pharmacy_organization_id ||
        !form.consultation_fee ||
        !form.consultation_duration_minutes ||
        !form.specialization ||
        !form.certification ||
        !form.bank_name ||
        !form.bank_branch ||
        !form.account_name ||
        !form.account_number
      ) {
        showToast(
          "Please fill all pharmacist fields, select organization & bank details",
          "error",
        );
        setLoading(false);
        return;
      }
    } else if (role === "socialworker") {
      if (
        !form.license_number ||
        !form.license_type ||
        !form.license_expiry_date ||
        !form.years_of_experience ||
        !form.consultation_fee ||
        !form.consultation_duration_minutes ||
        !form.area_of_focus ||
        !form.certification ||
        !form.bank_name ||
        !form.bank_branch ||
        !form.account_name ||
        !form.account_number
      ) {
        showToast(
          "Please fill all required social worker fields and bank details",
          "error",
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Structure and cast the form inputs properly
      const castedForm = { ...form };

      if (user?._id) {
        castedForm.user_id = user._id;
      }

      // Structure arrays
      if (
        castedForm.languages_spoken &&
        role !== "patient" &&
        role !== "admin"
      ) {
        castedForm.languages_spoken = castedForm.languages_spoken
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (castedForm.subspecialties && role === "doctor") {
        castedForm.subspecialties = castedForm.subspecialties
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (castedForm.board_certifications && role === "doctor") {
        castedForm.board_certifications = castedForm.board_certifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (castedForm.hospital_affiliations && role === "doctor") {
        castedForm.hospital_affiliations = castedForm.hospital_affiliations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (castedForm.insurance_networks && role === "doctor") {
        castedForm.insurance_networks = castedForm.insurance_networks
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (
        castedForm.specialization &&
        (role === "counselor" || role === "nurse" || role === "pharmacist")
      ) {
        castedForm.specializations = castedForm.specialization
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        delete castedForm.specialization;
      }
      if (
        castedForm.certification &&
        (role === "nurse" || role === "pharmacist" || role === "socialworker")
      ) {
        castedForm.certifications = castedForm.certification
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        delete castedForm.certification;
      }
      if (castedForm.area_of_focus && role === "socialworker") {
        castedForm.areas_of_focus = castedForm.area_of_focus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        delete castedForm.area_of_focus;
      }

      // Convert numbers
      if (castedForm.years_of_experience) {
        castedForm.years_of_experience = parseInt(
          castedForm.years_of_experience,
          10,
        );
      }
      if (castedForm.consultation_fee) {
        castedForm.consultation_fee = parseFloat(castedForm.consultation_fee);
      }
      if (castedForm.consultation_duration_minutes) {
        castedForm.consultation_duration_minutes = parseInt(
          castedForm.consultation_duration_minutes,
          10,
        );
      }
      if (castedForm.height_cm) {
        castedForm.height_cm = parseFloat(castedForm.height_cm);
      }
      if (castedForm.weight_kg) {
        castedForm.weight_kg = parseFloat(castedForm.weight_kg);
      }

      if (castedForm.blood_group) {
        castedForm.blood_group = castedForm.blood_group.toUpperCase().trim();
      }

      // Format bank account and availability schedule for providers
      if (role !== "patient" && role !== "admin") {
        castedForm.bank_account = {
          bank_name: form.bank_name || "",
          bank_branch: form.bank_branch || "",
          account_name: form.account_name || "",
          account_number: form.account_number || "",
          swift_code: form.swift_code || "",
          iban: form.iban || "",
          currency: form.currency || "USD",
        };
        delete castedForm.bank_name;
        delete castedForm.bank_branch;
        delete castedForm.account_name;
        delete castedForm.account_number;
        delete castedForm.swift_code;
        delete castedForm.iban;
        delete castedForm.currency;

        // Keep the user configured availability schedule, formatting times to 24h format for the backend validation pattern
        castedForm.availability_schedule = (
          form.availability_schedule || []
        ).map((item) => ({
          ...item,
          start_time: convertTo24Hour(item.start_time),
          end_time: convertTo24Hour(item.end_time),
        }));
      }

      await submitRoleSpecificProfile(castedForm);
      showToast(`${role} profile created!`, "success");
    } catch (err) {
      showToast(err.message || "Failed to create profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-8">
            <Text
              className="text-[28px] font-extrabold mb-2 capitalize"
              style={{ color: theme.text }}
            >
              {role} Profile Details
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.textSecondary }}
            >
              Complete your role-specific profile details required by the
              system.
            </Text>
          </View>

          <View className="mb-6">
            {/* Interactive Location Geometry map picker */}
            {role !== "admin" && (
              <LocationPicker
                theme={theme}
                value={form.location_geometry}
                onChange={(loc) => setForm({ ...form, location_geometry: loc })}
              />
            )}

            {/* Interactive Availability Schedule Picker */}
            {role !== "patient" && role !== "admin" && (
              <AvailabilitySchedulePicker
                theme={theme}
                value={form.availability_schedule}
                onChange={(sched) =>
                  setForm({ ...form, availability_schedule: sched })
                }
              />
            )}

            {role === "doctor" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Specialization *
                </Text>
                <TextInput
                  placeholder="Cardiology"
                  placeholderTextColor={theme.textMuted}
                  value={form.specialization}
                  onChangeText={(t) => setForm({ ...form, specialization: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Specialties / Subspecialties (comma-separated)
                </Text>
                <TextInput
                  placeholder="Pediatrics, Oncology, etc."
                  placeholderTextColor={theme.textMuted}
                  value={form.subspecialties}
                  onChangeText={(t) => setForm({ ...form, subspecialties: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Medical School *
                </Text>
                <TextInput
                  placeholder="Lagos State College of Medicine"
                  placeholderTextColor={theme.textMuted}
                  value={form.medical_school}
                  onChangeText={(t) => setForm({ ...form, medical_school: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Number *
                </Text>
                <TextInput
                  placeholder="MD-12345"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_number}
                  onChangeText={(t) => setForm({ ...form, license_number: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Issuing Authority *
                </Text>
                <TextInput
                  placeholder="Medical Council"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_issuing_authority}
                  onChangeText={(t) =>
                    setForm({ ...form, license_issuing_authority: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Expiry Date * (YYYY-MM-DD)
                </Text>
                <TextInput
                  placeholder="2030-12-31"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_expiry_date}
                  onChangeText={(t) =>
                    setForm({ ...form, license_expiry_date: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Years of Experience *
                </Text>
                <TextInput
                  placeholder="5"
                  placeholderTextColor={theme.textMuted}
                  value={form.years_of_experience}
                  onChangeText={(t) =>
                    setForm({ ...form, years_of_experience: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Duration (Minutes) *
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_duration_minutes}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_duration_minutes: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Fee ($)*
                </Text>
                <TextInput
                  placeholder="50"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_fee}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_fee: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Residency Program
                </Text>
                <TextInput
                  placeholder="e.g. Internal Medicine Residency at LUTH"
                  placeholderTextColor={theme.textMuted}
                  value={form.residency_program}
                  onChangeText={(t) =>
                    setForm({ ...form, residency_program: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Board Certifications (comma-separated)
                </Text>
                <TextInput
                  placeholder="e.g. American Board of Internal Medicine, etc."
                  placeholderTextColor={theme.textMuted}
                  value={form.board_certifications}
                  onChangeText={(t) =>
                    setForm({ ...form, board_certifications: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Hospital Affiliations (comma-separated)
                </Text>
                <TextInput
                  placeholder="e.g. Lagos University Teaching Hospital"
                  placeholderTextColor={theme.textMuted}
                  value={form.hospital_affiliations}
                  onChangeText={(t) =>
                    setForm({ ...form, hospital_affiliations: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Insurance Networks (comma-separated)
                </Text>
                <TextInput
                  placeholder="e.g. Reliance HMO, AXA Mansard"
                  placeholderTextColor={theme.textMuted}
                  value={form.insurance_networks}
                  onChangeText={(t) =>
                    setForm({ ...form, insurance_networks: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <View
                  className="flex-row items-center justify-between mt-4 py-2 border-b"
                  style={{ borderColor: theme.border }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    Accepts Insurance
                  </Text>
                  <Switch
                    value={form.accepts_insurance}
                    onValueChange={(val) =>
                      setForm({ ...form, accepts_insurance: val })
                    }
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={form.accepts_insurance ? "#FFF" : "#F4F3F0"}
                  />
                </View>

                <View
                  className="flex-row items-center justify-between mt-2 py-2 border-b"
                  style={{ borderColor: theme.border }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    Accepting New Patients
                  </Text>
                  <Switch
                    value={form.is_accepting_patients}
                    onValueChange={(val) =>
                      setForm({ ...form, is_accepting_patients: val })
                    }
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={form.is_accepting_patients ? "#FFF" : "#F4F3F0"}
                  />
                </View>
              </>
            )}

            {role === "patient" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Blood Group * (A+, O+, AB-, etc.)
                </Text>
                <TextInput
                  placeholder="O+"
                  placeholderTextColor={theme.textMuted}
                  value={form.blood_group}
                  onChangeText={(t) => setForm({ ...form, blood_group: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Height (cm) *
                </Text>
                <TextInput
                  placeholder="175"
                  placeholderTextColor={theme.textMuted}
                  value={form.height_cm}
                  onChangeText={(t) => setForm({ ...form, height_cm: t })}
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Weight (kg) *
                </Text>
                <TextInput
                  placeholder="70"
                  placeholderTextColor={theme.textMuted}
                  value={form.weight_kg}
                  onChangeText={(t) => setForm({ ...form, weight_kg: t })}
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Emergency Contact Name *
                </Text>
                <TextInput
                  placeholder="Jane Doe"
                  placeholderTextColor={theme.textMuted}
                  value={form.emergency_contact_name}
                  onChangeText={(t) =>
                    setForm({ ...form, emergency_contact_name: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Emergency Contact Phone *
                </Text>
                <TextInput
                  placeholder="+2348030000000"
                  placeholderTextColor={theme.textMuted}
                  value={form.emergency_contact_phone}
                  onChangeText={(t) =>
                    setForm({ ...form, emergency_contact_phone: t })
                  }
                  keyboardType="phone-pad"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Relationship *
                </Text>
                <TextInput
                  placeholder="Spouse"
                  placeholderTextColor={theme.textMuted}
                  value={form.emergency_contact_relationship}
                  onChangeText={(t) =>
                    setForm({ ...form, emergency_contact_relationship: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {role === "nurse" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Number *
                </Text>
                <TextInput
                  placeholder="LIC-NUR-12345"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_number}
                  onChangeText={(t) => setForm({ ...form, license_number: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Type / Designation *
                </Text>
                <TextInput
                  placeholder="RN / Registered Nurse"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_type}
                  onChangeText={(t) => setForm({ ...form, license_type: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Expiry Date * (YYYY-MM-DD)
                </Text>
                <TextInput
                  placeholder="2032-12-31"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_expiry_date}
                  onChangeText={(t) =>
                    setForm({ ...form, license_expiry_date: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Years of Experience *
                </Text>
                <TextInput
                  placeholder="4"
                  placeholderTextColor={theme.textMuted}
                  value={form.years_of_experience}
                  onChangeText={(t) =>
                    setForm({ ...form, years_of_experience: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Specializations * (comma-separated)
                </Text>
                <TextInput
                  placeholder="Pediatric Care, General Nursing"
                  placeholderTextColor={theme.textMuted}
                  value={form.specialization}
                  onChangeText={(t) => setForm({ ...form, specialization: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Certifications * (comma-separated)
                </Text>
                <TextInput
                  placeholder="BLS, ACLS"
                  placeholderTextColor={theme.textMuted}
                  value={form.certification}
                  onChangeText={(t) => setForm({ ...form, certification: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Duration (Minutes) *
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_duration_minutes}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_duration_minutes: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Fee ($)*
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_fee}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_fee: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {role === "counselor" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Number *
                </Text>
                <TextInput
                  placeholder="LIC-CNS-12345"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_number}
                  onChangeText={(t) => setForm({ ...form, license_number: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Type / Designation *
                </Text>
                <TextInput
                  placeholder="Licensed Clinical Therapist"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_type}
                  onChangeText={(t) => setForm({ ...form, license_type: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Expiry Date * (YYYY-MM-DD)
                </Text>
                <TextInput
                  placeholder="2031-12-31"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_expiry_date}
                  onChangeText={(t) =>
                    setForm({ ...form, license_expiry_date: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Years of Experience *
                </Text>
                <TextInput
                  placeholder="6"
                  placeholderTextColor={theme.textMuted}
                  value={form.years_of_experience}
                  onChangeText={(t) =>
                    setForm({ ...form, years_of_experience: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Specializations * (comma-separated)
                </Text>
                <TextInput
                  placeholder="CBT, Relationship Therapy"
                  placeholderTextColor={theme.textMuted}
                  value={form.specialization}
                  onChangeText={(t) => setForm({ ...form, specialization: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Duration (Minutes) *
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_duration_minutes}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_duration_minutes: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Fee ($)*
                </Text>
                <TextInput
                  placeholder="40"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_fee}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_fee: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {role === "pharmacist" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Pharmacy Organization *
                </Text>
                {loadingOrgs ? (
                  <ActivityIndicator color={theme.primary} className="my-2" />
                ) : organizations.length > 0 ? (
                  <View className="gap-2 mb-2">
                    {organizations.map((org) => (
                      <TouchableOpacity
                        key={org._id}
                        onPress={() =>
                          setForm({
                            ...form,
                            pharmacy_organization_id: org._id,
                          })
                        }
                        className="p-3 rounded-[12px] border"
                        style={{
                          backgroundColor:
                            form.pharmacy_organization_id === org._id
                              ? theme.primaryLight
                              : theme.surface,
                          borderColor:
                            form.pharmacy_organization_id === org._id
                              ? theme.primary
                              : theme.border,
                        }}
                      >
                        <Text
                          className="font-bold text-sm"
                          style={{
                            color:
                              form.pharmacy_organization_id === org._id
                                ? theme.primary
                                : theme.text,
                          }}
                        >
                          {org.organization_name}
                        </Text>
                        <Text
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          {org.location_address}, {org.location_city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <Text
                      className="text-xs mt-1 font-semibold"
                      style={{ color: theme.textSecondary }}
                    >
                      Or type custom Organization ID manually:
                    </Text>
                    <TextInput
                      placeholder="e.g. 60f7..."
                      placeholderTextColor={theme.textMuted}
                      value={form.pharmacy_organization_id}
                      onChangeText={(t) =>
                        setForm({ ...form, pharmacy_organization_id: t })
                      }
                      className="h-12 rounded-[12px] border px-4 text-[15px]"
                      style={{
                        backgroundColor: theme.surface,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                    />
                  </View>
                ) : (
                  <TextInput
                    placeholder="Enter Pharmacy Organization ID (e.g. 65c...)"
                    placeholderTextColor={theme.textMuted}
                    value={form.pharmacy_organization_id}
                    onChangeText={(t) =>
                      setForm({ ...form, pharmacy_organization_id: t })
                    }
                    className="h-12 rounded-[12px] border px-4 text-[15px]"
                    style={{
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                  />
                )}

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Number *
                </Text>
                <TextInput
                  placeholder="LIC-PHR-12345"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_number}
                  onChangeText={(t) => setForm({ ...form, license_number: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Expiry Date * (YYYY-MM-DD)
                </Text>
                <TextInput
                  placeholder="2032-12-31"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_expiry_date}
                  onChangeText={(t) =>
                    setForm({ ...form, license_expiry_date: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Years of Experience *
                </Text>
                <TextInput
                  placeholder="3"
                  placeholderTextColor={theme.textMuted}
                  value={form.years_of_experience}
                  onChangeText={(t) =>
                    setForm({ ...form, years_of_experience: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Specializations * (comma-separated)
                </Text>
                <TextInput
                  placeholder="Clinical Pharmacy, Prescription Verification"
                  placeholderTextColor={theme.textMuted}
                  value={form.specialization}
                  onChangeText={(t) => setForm({ ...form, specialization: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Certifications * (comma-separated)
                </Text>
                <TextInput
                  placeholder="PharmD, RPh"
                  placeholderTextColor={theme.textMuted}
                  value={form.certification}
                  onChangeText={(t) => setForm({ ...form, certification: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Duration (Minutes) *
                </Text>
                <TextInput
                  placeholder="15"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_duration_minutes}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_duration_minutes: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Fee ($)*
                </Text>
                <TextInput
                  placeholder="20"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_fee}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_fee: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {role === "socialworker" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Number *
                </Text>
                <TextInput
                  placeholder="LIC-SWK-12345"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_number}
                  onChangeText={(t) => setForm({ ...form, license_number: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Type / Designation *
                </Text>
                <TextInput
                  placeholder="Licensed Clinical Social Worker"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_type}
                  onChangeText={(t) => setForm({ ...form, license_type: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  License Expiry Date * (YYYY-MM-DD)
                </Text>
                <TextInput
                  placeholder="2032-12-31"
                  placeholderTextColor={theme.textMuted}
                  value={form.license_expiry_date}
                  onChangeText={(t) =>
                    setForm({ ...form, license_expiry_date: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Years of Experience *
                </Text>
                <TextInput
                  placeholder="5"
                  placeholderTextColor={theme.textMuted}
                  value={form.years_of_experience}
                  onChangeText={(t) =>
                    setForm({ ...form, years_of_experience: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Areas of Focus * (comma-separated)
                </Text>
                <TextInput
                  placeholder="Family Counseling, Public Welfare"
                  placeholderTextColor={theme.textMuted}
                  value={form.area_of_focus}
                  onChangeText={(t) => setForm({ ...form, area_of_focus: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Certifications * (comma-separated)
                </Text>
                <TextInput
                  placeholder="LCSW, First Aid"
                  placeholderTextColor={theme.textMuted}
                  value={form.certification}
                  onChangeText={(t) => setForm({ ...form, certification: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Duration (Minutes) *
                </Text>
                <TextInput
                  placeholder="30"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_duration_minutes}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_duration_minutes: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Consultation Fee ($)*
                </Text>
                <TextInput
                  placeholder="25"
                  placeholderTextColor={theme.textMuted}
                  value={form.consultation_fee}
                  onChangeText={(t) =>
                    setForm({ ...form, consultation_fee: t })
                  }
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {/* Languages Spoken for all practitioners */}
            {role !== "patient" && role !== "admin" && (
              <>
                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Languages Spoken (comma-separated)
                </Text>
                <TextInput
                  placeholder="English, Spanish, French, etc."
                  placeholderTextColor={theme.textMuted}
                  value={form.languages_spoken}
                  onChangeText={(t) =>
                    setForm({ ...form, languages_spoken: t })
                  }
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}

            {/* Render Bank details for all practitioner roles (everyone except Patient/Admin) */}
            {role !== "patient" && role !== "admin" && (
              <>
                <Text
                  className="text-base font-bold mb-2 mt-6"
                  style={{ color: theme.text }}
                >
                  Payout Bank Account Details
                </Text>
                <Text
                  className="text-xs mb-2"
                  style={{ color: theme.textSecondary }}
                >
                  Required by Medgram for consultation fee disbursements.
                </Text>

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Bank Name *
                </Text>
                <TextInput
                  placeholder="Zenith Bank"
                  placeholderTextColor={theme.textMuted}
                  value={form.bank_name}
                  onChangeText={(t) => setForm({ ...form, bank_name: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Bank Branch *
                </Text>
                <TextInput
                  placeholder="Ikeja"
                  placeholderTextColor={theme.textMuted}
                  value={form.bank_branch}
                  onChangeText={(t) => setForm({ ...form, bank_branch: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Account Name *
                </Text>
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor={theme.textMuted}
                  value={form.account_name}
                  onChangeText={(t) => setForm({ ...form, account_name: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Account Number *
                </Text>
                <TextInput
                  placeholder="1012345678"
                  placeholderTextColor={theme.textMuted}
                  value={form.account_number}
                  onChangeText={(t) => setForm({ ...form, account_number: t })}
                  keyboardType="numeric"
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  SWIFT / BIC Code
                </Text>
                <TextInput
                  placeholder="e.g. ABBYGB2LXXX"
                  placeholderTextColor={theme.textMuted}
                  value={form.swift_code}
                  onChangeText={(t) => setForm({ ...form, swift_code: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  IBAN
                </Text>
                <TextInput
                  placeholder="e.g. GB29 WXYZ 6016 1331 9268 19"
                  placeholderTextColor={theme.textMuted}
                  value={form.iban}
                  onChangeText={(t) => setForm({ ...form, iban: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />

                <Text
                  className="text-sm font-semibold mb-2 mt-4"
                  style={{ color: theme.text }}
                >
                  Currency
                </Text>
                <TextInput
                  placeholder="USD"
                  placeholderTextColor={theme.textMuted}
                  value={form.currency}
                  onChangeText={(t) => setForm({ ...form, currency: t })}
                  className="h-12 rounded-[12px] border px-4 text-[15px]"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
            className="h-12 rounded-[12px] items-center justify-center mt-3"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-base font-bold">
                Complete Onboarding
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SelectCurrencyScreen() {
  const { theme } = useTheme();
  const { submitCurrency } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await getSupportedCurrencies();
        setCurrencies(res.currencies || {});
      } catch (err) {
        showToast(
          err.message || "Failed to load supported currencies",
          "error",
        );
      }
    };
    fetchCurrencies();
  }, []);

  const handleProceed = async () => {
    if (!selectedCurrency) {
      showToast("Please select a currency to proceed", "error");
      return;
    }
    setLoading(true);
    try {
      await submitCurrency(selectedCurrency);
      showToast("Currency set successfully!", "success");
    } catch (err) {
      showToast(err.message || "Failed to set currency", "error");
    } finally {
      setLoading(false);
    }
  };

  const currencyList = Object.values(currencies).filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView contentContainerClassName="px-6 pt-12 pb-8 flex-grow web:justify-center">
        <View className="w-full max-w-[480px] self-center">
          <View className="mb-8">
            <Text
              className="text-[28px] font-extrabold mb-2"
              style={{ color: theme.text }}
            >
              Select Currency
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.textSecondary }}
            >
              Select your preferred transaction currency. This will be used for
              consultation payments, billing, and payouts.
            </Text>
          </View>

          <TextInput
            placeholder="Search currencies..."
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            className="h-12 rounded-[12px] border px-4 text-[15px] mb-4"
            style={{
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
            }}
          />

          <View className="gap-3 mb-6">
            {currencyList.map((c) => (
              <TouchableOpacity
                key={c.code}
                activeOpacity={0.8}
                onPress={() => setSelectedCurrency(c.code)}
                className="flex-row items-center p-4 rounded-[16px] border"
                style={{
                  backgroundColor: theme.surface,
                  borderColor:
                    selectedCurrency === c.code ? theme.primary : theme.border,
                }}
              >
                <View
                  className="w-[44px] h-[44px] rounded-[12px] items-center justify-center mr-4"
                  style={{ backgroundColor: theme.surfaceSubtle }}
                >
                  <Text
                    className="text-[20px] font-bold"
                    style={{
                      color:
                        selectedCurrency === c.code
                          ? theme.primary
                          : theme.text,
                    }}
                  >
                    {c.symbol || c.code}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-bold mb-[2px]"
                    style={{ color: theme.text }}
                  >
                    {c.code}
                  </Text>
                  <Text
                    className="text-xs leading-4"
                    style={{ color: theme.textSecondary }}
                  >
                    {c.name || c.code}
                  </Text>
                </View>
                {selectedCurrency === c.code && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={theme.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceed}
            disabled={loading || !selectedCurrency}
            className="h-12 rounded-[12px] items-center justify-center mt-3"
            style={{
              backgroundColor: selectedCurrency ? theme.primary : theme.border,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white text-base font-bold">
                Set Active Currency
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
