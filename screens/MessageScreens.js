import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, EmptyState } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the messaging API lands.
const INBOX_TABS = [
  { key: "direct", label: "Direct" },
  { key: "consultations", label: "Consultations" },
  { key: "careCircle", label: "Care Circle" },
  { key: "vendor", label: "Marketplace" },
  { key: "broadcasts", label: "Broadcasts" },
  { key: "ai", label: "AI" },
];

const MOCK_INBOX = {
  direct: [
    { id: "d1", name: "Amaka Obi", subtitle: "Spouse", lastMessage: "Did you take your meds today?", time: "9:14 AM", unread: 2 },
    { id: "d2", name: "Dr. Sarah Coker", subtitle: "Orthopedics", lastMessage: "Your MRI results look good.", time: "Yesterday", unread: 0 },
  ],
  consultations: [
    { id: "c1", name: "Dr. Chidi Eze", subtitle: "Video Consultation · Jul 15", lastMessage: "See you at 10:30 AM tomorrow.", time: "8:02 PM", unread: 1 },
    { id: "c2", name: "Dr. Elena Cruz", subtitle: "Chat Consultation · Closed", lastMessage: "Let me know if symptoms persist.", time: "Jul 12", unread: 0 },
  ],
  careCircle: [
    { id: "cc1", name: "Family Care Circle", subtitle: "4 members", lastMessage: "Chidi Jr: Mum's appointment moved to Friday", time: "11:40 AM", unread: 3 },
  ],
  vendor: [
    { id: "v1", name: "MedPlus Pharmacy", subtitle: "Order #ORD-4471", lastMessage: "Your refill is ready for pickup.", time: "2:15 PM", unread: 1 },
    { id: "v2", name: "MedGram Diagnostics Lab", subtitle: "Order #ORD-4390", lastMessage: "Results uploaded to your record.", time: "Jul 10", unread: 0 },
  ],
  broadcasts: [
    { id: "b1", name: "Lagos State Ministry of Health", subtitle: "Verified · Government Agency", lastMessage: "Free malaria screening this weekend at...", time: "Jul 19", unread: 1, verified: true },
    { id: "b2", name: "MedGram Clinic, Victoria Island", subtitle: "Verified Organization", lastMessage: "Holiday hours for the upcoming public holiday.", time: "Jul 14", unread: 0, verified: true },
  ],
  ai: [
    { id: "ai1", name: "MedGram AI Assistant", subtitle: "Decision support, not a diagnosis", lastMessage: "Based on what you described, I'd suggest...", time: "Today", unread: 0 },
  ],
};

