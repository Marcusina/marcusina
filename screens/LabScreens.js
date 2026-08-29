import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Svg, { Polyline, Circle } from "react-native-svg";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, StatusBadge, EmptyState, FormField } from "../components/ScreenKit";
import { getLabOrders, getLabOrderById, getLabResultById, selectLabCenter, createLabOrder } from "../api/labs.api";
import { grantConsent } from "../api/consent.api";

const STATUS_COLORS = {
  pending: "#F59E0B",
  sample_collected: "#3B82F6",
  processing: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const STATUS_STEPS = ["pending", "sample_collected", "processing", "completed"];

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Placeholder directory until a real diagnostic-center directory endpoint
// lands - mirrors the degrade approach used for pharmacies in
// add-prescription-management's FindPharmacyScreen.
const MOCK_LAB_CENTERS = [
  { id: "lc1", name: "MedGram Diagnostics, Victoria Island", distance: "1.5 km" },
  { id: "lc2", name: "Lagos Central Lab", distance: "3.0 km" },
  { id: "lc3", name: "Greenview Imaging Center, Ikoyi", distance: "4.6 km" },
];

// ─── LAB-01 · MY LAB & IMAGING ORDERS ───
export function LabOrdersListScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["labOrders"],
    queryFn: getLabOrders,
  });

  const pending = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const completed = orders.filter((o) => o.status === "completed");

  const renderOrder = (order) => (
    <TouchableOpacity
      key={order._id}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate(order.status === "completed" ? "LabResultViewer" : "LabOrderStatus", { id: order._id })
      }
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      className={`rounded-2xl p-4 border mb-3 ${isWeb ? "w-[48.5%]" : "w-full"}`}
    >
      <View className="flex-row justify-between items-start mb-1.5">
        <Text style={{ color: theme.text }} className="text-[15px] font-bold flex-1 pr-2">
          {order.test_name || "Lab Order"}
        </Text>
        <StatusBadge label={order.status?.replace(/_/g, " ")} color={STATUS_COLORS[order.status] || theme.textMuted} />
      </View>
      <Text style={{ color: theme.textSecondary }} className="text-xs">
        {order.order_type || "Lab"} · {formatDate(order.ordered_at)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Lab & Imaging Orders" onBack={() => navigation.goBack()} isWeb={isWeb} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error || orders.length === 0 ? (
        <EmptyState
          icon="science"
          title="No lab or imaging orders yet"
          description={error?.message || "Orders your provider requests for you will show up here."}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            {pending.length > 0 && (
              <>
                <SectionLabel>Pending</SectionLabel>
                <View className={`${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>{pending.map(renderOrder)}</View>
              </>
            )}
            {completed.length > 0 && (
              <>
                <SectionLabel>Completed</SectionLabel>
                <View className={`${isWeb ? "flex-row flex-wrap gap-4" : ""}`}>{completed.map(renderOrder)}</View>
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── LAB-02/03 · ORDER STATUS TRACKER & LAB CENTER SELECTION ───
export function LabOrderStatusScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["labOrder", id],
    queryFn: () => getLabOrderById(id),
    enabled: !!id,
  });

  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const centerMutation = useMutation({
    mutationFn: (centerId) => selectLabCenter(id, centerId),
    onSuccess: (_, centerId) => {
      setSelectedCenterId(centerId);
      toast.success("Diagnostic center selected");
    },
    onError: (err) => toast.error(err.message || "Failed to select a center"),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Order Status" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState icon="error-outline" title="Couldn't load this order" description={error?.message} />
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const chosenCenterId = selectedCenterId || order.center_id;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Order Status" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-4 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-base font-extrabold mb-3">{order.test_name || "Lab Order"}</Text>
            <View className="flex-row items-center">
              {STATUS_STEPS.map((step, i) => {
                const reached = currentStepIndex >= 0 && i <= currentStepIndex;
                return (
                  <React.Fragment key={step}>
                    <View
                      style={{ backgroundColor: reached ? theme.primary : theme.surfaceSubtle }}
                      className="w-3 h-3 rounded-full"
                    />
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={{ backgroundColor: reached ? theme.primary : theme.border }} className="flex-1 h-[2px]" />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            <Text style={{ color: theme.textSecondary }} className="text-xs mt-2 capitalize">
              {order.status?.replace(/_/g, " ") || "Unknown status"}
            </Text>
          </View>

          {order.status !== "completed" && order.status !== "cancelled" && (
            <>
              <SectionLabel>Select a Diagnostic Center</SectionLabel>
              <View className={isWeb ? "max-w-[560px]" : ""}>
                {MOCK_LAB_CENTERS.map((center) => {
                  const active = chosenCenterId === center.id;
                  return (
                    <TouchableOpacity
                      key={center.id}
                      onPress={() => centerMutation.mutate(center.id)}
                      disabled={centerMutation.isPending}
                      style={{ backgroundColor: theme.surface, borderColor: active ? theme.primary : theme.border }}
                      className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                    >
                      <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                        <MaterialIcons name="local-hospital" size={20} color={theme.primary} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: theme.text }} className="text-sm font-bold">{center.name}</Text>
                        <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{center.distance}</Text>
                      </View>
                      {active ? <MaterialIcons name="check-circle" size={20} color={theme.primary} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── LAB-05 · RESULT TREND CHART (minimal line chart via react-native-svg) ───
function TrendChart({ points, theme }) {
  const width = 280;
  const height = 120;
  const padding = 16;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.value - min) / range) * (height - padding * 2);
    return { x, y };
  });
  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="rounded-2xl p-4 border items-center">
      <Svg width={width} height={height}>
        <Polyline points={polylinePoints} fill="none" stroke={theme.primary} strokeWidth={2} />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={3.5} fill={theme.primary} />
        ))}
      </Svg>
      <View className="flex-row justify-between w-full mt-2">
        <Text style={{ color: theme.textMuted }} className="text-[10px]">{formatDate(points[0].date)}</Text>
        <Text style={{ color: theme.textMuted }} className="text-[10px]">{formatDate(points[points.length - 1].date)}</Text>
      </View>
    </View>
  );
}

// ─── LAB-04/06 · RESULT VIEWER (incl. radiology) & SHARE WITH PROFESSIONAL ───
export function LabResultViewerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { id } = route?.params || {};

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["labResult", id],
    queryFn: () => getLabResultById(id),
    enabled: !!id,
  });

  // Trend needs at least 2 same-type results - draws from the full orders
  // list rather than a dedicated trend endpoint, since none exists yet.
  const { data: allOrders = [] } = useQuery({ queryKey: ["labOrders"], queryFn: getLabOrders });

  const [shareTarget, setShareTarget] = useState("");
  const [shared, setShared] = useState(false);
  const shareMutation = useMutation({
    mutationFn: () =>
      grantConsent({
        consent_type: "lab_result_share",
        resource_id: id,
        shared_with_name: shareTarget,
      }),
    onSuccess: () => {
      setShared(true);
      toast.success(`Shared with ${shareTarget}`);
    },
    onError: (err) => toast.error(err.message || "Failed to share result"),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !result) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Result" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState icon="error-outline" title="Couldn't load this result" description={error?.message} />
      </View>
    );
  }

  const trendPoints = allOrders
    .filter((o) => o.status === "completed" && o.test_name === result.test_name && typeof o.result_value === "number")
    .map((o) => ({ date: o.ordered_at, value: o.result_value }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={result.test_name || "Result"} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-4 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            {result.imaging_url || result.order_type === "radiology" ? (
              <View style={{ backgroundColor: theme.surfaceSubtle }} className="rounded-xl p-8 items-center mb-3">
                <MaterialIcons name="image" size={40} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="text-xs mt-2">Radiology image/report</Text>
              </View>
            ) : null}
            <Text style={{ color: theme.text }} className="text-sm leading-5">
              {result.summary || result.result_value != null ? `Result: ${result.result_value} ${result.unit || ""}`.trim() : "No summary available."}
            </Text>
            {result.reference_range ? (
              <Text style={{ color: theme.textMuted }} className="text-xs mt-2">Reference range: {result.reference_range}</Text>
            ) : null}
          </View>

          <SectionLabel>Trend</SectionLabel>
          {trendPoints.length >= 2 ? (
            <View className={isWeb ? "max-w-[560px]" : ""}>
              <TrendChart points={trendPoints} theme={theme} />
            </View>
          ) : (
            <View style={{ backgroundColor: theme.surfaceSubtle }} className={`rounded-2xl p-4 ${isWeb ? "max-w-[560px]" : ""}`}>
              <Text style={{ color: theme.textMuted }} className="text-xs">
                Not enough completed results of this test yet to show a trend.
              </Text>
            </View>
          )}

          <SectionLabel>Share with a Professional</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {shared ? (
              <View style={{ backgroundColor: theme.successLight }} className="flex-row items-center rounded-2xl p-4">
                <MaterialIcons name="check-circle" size={18} color={theme.success} />
                <Text style={{ color: theme.text }} className="text-sm font-semibold ml-2.5">Shared with {shareTarget}</Text>
              </View>
            ) : (
              <>
                <FormField label="Professional's name" value={shareTarget} onChangeText={setShareTarget} placeholder="e.g. Dr. Amara Nwosu" last />
                <TouchableOpacity
                  onPress={() => shareMutation.mutate()}
                  disabled={!shareTarget || shareMutation.isPending}
                  style={{ backgroundColor: shareTarget ? theme.primary : theme.surfaceSubtle }}
                  className="flex-row items-center justify-center py-3 rounded-xl mt-3"
                >
                  <Text style={{ color: shareTarget ? "#FFFFFF" : theme.textMuted }} className="text-sm font-bold">
                    {shareMutation.isPending ? "Sharing..." : "Share Result"}
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

// ─── LAB-07 · [Pro] ORDER LAB/RADIOLOGY TEST ───
export function CreateLabOrderScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { profile } = useUser();
  const { patientId = "demo-patient", patientName = "Patient" } = route?.params || {};

  const [testName, setTestName] = useState("");
  const [orderType, setOrderType] = useState("lab");
  const [notes, setNotes] = useState("");

  const isPro = !!(profile?.role && profile.role !== "patient");

  const createMutation = useMutation({
    mutationFn: () => createLabOrder(patientId, { test_name: testName, order_type: orderType, notes }),
    onSuccess: () => {
      toast.success("Lab order created");
      navigation.goBack();
    },
    onError: (err) => toast.error(err.message || "Failed to create lab order"),
  });

  if (!isPro) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <ScreenHeader title="Order Lab Test" onBack={() => navigation.goBack()} isWeb={isWeb} />
        <EmptyState
          icon="lock"
          title="Professional access required"
          description="This screen is only available to verified healthcare professionals."
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Order Lab Test" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <Text style={{ color: theme.textSecondary }} className="text-sm mt-5 mb-2">
            Ordering for <Text style={{ color: theme.text }} className="font-bold">{patientName}</Text>
          </Text>

          <View className={isWeb ? "max-w-[500px]" : ""}>
            <SectionLabel>Order Type</SectionLabel>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {["lab", "radiology"].map((t) => {
                const active = orderType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setOrderType(t)}
                    style={{ backgroundColor: active ? theme.primary : theme.surfaceSubtle }}
                    className="px-3.5 py-2 rounded-full"
                  >
                    <Text style={{ color: active ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold capitalize">{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FormField label="Test / Scan Name" value={testName} onChangeText={setTestName} placeholder="e.g. Complete Blood Count" />
            <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Clinical notes for the lab" multiline last />
          </View>

          <TouchableOpacity
            onPress={() => createMutation.mutate()}
            disabled={createMutation.isPending || !testName}
            style={{ backgroundColor: testName ? theme.primary : theme.surfaceSubtle }}
            className={`flex-row items-center justify-center py-3.5 rounded-xl mt-6 ${isWeb ? "max-w-[500px]" : ""}`}
          >
            <Text style={{ color: testName ? "#FFFFFF" : theme.textMuted }} className="text-sm font-bold">
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
