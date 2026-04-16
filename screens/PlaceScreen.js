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
import { useTheme } from '../context/ThemeContext';

export function PlaceScreen({
  onBackHome,
  onOpenConsult,
  onOpenGroups,
  onOpenProfile,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerActionsRow}>
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
          <View style={[styles.mainFeatured, isWeb && styles.webMainFeatured]}>
            <View style={[styles.mapCard, isWeb && styles.webMapCard]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Nearby Facilities</Text>
                <TouchableOpacity>
                  <Text style={styles.sectionAction}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.mapSearchBar}>
                <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <Text style={styles.mapSearchPlaceholder}>
                  Search clinics, pharmacies...
                </Text>
              </View>
              <View style={styles.mapBody}>
                <MaterialIcons name="map" size={48} color="#E5E7EB" />
                <Text style={styles.mapText}>Interactive Map View</Text>
              </View>
            </View>

            <View style={[styles.virtualCard, isWeb && styles.webVirtualCard]}>
              <View style={styles.virtualPillRow}>
                <View style={styles.virtualUrgentPill}>
                  <Text style={styles.virtualUrgentText}>URGENT</Text>
                </View>
                <Text style={styles.virtualPillLabel}>TELE-MEDICINE</Text>
              </View>
              <Text style={styles.virtualTitle}>Virtual Care</Text>
              <Text style={styles.virtualSubtitle}>
                Connect with a doctor in less than 5 minutes
              </Text>
              <TouchableOpacity
                style={styles.virtualButton}
                onPress={onOpenConsult}
              >
                <Text style={styles.virtualButtonText}>Consult Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.servicesTitle}>Our Services</Text>
          <View style={[styles.servicesGrid, isWeb && styles.webServicesGrid]}>
            <ServiceCard
              icon="person-search"
              title="Find a Doctor"
              subtitle="In-person visits"
              isWeb={isWeb}
            />
            <ServiceCard
              icon="videocam"
              title="Virtual Consult"
              subtitle="Video & Audio calls"
              onPress={onOpenConsult}
              isWeb={isWeb}
            />
            <ServiceCard
              icon="medication"
              title="Pharmacy"
              subtitle="Order medications"
              isWeb={isWeb}
            />
            <ServiceCard
              icon="science"
              title="Lab Tests"
              subtitle="Home sample pickup"
              isWeb={isWeb}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ServiceCard({ icon, title, subtitle, onPress, isWeb }) {
  return (
    <TouchableOpacity style={[styles.serviceCard, isWeb && styles.webServiceCard]} onPress={onPress}>
      <View style={styles.serviceIconCircle}>
        <MaterialIcons name={icon} size={28} color="#7C3AED" />
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceSubtitle}>{subtitle}</Text>
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
  mainFeatured: {
    marginTop: 20,
    gap: 20,
  },
  webMainFeatured: {
    flexDirection: 'row',
  },
  mapCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webMapCard: {
    flex: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  mapSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  mapSearchPlaceholder: {
    color: theme.textMuted,
    fontSize: 14,
  },
  mapBody: {
    height: 180,
    backgroundColor: theme.background,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  mapText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '500',
  },
  virtualCard: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
  },
  webVirtualCard: {
    flex: 1,
  },
  virtualPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  virtualUrgentPill: {
    backgroundColor: theme.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  virtualUrgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  virtualPillLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  virtualTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  virtualSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
  },
  virtualButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  virtualButtonText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 32,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  webServicesGrid: {
    flexDirection: 'row',
  },
  serviceCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webServiceCard: {
    width: '23%',
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 18,
  },
});
