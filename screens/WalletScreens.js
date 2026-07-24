import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import {
  useIsWeb,
  ScreenHeader,
  SectionLabel,
  StatusBadge,
  EmptyState,
  FormField,
  NavRow,
} from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the wallet/payments API lands.
const CURRENCY = "₦";
function money(n) {
  return `${CURRENCY}${Math.abs(n).toLocaleString()}`;
}

const MOCK_WALLET = {
  balance: 128500,
  fundingSources: [
    { id: "w1", name: "MedGram Wallet", type: "wallet", icon: "account-balance-wallet", amount: 128500 },
    { id: "w2", name: "AXA Health Insurance", type: "insurance", icon: "shield", label: "Active coverage" },
    { id: "w3", name: "Acme Corp Benefit", type: "employer", icon: "work", amount: 50000 },
  ],
};

const MOCK_TRANSACTIONS = [
  { id: "t1", title: "Dr. Chidi Eze - Consultation", category: "Consultations", amount: -15000, date: "Jul 20, 2026", status: "completed" },
  { id: "t2", title: "Wallet Top-up (Card)", category: "Funding", amount: 50000, date: "Jul 18, 2026", status: "completed" },
  { id: "t3", title: "MedPlus Pharmacy", category: "Medications", amount: -8200, date: "Jul 15, 2026", status: "completed" },
  { id: "t4", title: "MedGram Diagnostics Lab", category: "Lab Tests", amount: -12000, date: "Jul 10, 2026", status: "completed" },
  { id: "t5", title: "Refund - Cancelled Appointment", category: "Refund", amount: 8000, date: "Jul 6, 2026", status: "processing" },
];

const MOCK_RECEIPTS = [
  { id: "r1", title: "Consultation - Dr. Chidi Eze", amount: 15000, date: "Jul 20, 2026", ref: "RCT-88213" },
  { id: "r2", title: "MedPlus Pharmacy Order", amount: 8200, date: "Jul 15, 2026", ref: "RCT-88190" },
  { id: "r3", title: "Lab Test - HbA1c Panel", amount: 12000, date: "Jul 10, 2026", ref: "RCT-88144" },
];

const MOCK_REFUNDS = [
  { id: "rf1", title: "Cancelled Appointment - Dr. Mark", amount: 8000, date: "Jul 5, 2026", status: "processing" },
  { id: "rf2", title: "Duplicate Charge - MedPlus Pharmacy", amount: 2400, date: "Jun 22, 2026", status: "completed" },
];

const MOCK_RECURRING = [
  { id: "sub1", title: "Care Plan - Diabetes Management", amount: 5000, frequency: "Monthly", nextDate: "Aug 1, 2026", active: true },
  { id: "sub2", title: "Family Wallet Auto-top-up", amount: 20000, frequency: "Monthly", nextDate: "Aug 5, 2026", active: false },
];

const MOCK_PAYMENT_METHODS = [
  { id: "pm1", type: "card", label: "Visa •••• 4242", isDefault: true, icon: "credit-card" },
  { id: "pm2", type: "bank", label: "GTBank •••• 1234", isDefault: false, icon: "account-balance" },
];

const MOCK_DEPENDENTS = [
  { id: "dep1", name: "Amaka Obi", relationship: "Spouse", allocated: 20000 },
  { id: "dep2", name: "Chidi Jr.", relationship: "Son", allocated: 10000 },
];

const MOCK_EARNINGS = {
  available: 340000,
  pending: 45000,
  payouts: [
    { id: "po1", amount: 150000, date: "Jul 1, 2026", status: "paid" },
    { id: "po2", amount: 120000, date: "Jun 1, 2026", status: "paid" },
  ],
};

const MOCK_EMERGENCY_FUND = {
  patientName: "Baby Zainab",
  reason: "Emergency cardiac surgery",
  goal: 500000,
  raised: 275000,
  contributors: 34,
  deadline: "Aug 15, 2026",
};

