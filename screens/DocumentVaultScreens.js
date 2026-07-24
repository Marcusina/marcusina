import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { toast } from "../context/ToastContext";
import { useIsWeb, ScreenHeader, SectionLabel, EmptyState } from "../components/ScreenKit";

// ─── MOCK DATA ───
// Placeholder until the document vault API lands.
const MOCK_DOCUMENTS = [
  { id: "doc1", title: "National ID Card (Scan)", category: "ID Documents", date: "Jan 8, 2025", type: "image", sizeLabel: "1.2 MB" },
  { id: "doc2", title: "AXA Insurance Card (Front & Back)", category: "Insurance Cards", date: "Feb 2, 2025", type: "image", sizeLabel: "980 KB" },
  { id: "doc3", title: "Pre-MedGram Discharge Summary", category: "Scanned Records", date: "Nov 14, 2024", type: "pdf", sizeLabel: "2.4 MB" },
  { id: "doc4", title: "Old Vaccination Card", category: "Scanned Records", date: "Nov 14, 2024", type: "image", sizeLabel: "1.5 MB" },
  { id: "doc5", title: "Passport Bio Page", category: "ID Documents", date: "Mar 20, 2025", type: "pdf", sizeLabel: "800 KB" },
];

const CATEGORIES = ["Scanned Records", "ID Documents", "Insurance Cards"];
const CATEGORY_ICON = { "Scanned Records": "description", "ID Documents": "badge", "Insurance Cards": "shield" };

function getDocument(id) {
  return MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];
}

// ─── VLT-01 · DOCUMENT VAULT ───
export function DocumentVaultScreen({ navigation }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const hasDocs = MOCK_DOCUMENTS.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Document Vault"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => toast.info("Uploading a document is coming soon.")}>
            <MaterialIcons name="add" size={24} color={theme.text} />
          </TouchableOpacity>
        }
      />

      {!hasDocs ? (
        <EmptyState
          icon="folder-open"
          title="Your vault is empty"
          description="Store scanned paper records, ID documents, insurance cards, or old records from before MedGram."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className={isWeb ? "px-6" : "px-5"}>
            <TouchableOpacity
              onPress={() => toast.info("Uploading a document is coming soon.")}
              style={{ borderColor: theme.border }}
              className={`flex-row items-center justify-center py-4 rounded-xl border border-dashed mt-5 mb-2 ${isWeb ? "max-w-[560px]" : ""}`}
            >
              <MaterialIcons name="cloud-upload" size={20} color={theme.primary} />
              <Text style={{ color: theme.primary }} className="text-sm font-bold ml-2">
                Upload Document
              </Text>
            </TouchableOpacity>

            {CATEGORIES.map((category) => {
              const docs = MOCK_DOCUMENTS.filter((d) => d.category === category);
              if (docs.length === 0) return null;
              return (
                <View key={category} className={isWeb ? "max-w-[560px]" : ""}>
                  <SectionLabel>{category}</SectionLabel>
                  {docs.map((doc) => (
                    <TouchableOpacity
                      key={doc.id}
                      onPress={() => navigation.navigate("VaultDocumentDetail", { documentId: doc.id })}
                      activeOpacity={0.7}
                      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                      className="flex-row items-center rounded-2xl p-4 border mb-2.5"
                    >
                      <View style={{ backgroundColor: theme.primaryLight }} className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                        <MaterialIcons
                          name={doc.type === "pdf" ? "picture-as-pdf" : "image"}
                          size={20}
                          color={theme.primary}
                        />
                      </View>
                      <View className="flex-1 pr-2">
                        <Text style={{ color: theme.text }} className="text-sm font-bold" numberOfLines={1}>
                          {doc.title}
                        </Text>
                        <Text style={{ color: theme.textSecondary }} className="text-xs mt-0.5">
                          {doc.date} · {doc.sizeLabel}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── VLT-02 · DOCUMENT DETAIL/VIEWER ───
// Mirrors the viewer pattern used by PHR-06 (screens/HealthRecordScreens.js
// DocumentViewerScreen) - kept as its own lightweight component since vault
// documents aren't tied to a clinical record entry.
export function VaultDocumentDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const isWeb = useIsWeb();
  const doc = getDocument(route?.params?.documentId);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScreenHeader
        title="Document"
        onBack={() => navigation.goBack()}
        isWeb={isWeb}
        right={
          <TouchableOpacity onPress={() => toast.info("Download is coming soon.")}>
            <MaterialIcons name="download" size={22} color={theme.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className={isWeb ? "px-6" : "px-5"}>
          <View
            style={{ backgroundColor: theme.surfaceSubtle, borderColor: theme.border, minHeight: 420 }}
            className={`rounded-2xl border items-center justify-center mt-5 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name={doc.type === "pdf" ? "picture-as-pdf" : "image"} size={64} color={theme.textMuted} />
            <Text style={{ color: theme.text }} className="text-sm font-bold mt-4">
              {doc.title}
            </Text>
            <Text style={{ color: theme.textSecondary }} className="text-xs mt-1">
              {doc.category} · {doc.date} · {doc.sizeLabel}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => toast.info("Deleting documents is coming soon.")}
            style={{ backgroundColor: theme.errorLight }}
            className={`flex-row items-center justify-center py-3.5 rounded-xl mt-4 ${isWeb ? "max-w-[520px]" : ""}`}
          >
            <MaterialIcons name="delete-outline" size={18} color={theme.error} />
            <Text style={{ color: theme.error }} className="text-sm font-bold ml-2">
              Delete from Vault
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
