import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export function GroupsScreen({ onBackHome, onOpenConsult, onOpenProfile }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.brandText}>Marcusina</Text>
        <View style={styles.headerIconsRow}>
          <Text style={styles.headerIcon}>🔍</Text>
          <View style={styles.notificationWrapper}>
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </View>
          <Text style={styles.headerIcon}>☰</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Suggested Groups</Text>
          <Text style={styles.sectionAction}>View All</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedRow}
        >
          {[
            { label: 'Diabetes Support', color: '#FED7AA' },
            { label: 'Yoga Lovers', color: '#FDE68A' },
            { label: 'Post-Partum', color: '#FBCFE8' },
            { label: 'Nutrition', color: '#BBF7D0' },
          ].map((item) => (
            <View key={item.label} style={styles.suggestedItem}>
              <View
                style={[styles.suggestedCircle, { backgroundColor: item.color }]}
              />
              <Text style={styles.suggestedLabel}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>My Communities</Text>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>8 Active</Text>
          </View>
        </View>
        <View style={styles.communityList}>
          <CommunityCard
            badgeCount={12}
            title="Heart Health Heroes"
            members="1.2k members"
            meta="12 new posts"
            chipLabel="Hot Topic"
            chipText="Low sodium recipes for..."
            chipColor="#FDE68A"
          />
          <CommunityCard
            badgeCount={5}
            title="Daily Walkers"
            members="800 members"
            meta="5 new posts"
            chipLabel="Hot Topic"
            chipText="Who's out today for the..."
            chipColor="#FECACA"
          />
          <CommunityCard
            title="Mindful Living"
            members="2.4k members"
            meta="Up to date"
            chipLabel="Latest"
            chipText="Morning meditation..."
            chipColor="#E0E7FF"
          />
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={onBackHome}>
          <Text style={styles.bottomIcon}>🏠</Text>
          <Text style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem}>
          <Text style={[styles.bottomIcon, styles.bottomIconActive]}>👥</Text>
          <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={onOpenConsult}>
          <Text style={styles.bottomIcon}>💊</Text>
          <Text style={styles.bottomLabel}>Consult</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={onOpenProfile}>
          <Text style={styles.bottomIcon}>👤</Text>
          <Text style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function CommunityCard({
  badgeCount,
  title,
  members,
  meta,
  chipLabel,
  chipText,
  chipColor,
}) {
  return (
    <View style={styles.communityCard}>
      <View style={styles.communityLeft}>
        <View style={styles.communityAvatar}>
          <Text style={styles.communityAvatarIcon}>♥</Text>
        </View>
      </View>
      <View style={styles.communityContent}>
        <View style={styles.communityTitleRow}>
          <Text style={styles.communityTitle}>{title}</Text>
          {typeof badgeCount === 'number' && (
            <View style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.communityMeta}>
          {members} • {meta}
        </Text>
        <View style={[styles.communityChip, { backgroundColor: chipColor }]}>
          <Text style={styles.communityChipLabel}>{chipLabel}:</Text>
          <Text style={styles.communityChipText}>{chipText}</Text>
        </View>
      </View>
      <Text style={styles.communityMore}>⋯</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EC4899',
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#4B5563',
    marginLeft: 16,
  },
  notificationWrapper: {
    marginLeft: 16,
  },
  notificationDot: {
    position: 'absolute',
    right: -2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 96,
    paddingTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
  suggestedRow: {
    paddingVertical: 4,
    marginBottom: 16,
  },
  suggestedItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  suggestedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
  },
  suggestedLabel: {
    fontSize: 12,
    color: '#374151',
  },
  activePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F5F3FF',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  communityList: {
    marginTop: 8,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  communityLeft: {
    marginRight: 10,
  },
  communityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityAvatarIcon: {
    fontSize: 20,
  },
  communityContent: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
  },
  communityBadge: {
    marginLeft: 6,
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  communityBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  communityMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  communityChip: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityChipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 4,
  },
  communityChipText: {
    fontSize: 11,
    color: '#4B5563',
  },
  communityMore: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 8,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: -2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
  },
  bottomIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bottomIconActive: {
    color: '#7C3AED',
  },
  bottomLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});

