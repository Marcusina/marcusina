import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function PlaceScreen({
  onBackHome,
  onOpenConsult,
  onOpenGroups,
  onOpenProfile,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatarCircle}>
            <Text style={styles.headerAvatarIcon}>👤</Text>
          </View>
          <Text style={styles.headerTitle}>Marcusina Place</Text>
        </View>
        <TouchableOpacity style={styles.headerBellCircle}>
          <Text style={styles.headerBellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby Facilities</Text>
          <Text style={styles.sectionAction}>See All</Text>
        </View>
        <View style={styles.mapCard}>
          <View style={styles.mapSearchBar}>
            <Text style={styles.mapSearchPlaceholder}>
              Search clinics, pharmacies...
            </Text>
          </View>
          <View style={styles.mapBody}>
            <Text style={styles.mapText}>Map Placeholder</Text>
          </View>
        </View>
        <View style={styles.virtualCard}>
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
        <Text style={styles.servicesTitle}>Our Services</Text>
        <View style={styles.servicesGrid}>
          <ServiceCard
            icon="👨‍⚕️"
            title="Find a Doctor"
            subtitle="In-person visits"
          />
          <ServiceCard
            icon="📹"
            title="Virtual Consult"
            subtitle="Video & Audio calls"
            onPress={onOpenConsult}
          />
          <ServiceCard
            icon="💊"
            title="Pharmacy"
            subtitle="Order medications"
          />
          <ServiceCard
            icon="🧪"
            title="Lab Tests"
            subtitle="Home sample pickup"
          />
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={onBackHome}>
          <MaterialIcons name="home" size={22} color="#9CA3AF" style={styles.bottomIcon} />
          <Text style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem}>
          <MaterialIcons
            name="place"
            size={22}
            color="#7C3AED"
            style={[styles.bottomIcon, styles.bottomIconActive]}
          />
          <Text style={[styles.bottomLabel, styles.bottomLabelActive]}>
            Place
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomCenter}>
          <View style={styles.bottomPlusCircle}>
            <Text style={styles.bottomPlusIcon}>＋</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={onOpenGroups}>
          <MaterialIcons name="groups" size={22} color="#9CA3AF" style={styles.bottomIcon} />
          <Text style={styles.bottomLabel}>Social</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={onOpenProfile}>
          <MaterialIcons name="assignment" size={22} color="#9CA3AF" style={styles.bottomIcon} />
          <Text style={styles.bottomLabel}>Records</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ServiceCard({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress}>
      <View style={styles.serviceIconCircle}>
        <Text style={styles.serviceIcon}>{icon}</Text>
      </View>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerAvatarIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerBellCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBellIcon: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 8,
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
  mapCard: {
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
    overflow: 'hidden',
  },
  mapSearchBar: {
    height: 44,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  mapSearchPlaceholder: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  mapBody: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 12,
    color: '#6B7280',
  },
  virtualCard: {
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    padding: 20,
    marginBottom: 24,
  },
  virtualPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  virtualUrgentPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FACC15',
    marginRight: 8,
  },
  virtualUrgentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  virtualPillLabel: {
    fontSize: 11,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  virtualTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  virtualSubtitle: {
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 16,
  },
  virtualButton: {
    borderRadius: 999,
    backgroundColor: '#FACC15',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  virtualButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  serviceIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 18,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  bottomBar: {
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
  bottomItem: {
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
  bottomCenter: {
    alignItems: 'center',
  },
  bottomPlusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPlusIcon: {
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: -2,
  },
});