const MOCK_THREAD_MESSAGES = [
  { id: "m1", fromMe: false, type: "text", content: "Hey! Just checking in - did you take your meds today?", time: "9:10 AM" },
  { id: "m2", fromMe: true, type: "text", content: "Yes, took them right after breakfast 👍", time: "9:12 AM" },
  { id: "m3", fromMe: false, type: "image", content: "photo", time: "9:13 AM" },
  { id: "m4", fromMe: false, type: "text", content: "Picked up your refill too, it's on the counter.", time: "9:14 AM" },
  { id: "m5", fromMe: true, type: "voice", content: "0:24", time: "9:15 AM" },
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── MSG-01 · UNIFIED INBOX ───
export function UnifiedInboxScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [activeTab, setActiveTab] = useState("direct");
  const conversations = MOCK_INBOX[activeTab] || [];

  const openConversation = (item) => {
    if (activeTab === "broadcasts") {
      navigation.navigate("BroadcastViewer", { broadcastId: item.id });
    } else if (activeTab === "vendor") {
      navigation.navigate("VendorChatThread", { orderId: item.id, name: item.name, subtitle: item.subtitle });
    } else if (activeTab === "ai") {
      navigation.navigate("AIChatHome");
    } else {
      navigation.navigate("ConversationThread", { threadId: item.id, name: item.name, subtitle: item.subtitle });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Messages"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => navigation.navigate("NewMessageComposer")}>
            <MaterialIcons name="edit-square" size={22} color={theme.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomColor: theme.border }}
        className="border-b flex-none"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {INBOX_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const unreadCount = (MOCK_INBOX[tab.key] || []).reduce((s, c) => s + (c.unread || 0), 0);
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{ backgroundColor: isActive ? theme.primary : theme.surfaceSubtle }}
              className="flex-row items-center px-4 py-2 rounded-full"
            >
              <Text style={{ color: isActive ? "#FFFFFF" : theme.textSecondary }} className="text-xs font-bold">
                {tab.label}
              </Text>
              {unreadCount > 0 && (
                <View
                  style={{ backgroundColor: isActive ? "#FFFFFF" : theme.primary }}
                  className="ml-1.5 w-4 h-4 rounded-full items-center justify-center"
                >
                  <Text style={{ color: isActive ? theme.primary : "#FFFFFF" }} className="text-[9px] font-extrabold">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {conversations.length === 0 ? (
        <EmptyState icon="forum" title="Nothing here yet" description="Conversations in this channel will show up here." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <View className={`mt-4 ${isWeb ? "max-w-[640px]" : ""}`}>
              {conversations.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => openConversation(c)}
                  activeOpacity={0.7}
                  style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                  className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                >
                  <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-full items-center justify-center mr-3">
                    <Text style={{ color: theme.primary }} className="text-sm font-bold">
                      {initials(c.name)}
                    </Text>
                  </View>
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center">
                      <Text style={{ color: theme.text }} className="text-sm font-bold" numberOfLines={1}>
                        {c.name}
                      </Text>
                      {c.verified && (
                        <MaterialIcons name="verified" size={14} color={theme.primary} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
                      {c.subtitle}
                    </Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs mt-1" numberOfLines={1}>
                      {c.lastMessage}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: theme.textMuted }} className="text-[11px] mb-1.5">
                      {c.time}
                    </Text>
                    {c.unread > 0 && (
                      <View style={{ backgroundColor: theme.primary }} className="w-5 h-5 rounded-full items-center justify-center">
                        <Text className="text-white text-[10px] font-extrabold">{c.unread}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function MessageBubble({ message, theme }) {
  const bubbleColor = message.fromMe ? theme.primary : theme.surface;
  const textColor = message.fromMe ? "#FFFFFF" : theme.text;
  return (
    <View className={`mb-3 ${message.fromMe ? "items-end" : "items-start"}`}>
      <View
        style={{ backgroundColor: bubbleColor, borderColor: message.fromMe ? bubbleColor : theme.border }}
        className="max-w-[78%] rounded-2xl px-4 py-3 border"
      >
        {message.type === "text" && (
          <Text style={{ color: textColor }} className="text-sm leading-5">
            {message.content}
          </Text>
        )}
        {message.type === "image" && (
          <View className="items-center py-4 px-8">
            <MaterialIcons name="image" size={32} color={message.fromMe ? "#FFFFFF" : theme.textMuted} />
            <Text style={{ color: textColor }} className="text-xs mt-1.5">Photo</Text>
          </View>
        )}
        {message.type === "voice" && (
          <View className="flex-row items-center">
            <MaterialIcons name="play-circle-fill" size={26} color={textColor} />
            <View className="flex-1 h-[3px] mx-2 rounded-full" style={{ backgroundColor: message.fromMe ? "rgba(255,255,255,0.4)" : theme.border }} />
            <Text style={{ color: textColor }} className="text-xs">{message.content}</Text>
          </View>
        )}
        {message.type === "document" && (
          <View className="flex-row items-center">
            <MaterialIcons name="description" size={20} color={textColor} />
            <Text style={{ color: textColor }} className="text-xs ml-2">{message.content}</Text>
          </View>
        )}
      </View>
      <Text style={{ color: theme.textMuted }} className="text-[10px] mt-1">
        {message.time}
      </Text>
    </View>
  );
}

function ChatComposerBar({ value, onChangeText, onSend, onAttach, theme }) {
  return (
    <View
      style={{ backgroundColor: theme.surface, borderTopColor: theme.border }}
      className="flex-row items-center px-3 py-2.5 border-t gap-2"
    >
      <TouchableOpacity onPress={onAttach} className="p-2">
        <MaterialIcons name="attach-file" size={22} color={theme.textSecondary} />
      </TouchableOpacity>
      <TextInput
        style={{ backgroundColor: theme.surfaceSubtle, color: theme.text }}
        className="flex-1 rounded-full px-4 py-2.5 text-sm"
        value={value}
        onChangeText={onChangeText}
        placeholder="Type a message"
        placeholderTextColor={theme.textMuted}
        multiline
      />
      <TouchableOpacity
        onPress={onSend}
        style={{ backgroundColor: theme.primary }}
        className="w-9 h-9 rounded-full items-center justify-center"
      >
        <MaterialIcons name="arrow-upward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── MSG-02 · CONVERSATION THREAD ───
export function ConversationThreadScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { name = "Conversation", subtitle } = route?.params || {};
  const [messages, setMessages] = useState(MOCK_THREAD_MESSAGES);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, fromMe: true, type: "text", content: draft.trim(), time: "Now" },
    ]);
    setDraft("");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={name} onBack={() => navigation.goBack()} isWeb={isWeb} />
      {subtitle && (
        <View className={isWeb ? "px-6 pt-3" : "px-5 pt-3"}>
          <Text style={{ color: theme.textSecondary }} className="text-xs">{subtitle}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} theme={theme} />
            ))}
          </View>
        </View>
      </ScrollView>
      <ChatComposerBar
        value={draft}
        onChangeText={setDraft}
        onSend={handleSend}
        onAttach={() => toast.info("Attachments are coming soon.")}
        theme={theme}
      />
    </View>
  );
}

// ─── MSG-03 · NEW MESSAGE COMPOSER ───
const MOCK_CONTACTS = [
  { id: "p1", name: "Amaka Obi", subtitle: "Care Circle · Spouse" },
  { id: "p2", name: "Dr. Chidi Eze", subtitle: "General Physician" },
  { id: "p3", name: "Dr. Amara Nwosu", subtitle: "Dermatology" },
  { id: "p4", name: "Family Care Circle", subtitle: "Group · 4 members" },
];

export function NewMessageComposerScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState("");

  const filtered = MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const handleStart = () => {
    if (!selected) {
      toast.error("Choose who you'd like to message.");
      return;
    }
    navigation.replace("ConversationThread", {
      threadId: `new-${selected.id}`,
      name: selected.name,
      subtitle: selected.subtitle,
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="New Message" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <View className={isWeb ? "px-6 pt-5" : "px-5 pt-5"}>
        <View
          style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border }}
          className={`flex-row items-center rounded-xl px-3 border mb-4 ${isWeb ? "max-w-[480px]" : ""}`}
        >
          <MaterialIcons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={{ color: theme.text }}
            className="flex-1 py-2.5 px-2 text-sm"
            value={query}
            onChangeText={setQuery}
            placeholder="Search people or groups"
            placeholderTextColor={theme.textMuted}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[480px]" : ""}>
            {filtered.map((c) => {
              const isActive = selected?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelected(c)}
                  style={{
                    backgroundColor: isActive ? theme.primaryLight : theme.surface,
                    borderColor: isActive ? theme.primary : theme.border,
                  }}
                  className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                >
                  <View style={{ backgroundColor: theme.primaryLight }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Text style={{ color: theme.primary }} className="text-sm font-bold">
                      {initials(c.name)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text }} className="text-sm font-bold">{c.name}</Text>
                    <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">{c.subtitle}</Text>
                  </View>
                  {isActive && <MaterialIcons name="check-circle" size={20} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className={isWeb ? "px-6 pb-6" : "px-5 pb-6"}>
        <View className={isWeb ? "max-w-[480px]" : ""}>
          <TextInput
            style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            className="rounded-xl px-4 py-3 border text-[15px] h-20 mb-3"
            value={draft}
            onChangeText={setDraft}
            placeholder="Write your first message..."
            placeholderTextColor={theme.textMuted}
            multiline
          />
          <TouchableOpacity
            onPress={handleStart}
            style={{ backgroundColor: theme.primary }}
            className="flex-row items-center justify-center py-4 rounded-xl"
          >
            <Text className="text-white text-base font-bold">Start Conversation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── MSG-04 · BROADCAST / ANNOUNCEMENT VIEWER ───
function getBroadcast(id) {
  return MOCK_INBOX.broadcasts.find((b) => b.id === id) || MOCK_INBOX.broadcasts[0];
}

export function BroadcastViewerScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const broadcast = getBroadcast(route?.params?.broadcastId);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title="Announcement" onBack={() => navigation.goBack()} isWeb={isWeb} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className={`rounded-2xl p-5 border mt-5 ${isWeb ? "max-w-[560px]" : ""}`}
          >
            <View className="flex-row items-center mb-3">
              <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="campaign" size={22} color={theme.primary} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{broadcast.name}</Text>
                  <MaterialIcons name="verified" size={14} color={theme.primary} style={{ marginLeft: 4 }} />
                </View>
                <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                  {broadcast.subtitle} · {broadcast.time}
                </Text>
              </View>
            </View>
            <Text style={{ color: theme.text }} className="text-sm leading-6">
              {broadcast.lastMessage} Full details and registration information will be shared
              closer to the date. This is a read-only announcement - replies aren't supported for
              broadcasts.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── MSG-05 · MARKETPLACE / VENDOR CHAT THREAD ───
export function VendorChatThreadScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const { name = "Vendor", orderId = "ORD-0000" } = route?.params || {};
  const [messages, setMessages] = useState(MOCK_THREAD_MESSAGES.slice(0, 3));
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, fromMe: true, type: "text", content: draft.trim(), time: "Now" },
    ]);
    setDraft("");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader title={name} onBack={() => navigation.goBack()} isWeb={isWeb} />
      <View className={isWeb ? "px-6 pt-3" : "px-5 pt-3"}>
        <View
          style={{ backgroundColor: theme.primaryLight }}
          className={`flex-row items-center rounded-xl p-3 ${isWeb ? "max-w-[640px]" : ""}`}
        >
          <MaterialIcons name="local-shipping" size={18} color={theme.primary} />
          <Text style={{ color: theme.text }} className="text-xs ml-2">
            Order {orderId} · Chat is order-specific and archives when the order closes.
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View className={isWeb ? "max-w-[640px]" : ""}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} theme={theme} />
            ))}
          </View>
        </View>
      </ScrollView>
      <ChatComposerBar
        value={draft}
        onChangeText={setDraft}
        onSend={handleSend}
        onAttach={() => toast.info("Attachments are coming soon.")}
        theme={theme}
      />
    </View>
  );
}

