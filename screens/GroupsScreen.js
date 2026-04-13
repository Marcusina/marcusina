import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function GroupsScreen({ onBackHome, onOpenConsult, onOpenProfile }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerRow}>
          <Image 
            source={require('../assets/marcusina.jpeg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerIconsRow}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <MaterialIcons name="search" size={24} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <MaterialIcons name="notifications-none" size={24} color="#4B5563" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.webScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.contentMaxWidth,
          isWeb && styles.webContentMaxWidth
        ]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Suggested Groups</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedRow}
          >
            {[
              { label: 'Diabetes Support', color: '#FED7AA', icon: 'favorite' },
              { label: 'Yoga Lovers', color: '#FDE68A', icon: 'self-improvement' },
              { label: 'Post-Partum', color: '#FBCFE8', icon: 'child-friendly' },
              { label: 'Nutrition', color: '#BBF7D0', icon: 'restaurant' },
            ].map((item) => (
              <View key={item.label} style={styles.suggestedItem}>
                <View
                  style={[styles.suggestedCircle, { backgroundColor: item.color }]}
                >
                  <MaterialIcons name={item.icon} size={24} color="#4B5563" />
                </View>
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

          <View style={[styles.communityList, isWeb && styles.webCommunityGrid]}>
            <CommunityCard
              badgeCount={12}
              title="Heart Health Heroes"
              members="1.2k members"
              meta="12 new posts"
              chipLabel="Hot Topic"
              chipText="Low sodium recipes for dinner"
              chipColor="#FEF3C7"
              icon="favorite"
              isWeb={isWeb}
            />
            <CommunityCard
              badgeCount={5}
              title="Daily Walkers"
              members="800 members"
              meta="5 new posts"
              chipLabel="Hot Topic"
              chipText="Who's out today for the morning walk?"
              chipColor="#FEE2E2"
              icon="directions-walk"
              isWeb={isWeb}
            />
            <CommunityCard
              title="Mindful Living"
              members="2.4k members"
              meta="Up to date"
              chipLabel="Latest"
              chipText="Morning meditation session starting soon"
              chipColor="#E0E7FF"
              icon="wb-sunny"
              isWeb={isWeb}
            />
            <CommunityCard
              title="Nutrition Hub"
              members="3.1k members"
              meta="2 new posts"
              chipLabel="Trending"
              chipText="Best plant-based protein sources"
              chipColor="#DCFCE7"
              icon="restaurant"
              isWeb={isWeb}
            />
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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
  icon,
  isWeb,
}) {
  return (
    <TouchableOpacity style={[styles.communityCard, isWeb && styles.webCommunityCard]}>
      <View style={styles.communityLeft}>
        <View style={styles.communityAvatar}>
          <MaterialIcons name={icon} size={20} color="#7C3AED" />
        </View>
      </View>
      <View style={styles.communityContent}>
        <View style={styles.communityTitleRow}>
          <Text style={styles.communityTitle} numberOfLines={1}>{title}</Text>
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
          <Text style={styles.communityChipText} numberOfLines={1}>{chipText}</Text>
        </View>
      </View>
      <MaterialIcons name="more-horiz" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    width: 100,
    height: 32,
  },
  headerIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginLeft: 16,
    padding: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  webScrollContent: {
    paddingBottom: 40,
  },
  contentMaxWidth: {
    paddingHorizontal: 20,
  },
  webContentMaxWidth: {
    paddingHorizontal: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  suggestedRow: {
    paddingBottom: 8,
  },
  suggestedItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  suggestedCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  suggestedLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  activePill: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activePillText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
  },
  communityList: {
    marginTop: 8,
    gap: 12,
  },
  webCommunityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  communityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  webCommunityCard: {
    width: '48%',
  },
  communityLeft: {
    marginRight: 16,
  },
  communityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityContent: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  communityBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  communityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  communityMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  communityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  communityChipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  communityChipText: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
      }
    }),
  },
});
