import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  useWindowDimensions,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function HealthProfileScreen({ onBackHome, onEditProfile, profile, onLogout }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;
  const avatarInitial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';
  
  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerActionsRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onLogout}>
            <MaterialIcons name="logout" size={24} color={theme.error} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialIcons name="settings" size={24} color={theme.textSecondary} />
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
          <View style={[styles.profileHeader, isWeb && styles.webProfileHeader]}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PREMIUM</Text>
              </View>
            </View>
            
            <View style={[styles.profileInfo, isWeb && styles.webProfileInfo]}>
              <Text style={styles.profileName}>{profile.name || 'User'}</Text>
              <Text style={styles.profileType}>Personal Health Account</Text>
              <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
                <MaterialIcons name="edit" size={18} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={styles.editButtonText}>Edit Health Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.statsRow, isWeb && styles.webStatsRow]}>
            <StatCard icon="water_drop" value={profile.bloodType || '—'} label="Blood Type" isWeb={isWeb} />
            <StatCard icon="straighten" value={profile.height || '—'} label="Height (cm)" isWeb={isWeb} />
            <StatCard icon="monitor_weight" value={profile.weight || '—'} label="Weight (kg)" isWeb={isWeb} />
            {isWeb && <StatCard icon="calendar_today" value="28y" label="Age" isWeb={isWeb} />}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Records</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.recordsGrid, isWeb && styles.webRecordsGrid]}>
            <RecordCard icon="description" title="Medical History" subtitle="No recent entries" isWeb={isWeb} />
            <RecordCard icon="medication" title="Prescriptions" subtitle={`${profile.prescriptions?.length || 0} active scripts`} isWeb={isWeb} />
            <RecordCard icon="science" title="Lab Results" subtitle="1 new result" isWeb={isWeb} />
            <RecordCard icon="vaccines" title="Vaccinations" subtitle="Up to date" isWeb={isWeb} />
          </View>

          <Text style={styles.sectionTitle}>Recent Health Activity</Text>
          <View style={styles.activityList}>
            {profile.recentActivity?.length > 0 ? (
              profile.recentActivity.map((activity, idx) => (
                <View key={idx} style={styles.activityItem}>
                  <MaterialIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.activityText}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <MaterialIcons name="history" size={40} color="#E5E7EB" />
                <Text style={styles.emptyActivityText}>No recent health activity found.</Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons 
                  name={themeMode === 'dark' ? 'dark-mode' : 'light-mode'} 
                  size={24} 
                  color={theme.textSecondary} 
                />
                <Text style={styles.settingLabel}>
                  {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, isWeb }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={[styles.statCard, isWeb && styles.webStatCard]}>
      <View style={styles.statIconCircle}>
        <MaterialIcons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecordCard({ icon, title, subtitle, isWeb }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={[styles.recordCard, isWeb && styles.webRecordCard]}>
      <View style={styles.recordIconBox}>
        <MaterialIcons name={icon} size={28} color={theme.primary} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{title}</Text>
        <Text style={styles.recordSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export function PublicProfileScreen({ onBackHome, onEditProfile, profile }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;
  const avatarInitial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerRow}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialIcons name="more-vert" size={24} color="#4B5563" />
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
          <View style={[styles.profileHeader, isWeb && styles.webProfileHeader]}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{avatarInitial}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="check" size={12} color="#FFFFFF" />
              </View>
            </View>
            
            <View style={[styles.profileInfo, isWeb && styles.webProfileInfo]}>
              <Text style={styles.profileName}>{profile.name || 'User'}</Text>
              <Text style={styles.profileHandle}>{profile.handle || '@user_handle'}</Text>
              <Text style={styles.profileBio}>{profile.bio || 'No bio provided yet.'}</Text>
              
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.socialStatsRow}>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatValue}>{profile.followers || 0}</Text>
              <Text style={styles.socialStatLabel}>FOLLOWERS</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatValue}>{profile.following || 0}</Text>
              <Text style={styles.socialStatLabel}>FOLLOWING</Text>
            </View>
            <View style={styles.socialStatItem}>
              <Text style={styles.socialStatValue}>{profile.posts || 0}</Text>
              <Text style={styles.socialStatLabel}>POSTS</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Communities</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.communitiesScroll}
          >
            {profile.communities && profile.communities.length > 0 ? (
              profile.communities.map((community, i) => (
                <View key={community._id || i} style={styles.communityThumb}>
                  <Text style={styles.communityThumbText}>{community.name?.charAt(0) || 'C'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.communityThumb}>
                <MaterialIcons name="groups" size={24} color={theme.primary} />
              </View>
            )}
            <TouchableOpacity style={styles.joinMoreBtn}>
              <MaterialIcons name="add" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export function ProfileScreen({ profile, onCancel, onSave }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [edited, setEdited] = useState({ ...profile });
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => onSave(edited)}>
            <Text style={styles.saveText}>Save</Text>
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
          {isWeb && (
            <View style={styles.webEditHeader}>
              <Text style={styles.webEditTitle}>Edit Profile Settings</Text>
              <View style={styles.webEditActions}>
                <TouchableOpacity style={styles.webCancelBtn} onPress={onCancel}>
                  <Text style={styles.webCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.webSaveBtn} onPress={() => onSave(edited)}>
                  <Text style={styles.webSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

            <View style={[styles.editSection, isWeb && styles.webEditGrid]}>
              <View style={[styles.inputGroup, isWeb && styles.webInputHalf]}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={edited.name}
                  onChangeText={(t) => setEdited({ ...edited, name: t })}
                  placeholder="Enter your name"
                />
              </View>
              <View style={[styles.inputGroup, isWeb && styles.webInputHalf]}>
                <Text style={styles.inputLabel}>Username Handle</Text>
                <TextInput
                  style={styles.textInput}
                  value={edited.handle}
                  onChangeText={(t) => setEdited({ ...edited, handle: t })}
                  placeholder="@username"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={edited.bio}
                  onChangeText={(t) => setEdited({ ...edited, bio: t })}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.divider} />
              <Text style={styles.formSubTitle}>Health Information</Text>
              
              <View style={[styles.inputGroup, isWeb && styles.webInputThird]}>
                <Text style={styles.inputLabel}>Blood Type</Text>
                <TextInput
                  style={styles.textInput}
                  value={edited.bloodType}
                  onChangeText={(t) => setEdited({ ...edited, bloodType: t })}
                  placeholder="e.g. O+"
                />
              </View>
              <View style={[styles.inputGroup, isWeb && styles.webInputThird]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={edited.height}
                  onChangeText={(t) => setEdited({ ...edited, height: t })}
                  placeholder="e.g. 175"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, isWeb && styles.webInputThird]}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={edited.weight}
                  onChangeText={(t) => setEdited({ ...edited, weight: t })}
                  placeholder="e.g. 70"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {!isWeb && (
              <View style={styles.mobileEditFooter}>
                <TouchableOpacity style={styles.mobileSaveBtn} onPress={() => onSave(edited)}>
                  <Text style={styles.mobileSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  webScrollContent: {
    paddingTop: 20,
  },
  contentMaxWidth: {
    paddingHorizontal: 20,
  },
  webContentMaxWidth: {
    paddingHorizontal: 0,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  webProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.surface,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.primary,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  webProfileInfo: {
    alignItems: 'flex-start',
    marginLeft: 32,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: theme.textMuted,
    marginBottom: 16,
  },
  profileHandle: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    maxWidth: 400,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.primaryLight,
  },
  editButtonText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  webStatsRow: {
    justifyContent: 'flex-start',
    gap: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  webStatCard: {
    flex: 0,
    minWidth: 140,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
  },
  viewAllText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  recordsGrid: {
    gap: 12,
    marginBottom: 32,
  },
  webRecordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webRecordCard: {
    width: '48.5%',
  },
  recordIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  recordSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
  },
  activityList: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  emptyActivity: {
    alignItems: 'center',
  },
  emptyActivityText: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  followButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  followButtonText: {
    color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  messageButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageButtonText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 15,
  },
  socialStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: theme.surface,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.border,
  },
  socialStatItem: {
    alignItems: 'center',
  },
  socialStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  socialStatLabel: {
    fontSize: 10,
    color: theme.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  communitiesScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  communityThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primaryLight,
  },
  joinMoreBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  editHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  mobileEditFooter: {
    marginTop: 24,
    marginBottom: 32,
  },
  mobileSaveBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileSaveText: {
    color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  webEditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  webEditTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
  },
  webEditActions: {
    flexDirection: 'row',
    gap: 12,
  },
  webCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webCancelText: {
    color: theme.textSecondary,
    fontWeight: '600',
  },
  webSaveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.primary,
  },
  webSaveText: {
    color: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
    fontWeight: '700',
  },
  editSection: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webEditGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  webInputHalf: {
    width: '48%',
  },
  webInputThird: {
    width: '31%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 15,
    color: theme.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },
  formSubTitle: {
    width: '100%',
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
    marginLeft: 12,
  },
  activityDate: {
    fontSize: 12,
    color: theme.textMuted,
  },
  communityThumbText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  settingsCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: theme.text,
    fontWeight: '500',
  },
});