// ─── MSG-06 · VOICE/VIDEO CALL UI ───
export function CallScreen({ navigation, route }) {
  const { name = "Amaka Obi", callType = "voice" } = route?.params || {};
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [videoOn, setVideoOn] = useState(callType === "video");
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <View className="flex-1 items-center justify-between py-16" style={{ backgroundColor: "#0F172A" }}>
      <View className="items-center mt-10">
        <Text className="text-white/60 text-sm mb-1">{callType === "video" ? "Video Call" : "Voice Call"}</Text>
        <Text className="text-white text-xl font-bold">{formatTime(seconds)}</Text>
      </View>

      <View className="items-center">
        <View className="w-28 h-28 rounded-full bg-white/10 items-center justify-center mb-5">
          <Text className="text-white text-3xl font-extrabold">{initials(name)}</Text>
        </View>
        <Text className="text-white text-2xl font-extrabold">{name}</Text>
        <Text className="text-white/60 text-sm mt-1">
          {videoOn ? "Camera on" : "Connected"}
        </Text>
      </View>

      <View className="flex-row items-center gap-5">
        <TouchableOpacity
          onPress={() => setMuted(!muted)}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: muted ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}
        >
          <MaterialIcons name={muted ? "mic-off" : "mic"} size={24} color={muted ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
        {callType === "video" && (
          <TouchableOpacity
            onPress={() => setVideoOn(!videoOn)}
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: !videoOn ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}
          >
            <MaterialIcons name={videoOn ? "videocam" : "videocam-off"} size={24} color={!videoOn ? "#0F172A" : "#FFFFFF"} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: "#EF4444" }}
        >
          <MaterialIcons name="call-end" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSpeaker(!speaker)}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: speaker ? "#FFFFFF" : "rgba(255,255,255,0.15)" }}
        >
          <MaterialIcons name="volume-up" size={24} color={speaker ? "#0F172A" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
