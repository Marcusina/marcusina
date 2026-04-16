import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCommunities, getMyCommunities, joinCommunity } from '../api/community.api';
import { useTheme } from '../context/ThemeContext';

export function GroupsScreen({ token, onBackHome, onOpenConsult, onOpenProfile }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchCommunities = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [allRes, myRes] = await Promise.all([
        getCommunities(token, { limit: 10 }),
        getMyCommunities(token)
      ]);
      
      const myIds = new Set(myRes.map(c => c._id));
      const suggestions = (allRes.data || []).filter(c => !myIds.has(c._id));
      
      setSuggestedGroups(suggestions);
      setMyCommunities(myRes);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      fetchCommunities();
      return;
    }
    
    try {
      setIsSearching(true);
      const res = await getCommunities(token, { search: text });
      setSuggestedGroups(res.data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinGroup = async (communityId) => {
    try {
      await joinCommunity(token, communityId);
      Alert.alert('Success', 'Joined community successfully!');
      fetchCommunities();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to join community');
    }
  };

  const handleCreateGroup = () => {
    Alert.alert('Coming Soon', 'Group creation will be available in the next update.');
  };

  const getCommunityIcon = (type) => {
    switch (type) {
      case 'condition_support': return 'favorite';
      case 'wellness': return 'self-improvement';
      case 'mental_health': return 'psychology';
      case 'caregivers': return 'child-friendly';
      case 'local_health': return 'location-on';
      default: return 'group';
    }
  };

  const getCommunityColor = (type) => {
    switch (type) {
      case 'condition_support': return '#FEE2E2';
      case 'wellness': return '#DCFCE7';
      case 'mental_health': return '#E0E7FF';
      case 'caregivers': return '#FCE7F3';
      case 'local_health': return '#FEF3C7';
      default: return '#F3F4F6';
    }
  };

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerActionsRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onOpenProfile}>
            <MaterialIcons name="person-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialIcons name="notifications-none" size={24} color={theme.textSecondary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
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
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search communities..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#9CA3AF"
              />
              {isSearching && <ActivityIndicator size="small" color="#7C3AED" />}
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Suggested Groups</Text>
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.sectionAction}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedRow}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#7C3AED" style={{ padding: 20 }} />
            ) : suggestedGroups.length > 0 ? (
              suggestedGroups.map((item) => (
                <TouchableOpacity 
                  key={item._id} 
                  style={styles.suggestedItem}
                  onPress={() => handleJoinGroup(item._id)}
                >
                  <View
                    style={[styles.suggestedCircle, { backgroundColor: getCommunityColor(item.community_type) }]}
                  >
                    <MaterialIcons name={getCommunityIcon(item.community_type)} size={24} color="#7C3AED" />
                  </View>
                  <Text style={styles.suggestedLabel} numberOfLines={1}>{item.community_name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No suggestions found</Text>
            )}
          </ScrollView>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Communities</Text>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>{myCommunities.length} Joined</Text>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
          ) : myCommunities.length > 0 ? (
            <View style={[styles.communityList, isWeb && styles.webCommunityGrid]}>
              {myCommunities.map((community) => (
                <CommunityCard
                  key={community._id}
                  title={community.community_name}
                  members={`${community.member_count} members`}
                  meta={community.post_count > 0 ? `${community.post_count} posts` : 'Up to date'}
                  chipLabel="Latest"
                  chipText={community.latest_post || 'No posts yet'}
                  chipColor={getCommunityColor(community.community_type)}
                  icon={getCommunityIcon(community.community_type)}
                  isWeb={isWeb}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group-off" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>You haven't joined any communities yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.fab} onPress={handleCreateGroup}>
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
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  headerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconBtn: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.surfaceSubtle,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.error,
    borderWidth: 2,
    borderColor: theme.surfaceSubtle,
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
  searchContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
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
    color: theme.text,
  },
  sectionAction: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  suggestedRow: {
    paddingBottom: 8,
  },
  suggestedItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  suggestedCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  suggestedLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  activePill: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  communityList: {
    gap: 12,
  },
  webCommunityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
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
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityContent: {
    flex: 1,
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginRight: 8,
  },
  communityBadge: {
    backgroundColor: theme.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  communityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  communityMeta: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 8,
  },
  communityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  communityChipLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textSecondary,
    marginRight: 4,
  },
  communityChipText: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 4px 12px ${theme.primary}4D`,
      }
    }),
  },
});
