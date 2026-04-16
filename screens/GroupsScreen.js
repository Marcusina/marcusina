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

export function GroupsScreen({ token, onBackHome, onOpenConsult, onOpenProfile }) {
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
        <View style={styles.headerRow}>
          <Image 
            source={require('../assets/marcusina.jpeg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerIconsRow}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={onOpenProfile}>
              <MaterialIcons name="person-outline" size={24} color="#4B5563" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  searchContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
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
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  activePill: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: '#7C3AED',
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
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
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
    marginBottom: 4,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  communityBadge: {
    backgroundColor: '#EF4444',
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
    color: '#6B7280',
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
    color: '#4B5563',
    marginRight: 4,
  },
  communityChipText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
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
