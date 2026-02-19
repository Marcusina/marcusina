import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function HealthProfileScreen({ onBackHome, onEditProfile, profile }) {
  return (
    <SafeAreaView style={styles.publicSafeArea}>
      <View style={styles.publicHeaderRow}>
        <Text style={styles.publicBrand}>Marcusina</Text>
        <View style={styles.publicHeaderIcons}>
          <Text style={styles.publicHeaderIcon}>🔍</Text>
          <Text style={styles.publicHeaderIcon}>☰</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.publicScrollContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.publicAvatarWrapper}>
            <View style={styles.publicAvatarRing}>
              <View style={styles.publicAvatarCircle}>
                <Text style={styles.publicAvatarInitial}>M</Text>
              </View>
            </View>
            <View style={styles.healthPremiumPill}>
              <Text style={styles.healthPremiumText}>PREMIUM</Text>
            </View>
          </View>
          <Text style={styles.publicName}>{profile.name}</Text>
          <Text style={styles.healthAccountLabel}>Personal Account</Text>
          <TouchableOpacity style={styles.healthEditButton} onPress={onEditProfile}>
            <Text style={styles.healthEditButtonLabel}>Edit Profile</Text>
          </TouchableOpacity>
          <View style={styles.healthStatsRow}>
            <View style={styles.healthStatCard}>
              <Text style={styles.healthStatIcon}>🩸</Text>
              <Text style={styles.healthStatValue}>{profile.bloodType}</Text>
              <Text style={styles.healthStatLabel}>Blood Type</Text>
            </View>
            <View style={styles.healthStatCard}>
              <Text style={styles.healthStatIcon}>📏</Text>
              <Text style={styles.healthStatValue}>{profile.height}</Text>
              <Text style={styles.healthStatLabel}>Height</Text>
            </View>
            <View style={styles.healthStatCard}>
              <Text style={styles.healthStatIcon}>⚖️</Text>
              <Text style={styles.healthStatValue}>{profile.weight}</Text>
              <Text style={styles.healthStatLabel}>Weight</Text>
            </View>
          </View>
          <View style={styles.healthSectionHeaderRow}>
            <Text style={styles.healthSectionTitle}>Health Records</Text>
            <Text style={styles.healthViewAll}>View All</Text>
          </View>
          <View style={styles.healthRecordsGrid}>
            <View style={styles.healthRecordCard}>
              <Text style={styles.healthRecordIcon}>📄</Text>
              <Text style={styles.healthRecordTitle}>Medical History</Text>
              <Text style={styles.healthRecordSubtitle}>24 entries found</Text>
            </View>
            <View style={styles.healthRecordCard}>
              <Text style={styles.healthRecordIcon}>💊</Text>
              <Text style={styles.healthRecordTitle}>Prescriptions</Text>
              <Text style={styles.healthRecordSubtitle}>3 active scripts</Text>
            </View>
            <View style={styles.healthRecordCard}>
              <Text style={styles.healthRecordIcon}>🧪</Text>
              <Text style={styles.healthRecordTitle}>Lab Results</Text>
              <Text style={styles.healthRecordSubtitle}>Last updated: Oct 12</Text>
            </View>
            <View style={styles.healthRecordCard}>
              <Text style={styles.healthRecordIcon}>💉</Text>
              <Text style={styles.healthRecordTitle}>Vaccinations</Text>
              <Text style={styles.healthRecordSubtitle}>Up to date</Text>
            </View>
          </View>
          <Text style={styles.healthSectionTitle}>Recent Activity</Text>
          <View style={styles.healthActivityList}>
            <View style={styles.healthActivityItem}>
              <View style={styles.healthActivityIconCircle}>
                <Text style={styles.healthActivityIcon}>➕</Text>
              </View>
              <View style={styles.healthActivityText}>
                <Text style={styles.healthActivityTitle}>Consultation with Dr. Smith</Text>
                <Text style={styles.healthActivitySubtitle}>Yesterday at 2:30 PM</Text>
              </View>
              <Text style={styles.healthActivityChevron}>›</Text>
            </View>
            <View style={styles.healthActivityItem}>
              <View style={styles.healthActivityIconCircleGreen}>
                <Text style={styles.healthActivityIcon}>🛒</Text>
              </View>
              <View style={styles.healthActivityText}>
                <Text style={styles.healthActivityTitle}>Pharmacy Order #4421</Text>
                <Text style={styles.healthActivitySubtitle}>Delivered · 2 days ago</Text>
              </View>
              <Text style={styles.healthActivityChevron}>›</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.publicBottomBar}>
        <TouchableOpacity style={styles.publicBottomItem} onPress={onBackHome}>
          <MaterialIcons name="home" size={22} color="#9CA3AF" style={styles.publicBottomIcon} />
          <Text style={styles.publicBottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem}>
          <MaterialIcons
            name="explore"
            size={22}
            color="#9CA3AF"
            style={styles.publicBottomIcon}
          />
          <Text style={styles.publicBottomLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomCenter}>
          <View style={styles.publicPlusCircle}>
            <MaterialIcons name="add" size={26} color="#FFFFFF" style={styles.publicPlusIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color="#9CA3AF"
            style={styles.publicBottomIcon}
          />
          <Text style={styles.publicBottomLabel}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem}>
          <MaterialIcons
            name="person"
            size={22}
            color="#7C3AED"
            style={[styles.publicBottomIcon, styles.publicBottomIconActive]}
          />
          <Text style={[styles.publicBottomLabel, styles.publicBottomLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function PublicProfileScreen({ onBackHome, onEditProfile, profile }) {
  return (
    <SafeAreaView style={styles.publicSafeArea}>
      <View style={styles.publicHeaderRow}>
        <Text style={styles.publicBrand}>Marcusina</Text>
        <View style={styles.publicHeaderIcons}>
          <Text style={styles.publicHeaderIcon}>🔍</Text>
          <Text style={styles.publicHeaderIcon}>☰</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.publicScrollContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.publicAvatarWrapper}>
            <View style={styles.publicAvatarRing}>
              <View style={styles.publicAvatarCircle}>
                <Text style={styles.publicAvatarInitial}>M</Text>
              </View>
            </View>
            <View style={styles.publicBadgeCircle}>
              <Text style={styles.publicBadgeIcon}>★</Text>
            </View>
          </View>
          <Text style={styles.publicName}>{profile.name}</Text>
          <Text style={styles.publicHandle}>{profile.handle}</Text>
          <Text style={styles.publicBio}>{profile.bio}</Text>
          <View style={styles.publicActionsRow}>
            <TouchableOpacity style={styles.publicFollowButton}>
              <Text style={styles.publicFollowLabel}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.publicMessageButton}>
              <Text style={styles.publicMessageLabel}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.publicStatsRow}>
            <View style={styles.publicStatItem}>
              <Text style={styles.publicStatValue}>12.5K</Text>
              <Text style={styles.publicStatLabel}>FOLLOWERS</Text>
            </View>
            <View style={styles.publicStatItem}>
              <Text style={styles.publicStatValue}>842</Text>
              <Text style={styles.publicStatLabel}>FOLLOWING</Text>
            </View>
            <View style={styles.publicStatItem}>
              <Text style={styles.publicStatValue}>128</Text>
              <Text style={styles.publicStatLabel}>POSTS</Text>
            </View>
          </View>
          <Text style={styles.publicSectionLabel}>COMMUNITIES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.publicCommunitiesRow}
          >
            {[
              { label: 'Fitness', color: '#FEE2E2' },
              { label: 'Dietary', color: '#FCE7F3' },
              { label: 'Mind', color: '#EDE9FE' },
              { label: 'Heart', color: '#FEF3C7' },
            ].map((item) => (
              <View key={item.label} style={styles.publicCommunityItem}>
                <View style={[styles.publicCommunityCircle, { backgroundColor: item.color }]} />
                <Text style={styles.publicCommunityLabel}>{item.label}</Text>
              </View>
            ))}
            <View style={styles.publicCommunityItem}>
              <View style={[styles.publicCommunityCircle, styles.publicCommunityJoinCircle]}>
                <Text style={styles.publicCommunityJoinPlus}>＋</Text>
              </View>
              <Text style={styles.publicCommunityLabel}>Join</Text>
            </View>
          </ScrollView>
          <View style={styles.publicTabsRow}>
            <TouchableOpacity style={styles.publicTabItem}>
              <Text style={[styles.publicTabLabel, styles.publicTabLabelActive]}>
                Content Posted
              </Text>
              <View style={styles.publicTabUnderline} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.publicTabItem}>
              <Text style={styles.publicTabLabel}>Recent Developments</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.publicGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.publicGridItem} />
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.publicBottomBar}>
        <TouchableOpacity style={styles.publicBottomItem} onPress={onBackHome}>
          <MaterialIcons name="home" size={22} color="#9CA3AF" style={styles.publicBottomIcon} />
          <Text style={styles.publicBottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem}>
          <MaterialIcons
            name="explore"
            size={22}
            color="#9CA3AF"
            style={styles.publicBottomIcon}
          />
          <Text style={styles.publicBottomLabel}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomCenter}>
          <View style={styles.publicPlusCircle}>
            <MaterialIcons name="add" size={26} color="#FFFFFF" style={styles.publicPlusIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem}>
          <MaterialIcons
            name="chat-bubble-outline"
            size={22}
            color="#9CA3AF"
            style={styles.publicBottomIcon}
          />
          <Text style={styles.publicBottomLabel}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publicBottomItem} onPress={onEditProfile}>
          <MaterialIcons
            name="person"
            size={22}
            color="#7C3AED"
            style={[styles.publicBottomIcon, styles.publicBottomIconActive]}
          />
          <Text style={[styles.publicBottomLabel, styles.publicBottomLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export function ProfileScreen({ onCancel, onSave, profile }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [handle, setHandle] = useState(profile.handle);
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);

  const handleSave = () => {
    onSave({
      ...profile,
      name,
      email,
      phone,
      location,
      bio,
      handle,
      bloodType,
      height,
      weight,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.headerCancel}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>M</Text>
          </View>
          <View style={styles.avatarEditBadge}>
            <Text style={styles.avatarEditIcon}>✎</Text>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>FULL NAME</Text>
            <TextInput
              style={styles.infoInput}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.infoInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.infoInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>LOCATION</Text>
            <TextInput
              style={styles.infoInput}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.infoLabel}>BIO</Text>
          <TextInput
            style={styles.bioInputEdit}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about your health journey..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={200}
          />
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SOCIAL HANDLE</Text>
            <TextInput
              style={styles.infoInput}
              value={handle}
              onChangeText={setHandle}
              placeholder="@handle"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>BLOOD TYPE</Text>
            <TextInput
              style={styles.infoInput}
              value={bloodType}
              onChangeText={setBloodType}
              placeholder="e.g. O+"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>HEIGHT</Text>
            <TextInput
              style={styles.infoInput}
              value={height}
              onChangeText={setHeight}
              placeholder="e.g. 182 cm"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WEIGHT</Text>
            <TextInput
              style={styles.infoInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 75 kg"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProfileItem({ label, iconLabel, isLast }) {
  return (
    <View style={[styles.itemRow, isLast && styles.itemRowLast]}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIconCircle}>
          <Text style={styles.itemIcon}>{iconLabel}</Text>
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Text style={styles.itemChevron}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  publicSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  publicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  publicBrand: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7C3AED',
  },
  publicHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publicHeaderIcon: {
    fontSize: 20,
    color: '#4B5563',
    marginLeft: 16,
  },
  publicScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 160,
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  publicAvatarWrapper: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  publicAvatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicAvatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicAvatarInitial: {
    fontSize: 40,
    fontWeight: '600',
    color: '#6B7280',
  },
  publicBadgeCircle: {
    position: 'absolute',
    bottom: 8,
    right: (120 - 56) / 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicBadgeIcon: {
    fontSize: 16,
    color: '#92400E',
  },
  publicName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 4,
  },
  publicHandle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  publicBio: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  publicActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  publicFollowButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
    marginRight: 12,
  },
  publicFollowLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  publicMessageButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  publicMessageLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  publicStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  publicStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  publicStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  publicStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  publicSectionLabel: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 8,
  },
  publicCommunitiesRow: {
    paddingVertical: 4,
    marginBottom: 20,
  },
  publicCommunityItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  publicCommunityCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 6,
  },
  publicCommunityJoinCircle: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicCommunityJoinPlus: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  publicCommunityLabel: {
    fontSize: 12,
    color: '#374151',
  },
  publicTabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  publicTabItem: {
    marginRight: 24,
  },
  publicTabLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  publicTabLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  publicTabUnderline: {
    marginTop: 4,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
  },
  publicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  publicGridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  publicBottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  publicBottomItem: {
    alignItems: 'center',
  },
  publicBottomIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  publicBottomIconActive: {
    color: '#7C3AED',
  },
  publicBottomLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  publicBottomLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  publicBottomCenter: {
    alignItems: 'center',
  },
  publicPlusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicPlusIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: -2,
  },
  healthPremiumPill: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EC4899',
  },
  healthPremiumText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  healthAccountLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  healthEditButton: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#F472B6',
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginBottom: 16,
  },
  healthEditButtonLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  healthStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  healthStatCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  healthStatIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  healthStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  healthSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
    marginBottom: 8,
  },
  healthViewAll: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
  healthRecordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  healthRecordCard: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 12,
  },
  healthRecordIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  healthRecordTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  healthRecordSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  healthActivityList: {
    marginTop: 8,
    marginBottom: 24,
  },
  healthActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  healthActivityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthActivityIconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  healthActivityIcon: {
    fontSize: 16,
  },
  healthActivityText: {
    flex: 1,
  },
  healthActivityTitle: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  healthActivitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  healthActivityChevron: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backArrow: {
    fontSize: 20,
    color: '#7C3AED',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerCancel: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    color: '#6B7280',
    fontWeight: '600',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: (104 - 56) / 2,
    bottom: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
  },
  avatarEditIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  infoRow: {
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
  },
  infoInput: {
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  bioInputEdit: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemLabel: {
    fontSize: 14,
    color: '#111827',
  },
  itemChevron: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  bottomActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
});