const MOCK_EXPENSE_CATEGORIES = [
  { category: "Consultations", amount: 45000, pct: 35, icon: "medical-services" },
  { category: "Medications", amount: 32000, pct: 25, icon: "medication" },
  { category: "Lab Tests", amount: 20000, pct: 16, icon: "science" },
  { category: "Insurance", amount: 31000, pct: 24, icon: "shield" },
];

const MOCK_MONTHLY_SPEND = [
  { month: "Feb", amount: 60000 },
  { month: "Mar", amount: 75000 },
  { month: "Apr", amount: 52000 },
  { month: "May", amount: 90000 },
  { month: "Jun", amount: 68000 },
  { month: "Jul", amount: 81000 },
];

// ─── PAY-01 · WALLET / HEALTH FUNDING HOME ───
export function WalletHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  const quickActions = [
    { key: "fund", icon: "add-card", label: "Fund", onPress: () => navigation.navigate("FundWallet") },
    { key: "send", icon: "send", label: "Send", onPress: () => navigation.navigate("WalletTransfer") },
    { key: "pay", icon: "qr-code-scanner", label: "Scan & Pay", onPress: () => navigation.navigate("QRPayment") },
    { key: "history", icon: "receipt-long", label: "History", onPress: () => navigation.navigate("TransactionHistory") },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Wallet" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.dark ? theme.surface : "#0F172A" }}
            className={`rounded-[28px] p-6 mt-5 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white/60 text-[11px] font-bold tracking-widest uppercase">
              Total Balance
            </Text>
            <Text className="text-white text-3xl font-extrabold mt-1.5">
              {money(MOCK_WALLET.balance)}
            </Text>
            <View className="flex-row mt-6 gap-3">
              {quickActions.map((a) => (
                <TouchableOpacity
                  key={a.key}
                  onPress={a.onPress}
                  className="flex-1 items-center bg-white/10 rounded-xl py-3"
                >
                  <MaterialIcons name={a.icon} size={20} color="#00C9A7" />
                  <Text className="text-white text-[10px] font-bold mt-1.5">{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <SectionLabel>Funding Sources</SectionLabel>
          <View className={isWeb ? "max-w-[480px]" : ""}>
            {MOCK_WALLET.fundingSources.map((source) => (
              <View
                key={source.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name={source.icon} size={20} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {source.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {source.label || "Available balance"}
                  </Text>
                </View>
                {source.amount !== undefined && (
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {money(source.amount)}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <SectionLabel>Manage</SectionLabel>
          <View className={isWeb ? "max-w-[480px]" : ""}>
            <NavRow icon="account-balance" label="Funding Sources" description="Employer, insurance & NGO programs" onPress={() => navigation.navigate("FundingSources")} />
            <NavRow icon="credit-card" label="Payment Methods" description="Cards & bank accounts" onPress={() => navigation.navigate("PaymentMethods")} />
            <NavRow icon="receipt" label="Receipts & Invoices" description="Download past receipts" onPress={() => navigation.navigate("ReceiptCenter")} />
            <NavRow icon="undo" label="Refund Status" description="Track pending refunds" onPress={() => navigation.navigate("RefundStatus")} />
            <NavRow icon="autorenew" label="Recurring Payments" description="Subscriptions & scheduled transfers" onPress={() => navigation.navigate("RecurringPayments")} />
            <NavRow icon="family-restroom" label="Family Wallet" description="Shared funding across dependents" onPress={() => navigation.navigate("FamilyWallet")} />
            <NavRow icon="volunteer-activism" label="Emergency Health Fund" description="Community-fundable urgent care" onPress={() => navigation.navigate("EmergencyFund")} />
            <NavRow icon="pie-chart" label="Spend Breakdown" description="Expenses by category" onPress={() => navigation.navigate("ExpenseCategories")} />
            <NavRow icon="insights" label="Payment Analytics" description="Spend trends over time" onPress={() => navigation.navigate("PaymentAnalytics")} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-02 · FUND WALLET ───
export function FundWalletScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const methods = [
    { key: "card", icon: "credit-card", label: "Debit/Credit Card" },
    { key: "bank", icon: "account-balance", label: "Bank Transfer" },
    { key: "mobile", icon: "smartphone", label: "Mobile Money" },
  ];
  const [method, setMethod] = useState("card");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFund = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`${money(value)} added via ${methods.find((m) => m.key === method).label}.`);
      navigation.goBack();
    }, 700);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Fund Wallet" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[480px]" : ""}>
            <FormField
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-2">
              Payment Method
            </Text>
            {methods.map((m) => {
              const isActive = method === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  style={{
                    backgroundColor: isActive ? theme.primaryLight : theme.surface,
                    borderColor: isActive ? theme.primary : theme.border,
                  }}
                  className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                >
                  <MaterialIcons name={m.icon} size={20} color={isActive ? theme.primary : theme.textSecondary} />
                  <Text
                    style={{ color: isActive ? theme.primary : theme.text }}
                    className="text-sm font-semibold ml-3 flex-1"
                  >
                    {m.label}
                  </Text>
                  {isActive && <MaterialIcons name="check-circle" size={18} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handleFund}
            disabled={submitting}
            style={{ backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">
              {submitting ? "Processing..." : "Add to Wallet"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-03 · MANAGE FUNDING SOURCES ───
export function FundingSourcesScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Funding Sources" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {MOCK_WALLET.fundingSources.map((source) => (
              <View
                key={source.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-3"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name={source.icon} size={22} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {source.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5 capitalize">
                    {source.type} {source.amount !== undefined ? `· ${money(source.amount)}` : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toast.info("Manage source details coming soon.")}>
                  <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("Linking a new funding source is coming soon.")}
              style={{ borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mt-2"
            >
              <MaterialIcons name="add" size={18} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">
                Link Employer Benefit, Insurance or NGO Program
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-04 · TRANSACTION HISTORY ───
export function TransactionHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filters = ["all", "in", "out"];
  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "in" && t.amount > 0) || (filter === "out" && t.amount < 0);
    return matchesQuery && matchesFilter;
  });

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Transaction History" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <View className={isWeb ? "px-6 pt-5" : "px-5 pt-5"}>
        <View
          style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
          className={`flex-row items-center rounded-xl px-3 border mb-3 ${isWeb ? "max-w-[520px]" : ""}`}
        >
          <MaterialIcons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={{ color: theme.text }}
            className="flex-1 py-2.5 px-2 text-sm"
            value={query}
            onChangeText={setQuery}
            placeholder="Search transactions"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        <View className={`flex-row gap-2 mb-4 ${isWeb ? "max-w-[520px]" : ""}`}>
          {filters.map((f) => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={{ backgroundColor: isActive ? theme.primary : theme.surfaceSubtle }}
                className="px-3.5 py-2 rounded-full"
              >
                <Text style={{ color: isActive ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold capitalize">
                  {f === "in" ? "Money In" : f === "out" ? "Money Out" : "All"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="receipt-long" title="No transactions found" description="Try a different search or filter." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={isWeb ? "max-w-[520px]" : ""}>
              {filtered.map((t) => (
                <View
                  key={t.id}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
                >
                  <View className="flex-1 pr-2">
                    <Text style={{ color: theme.text }} className="text-sm font-bold" numberOfLines={1}>
                      {t.title}
                    </Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                      {t.category} · {t.date}
                    </Text>
                  </View>
                  <Text
                    style={{ color: t.amount > 0 ? theme.success : theme.text }}
                    className="text-sm font-bold"
                  >
                    {t.amount > 0 ? "+" : "-"}
                    {money(t.amount)}
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

// ─── PAY-05 · RECEIPT & INVOICE CENTER ───
export function ReceiptCenterScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Receipts & Invoices" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {MOCK_RECEIPTS.map((r) => (
              <View
                key={r.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <View className="flex-1 pr-2">
                  <Text style={{ color: theme.text }} className="text-sm font-bold" numberOfLines={1}>
                    {r.title}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {r.ref} · {r.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text style={{ color: theme.text }} className="text-sm font-bold mb-1.5">
                    {money(r.amount)}
                  </Text>
                  <TouchableOpacity onPress={() => toast.info("Download is coming soon.")}>
                    <MaterialIcons name="download" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-06 · REFUND STATUS ───
export function RefundStatusScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Refund Status" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {MOCK_REFUNDS.map((r) => (
              <View
                key={r.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                    {r.title}
                  </Text>
                  <StatusBadge
                    label={r.status}
                    color={r.status === "completed" ? theme.success : theme.warning}
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text style={{ color: theme.textSecondary }} className="text-xs">
                    {r.date}
                  </Text>
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {money(r.amount)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-07 · RECURRING PAYMENTS ───
export function RecurringPaymentsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [items, setItems] = useState(MOCK_RECURRING);

  const toggle = (id) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, active: !it.active } : it)));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Recurring Payments" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {items.map((it) => (
              <View
                key={it.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text style={{ color: theme.text }} className="text-sm font-bold flex-1 pr-2">
                    {it.title}
                  </Text>
                  <Switch value={it.active} onValueChange={() => toggle(it.id)} trackColor={{ true: theme.primary }} />
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs">
                  {money(it.amount)} · {it.frequency} · Next {it.nextDate}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-08 · PAYMENT METHOD MANAGEMENT ───
export function PaymentMethodsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [methods, setMethods] = useState(MOCK_PAYMENT_METHODS);

  const setDefault = (id) =>
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Payment Methods" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {methods.map((m) => (
              <View
                key={m.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                  <MaterialIcons name={m.icon} size={22} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {m.label}
                  </Text>
                  {m.isDefault && (
                    <Text style={{ color: theme.primary }} className="text-[11px] font-bold mt-0.5">
                      Default
                    </Text>
                  )}
                </View>
                {!m.isDefault && (
                  <TouchableOpacity onPress={() => setDefault(m.id)}>
                    <Text style={{ color: theme.primary }} className="text-xs font-bold">
                      Make Default
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("Adding a new payment method is coming soon.")}
              style={{ borderColor: theme.border }}
              className="flex-row items-center justify-center py-3.5 rounded-xl border border-dashed mt-2"
            >
              <MaterialIcons name="add" size={18} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-1.5">
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-09 · FAMILY & CARE CIRCLE WALLET ───
export function FamilyWalletScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const totalAllocated = MOCK_DEPENDENTS.reduce((sum, d) => sum + d.allocated, 0);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Family Wallet" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-widest mb-1">
              Total Allocated to Family
            </Text>
            <Text style={{ color: theme.text }} className="text-2xl font-extrabold">
              {money(totalAllocated)}
            </Text>
          </View>

          <SectionLabel>Dependents</SectionLabel>
          <View className={isWeb ? "max-w-[520px]" : ""}>
            {MOCK_DEPENDENTS.map((d) => (
              <View
                key={d.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center rounded-2xl p-4 border mb-2.5"
              >
                <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Text style={{ color: theme.primary }} className="font-bold">
                    {d.name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {d.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                    {d.relationship}
                  </Text>
                </View>
                <Text style={{ color: theme.text }} className="text-sm font-bold">
                  {money(d.allocated)}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => toast.info("Allocating funds is coming soon.")}
              style={{ backgroundColor: theme.primary }}
              className="flex-row items-center justify-center py-3.5 rounded-xl mt-2"
            >
              <MaterialIcons name="add" size={18} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold ml-1.5">Allocate Funds</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-10 · [Pro] PROFESSIONAL EARNINGS & PAYOUTS ───
export function ProfessionalEarningsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Earnings & Payouts" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`flex-row gap-3 mt-5 ${isWeb ? "max-w-[560px]" : ""}`}>
            <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="flex-1 rounded-2xl p-4 border">
              <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase mb-1.5">
                Available
              </Text>
              <Text style={{ color: theme.text }} className="text-lg font-extrabold">
                {money(MOCK_EARNINGS.available)}
              </Text>
            </View>
            <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="flex-1 rounded-2xl p-4 border">
              <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold uppercase mb-1.5">
                Pending
              </Text>
              <Text style={{ color: theme.text }} className="text-lg font-extrabold">
                {money(MOCK_EARNINGS.pending)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toast.success("Payout requested.")}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Request Payout</Text>
          </TouchableOpacity>

          <SectionLabel>Payout History</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_EARNINGS.payouts.map((p) => (
              <View
                key={p.id}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <Text style={{ color: theme.textSecondary }} className="text-xs">
                  {p.date}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {money(p.amount)}
                  </Text>
                  <StatusBadge label={p.status} color={theme.success} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-11 · WALLET-TO-WALLET TRANSFER ───
export function WalletTransferScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [medgramId, setMedgramId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = () => {
    if (!medgramId.trim()) {
      toast.error("Enter a MedGram ID to send to.");
      return;
    }
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`${money(value)} sent to ${medgramId}.`);
      navigation.goBack();
    }, 700);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Send Money" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={`mt-5 ${isWeb ? "max-w-[480px]" : ""}`}>
            <FormField label="Recipient's MedGram ID" value={medgramId} onChangeText={setMedgramId} placeholder="MG-XXXX-XXXX-XX" />
            <FormField label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
            <FormField label="Note (optional)" value={note} onChangeText={setNote} placeholder="What's this for?" last />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={submitting}
            style={{ backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-6 ${isWeb ? "max-w-[480px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">
              {submitting ? "Sending..." : "Send Money"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-12 · QR PAYMENT (scan-to-pay) ───
export function QRPaymentScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [code, setCode] = useState("");

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Scan & Pay" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
            className={`rounded-2xl border items-center justify-center mt-5 ${isWeb ? "max-w-[420px]" : ""}`}
          >
            <View className="w-full aspect-square items-center justify-center">
              <MaterialIcons name="qr-code-scanner" size={72} color={theme.textMuted} />
              <Text style={{ color: theme.textSecondary }} className="text-sm mt-3">
                Point your camera at a MedGram QR code
              </Text>
            </View>
          </View>

          <Text style={{ color: theme.textMuted }} className={`text-center text-xs my-4 ${isWeb ? "max-w-[420px]" : ""}`}>
            or enter the merchant code manually
          </Text>

          <View className={isWeb ? "max-w-[420px]" : ""}>
            <FormField label="Merchant Code" value={code} onChangeText={setCode} placeholder="e.g. MG-PAY-4471" last />
          </View>

          <TouchableOpacity
            onPress={() => {
              if (!code.trim()) {
                toast.error("Scan a QR code or enter a merchant code.");
                return;
              }
              toast.success("Ready to confirm payment amount with merchant.");
            }}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[420px]" : ""}`}
          >
            <Text className="text-white text-base font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-13 · EMERGENCY HEALTH FUND ───
export function EmergencyFundScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { goal, raised, contributors, deadline, patientName, reason } = MOCK_EMERGENCY_FUND;
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Emergency Health Fund" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-lg font-extrabold mb-1">
              {patientName}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-sm mb-4">
              {reason}
            </Text>

            <View style={{ backgroundColor: theme.surfaceSubtle }} className="h-3 rounded-full overflow-hidden mb-2">
              <View style={{ backgroundColor: theme.primary, width: `${pct}%` }} className="h-full rounded-full" />
            </View>
            <View className="flex-row justify-between mb-4">
              <Text style={{ color: theme.text }} className="text-sm font-bold">
                {money(raised)} raised
              </Text>
              <Text style={{ color: theme.textSecondary }} className="text-sm">
                of {money(goal)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text style={{ color: theme.textMuted }} className="text-xs">
                {contributors} contributors
              </Text>
              <Text style={{ color: theme.textMuted }} className="text-xs">
                Ends {deadline}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toast.success("Thank you for contributing!")}
            style={{ backgroundColor: theme.primary }}
            className={`flex-row items-center justify-center py-4 rounded-xl mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="volunteer-activism" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-bold ml-2">Contribute Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toast.info("Starting a fund for someone else is coming soon.")}
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`flex-row items-center justify-center py-4 rounded-xl border mt-3 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.text }} className="text-sm font-bold">
              Start a Fund for Someone Else
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-14 · HEALTH EXPENSE CATEGORIES & SPEND BREAKDOWN ───
export function ExpenseCategoriesScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const total = MOCK_EXPENSE_CATEGORIES.reduce((sum, c) => sum + c.amount, 0);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Spend Breakdown" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-widest mb-1">
              Total This Month
            </Text>
            <Text style={{ color: theme.text }} className="text-2xl font-extrabold">
              {money(total)}
            </Text>
          </View>

          <View className={`mt-5 ${isWeb ? "max-w-[520px]" : ""}`}>
            {MOCK_EXPENSE_CATEGORIES.map((c) => (
              <View
                key={c.category}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="rounded-2xl p-4 border mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <MaterialIcons name={c.icon} size={18} color={theme.primary} />
                    <Text style={{ color: theme.text }} className="text-sm font-bold ml-2">
                      {c.category}
                    </Text>
                  </View>
                  <Text style={{ color: theme.text }} className="text-sm font-bold">
                    {money(c.amount)}
                  </Text>
                </View>
                <View style={{ backgroundColor: theme.surfaceSubtle }} className="h-2 rounded-full overflow-hidden">
                  <View style={{ backgroundColor: theme.primary, width: `${c.pct}%` }} className="h-full rounded-full" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── PAY-15 · PAYMENT ANALYTICS DASHBOARD ───
export function PaymentAnalyticsScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const maxAmount = Math.max(...MOCK_MONTHLY_SPEND.map((m) => m.amount));
  const current = MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1];
  const previous = MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 2];
  const changePct = Math.round(((current.amount - previous.amount) / previous.amount) * 100);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Payment Analytics" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <Text style={{ color: theme.textMuted }} className="text-[11px] font-bold uppercase tracking-widest mb-1">
              This Month
            </Text>
            <View className="flex-row items-center gap-2">
              <Text style={{ color: theme.text }} className="text-2xl font-extrabold">
                {money(current.amount)}
              </Text>
              <View
                className="flex-row items-center px-2 py-0.5 rounded-full"
                style={{ backgroundColor: changePct >= 0 ? theme.errorLight : theme.successLight }}
              >
                <MaterialIcons
                  name={changePct >= 0 ? "arrow-upward" : "arrow-downward"}
                  size={12}
                  color={changePct >= 0 ? theme.error : theme.success}
                />
                <Text
                  style={{ color: changePct >= 0 ? theme.error : theme.success }}
                  className="text-[11px] font-bold ml-0.5"
                >
                  {Math.abs(changePct)}%
                </Text>
              </View>
            </View>
            <Text style={{ color: theme.textSecondary }} className="text-xs mt-1">
              vs {money(previous.amount)} last month
            </Text>
          </View>

          <SectionLabel>6-Month Trend</SectionLabel>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border, height: 180 }}
            className={`flex-row items-end justify-between rounded-2xl p-5 border ${isWeb ? "max-w-[560px]" : ""}`}
          >
            {MOCK_MONTHLY_SPEND.map((m) => (
              <View key={m.month} className="items-center flex-1">
                <View
                  style={{
                    backgroundColor: m.month === current.month ? theme.primary : theme.primaryLight,
                    height: Math.max(8, (m.amount / maxAmount) * 110),
                    width: 18,
                    borderRadius: 6,
                  }}
                />
                <Text style={{ color: theme.textMuted }} className="text-[10px] font-bold mt-2">
                  {m.month}
                </Text>
              </View>
            ))}
          </View>

          <SectionLabel>Top Categories</SectionLabel>
          <View className={isWeb ? "max-w-[560px]" : ""}>
            {MOCK_EXPENSE_CATEGORIES.slice(0, 3).map((c) => (
              <View
                key={c.category}
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                className="flex-row items-center justify-between rounded-2xl p-4 border mb-2.5"
              >
                <Text style={{ color: theme.text }} className="text-sm font-semibold">
                  {c.category}
                </Text>
                <Text style={{ color: theme.textSecondary }} className="text-sm">
                  {c.pct}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
