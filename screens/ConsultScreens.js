import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function ConsultBookingScreen({ onBack, onProceed, onGoHome }) {
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah');
  const [selectedService, setSelectedService] = useState('Video Call');
  const [selectedDate, setSelectedDate] = useState('WED 19');
  const [selectedSlot, setSelectedSlot] = useState('09:30 AM');

  const doctors = [
    { name: 'Dr. Sarah', rating: '4.9' },
    { name: 'Dr. Mark', rating: '4.8' },
    { name: 'Dr. Elena', rating: '5.0' },
    { name: 'Dr. James', rating: '4.7' },
    { name: 'Dr. Chen', rating: '4.8' },
  ];

  const dates = [
    { label: 'MON', day: '17' },
    { label: 'TUE', day: '18' },
    { label: 'WED', day: '19' },
    { label: 'THU', day: '20' },
    { label: 'FRI', day: '21' },
    { label: 'SAT', day: '22' },
  ];

  const morningSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
  ];

  const afternoonSlots = ['02:00 PM', '03:30 PM', '04:00 PM'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Consultation</Text>
        <TouchableOpacity>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>M</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentMaxWidth}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Quick Match</Text>
            <Text style={styles.sectionAction}>View All</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {doctors.map((doctor) => {
              const isSelected = selectedDoctor === doctor.name;
              return (
                <TouchableOpacity
                  key={doctor.name}
                  style={styles.quickDoctorItem}
                  onPress={() => setSelectedDoctor(doctor.name)}
                >
                  <View
                    style={[
                      styles.quickAvatarRing,
                      isSelected && styles.quickAvatarRingSelected,
                    ]}
                  >
                    <View style={styles.quickAvatarCircle}>
                      <Text style={styles.quickAvatarInitial}>
                        {doctor.name.split(' ')[1]?.[0] || 'M'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.quickRatingBadge}>
                    <Text style={styles.quickRatingText}>★ {doctor.rating}</Text>
                  </View>
                  <Text style={styles.quickDoctorName}>{doctor.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.sectionTitle}>Select Service Type</Text>
          <View style={styles.serviceRow}>
            {[
              { label: 'Video Call', icon: '🎥' },
              { label: 'Voice Call', icon: '📞' },
              { label: 'Chat', icon: '💬' },
            ].map((item) => {
              const isSelected = selectedService === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.serviceCard,
                    isSelected && styles.serviceCardSelected,
                  ]}
                  onPress={() => setSelectedService(item.label)}
                >
                  <Text style={styles.serviceIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.serviceLabel,
                      isSelected && styles.serviceLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.scheduleHeaderRow}>
            <Text style={styles.sectionTitle}>Available Schedule</Text>
            <Text style={styles.scheduleMonth}>June 2024 📅</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {dates.map((date) => {
              const key = `${date.label} ${date.day}`;
              const isSelected = selectedDate === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.dateItem,
                    isSelected && styles.dateItemSelected,
                  ]}
                  onPress={() => setSelectedDate(key)}
                >
                  <Text
                    style={[
                      styles.dateLabel,
                      isSelected && styles.dateLabelSelected,
                    ]}
                  >
                    {date.label}
                  </Text>
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateDaySelected,
                    ]}
                  >
                    {date.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.subSectionTitle}>MORNING SLOTS</Text>
          <View style={styles.slotRow}>
            {morningSlots.map((slot) => {
              const isDisabled = slot === '11:00 AM';
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  disabled={isDisabled}
                  style={[
                    styles.slotPill,
                    isSelected && styles.slotPillSelected,
                    isDisabled && styles.slotPillDisabled,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotLabel,
                      isSelected && styles.slotLabelSelected,
                      isDisabled && styles.slotLabelDisabled,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.subSectionTitle}>AFTERNOON SLOTS</Text>
          <View style={styles.slotRow}>
            {afternoonSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotPill,
                    isSelected && styles.slotPillSelected,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotLabel,
                      isSelected && styles.slotLabelSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View style={styles.bottomTopRow}>
          <View>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>$120.00</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onProceed}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomNavRow}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={onGoHome}>
            <MaterialIcons name="home" size={22} color="#9CA3AF" style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons name="groups" size={22} color="#9CA3AF" style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavLabel}>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons
              name="medical-services"
              size={22}
              color="#7C3AED"
              style={[styles.bottomNavIcon, styles.bottomNavIconActive]}
            />
            <Text
              style={[styles.bottomNavLabel, styles.bottomNavLabelActive]}
            >
              Consult
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>⚙️</Text>
            <Text style={styles.bottomNavLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function ConsultConfirmScreen({ onBack, onDone }) {
  const [method, setMethod] = useState('card');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.doctorSummaryCard}>
          <View style={styles.summaryAvatar}>
            <Text style={styles.summaryAvatarInitial}>J</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryName}>Dr. Julian Sterling</Text>
            <Text style={styles.summaryRole}>Senior Cardiologist</Text>
            <View style={styles.summaryRatingBadge}>
              <Text style={styles.summaryRatingText}>★ 4.9</Text>
            </View>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryIcon}>📅</Text>
          <Text style={styles.summaryMainText}>Oct 24, 2023</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryIcon}>⏰</Text>
          <Text style={styles.summaryMainText}>10:30 AM - 11:00 AM</Text>
        </View>
        <Text style={styles.paymentSectionTitle}>PAYMENT SUMMARY</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Consultation Fee</Text>
          <Text style={styles.paymentValue}>$120.00</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Platform Fee</Text>
          <Text style={styles.paymentValue}>$5.50</Text>
        </View>
        <View style={styles.paymentRowTotal}>
          <Text style={styles.paymentTotalLabel}>Total Amount</Text>
          <Text style={styles.paymentTotalValue}>$125.50</Text>
        </View>
        <Text style={styles.paymentSectionTitle}>PAYMENT METHOD</Text>
        <TouchableOpacity
          style={[
            styles.methodCard,
            method === 'card' && styles.methodCardSelected,
          ]}
          onPress={() => setMethod('card')}
        >
          <Text style={styles.methodIcon}>💳</Text>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>Credit/Debit Card</Text>
            <Text style={styles.methodSubtitle}>•••• 4242</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              method === 'card' && styles.radioOuterSelected,
            ]}
          >
            {method === 'card' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodCard,
            method === 'apple' && styles.methodCardSelected,
          ]}
          onPress={() => setMethod('apple')}
        >
          <Text style={styles.methodIcon}></Text>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>Apple Pay</Text>
            <Text style={styles.methodSubtitle}>Fast and secure</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              method === 'apple' && styles.radioOuterSelected,
            ]}
          >
            {method === 'apple' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.methodCard,
            method === 'wallet' && styles.methodCardSelected,
          ]}
          onPress={() => setMethod('wallet')}
        >
          <Text style={styles.methodIcon}>📱</Text>
          <View style={styles.methodText}>
            <Text style={styles.methodTitle}>Mobile Wallet</Text>
            <Text style={styles.methodSubtitle}>PayPal, Venmo</Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              method === 'wallet' && styles.radioOuterSelected,
            ]}
          >
            {method === 'wallet' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.confirmBottomBar}>
        <TouchableOpacity style={styles.confirmButton} onPress={onDone}>
          <Text style={styles.confirmButtonText}>Pay & Confirm $125.50</Text>
        </TouchableOpacity>
        <View style={styles.bottomNavRow}>
          <TouchableOpacity style={styles.bottomNavItem} onPress={onBack}>
            <MaterialIcons name="home" size={22} color="#9CA3AF" style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons
              name="event-note"
              size={22}
              color="#7C3AED"
              style={styles.bottomNavIcon}
            />
            <Text style={styles.bottomNavLabel}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={22}
              color="#9CA3AF"
              style={styles.bottomNavIcon}
            />
            <Text style={styles.bottomNavLabel}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomNavItem}>
            <MaterialIcons name="person" size={22} color="#9CA3AF" style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  backArrow: {
    fontSize: 20,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 28,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    paddingTop: 16,
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  quickRow: {
    paddingVertical: 4,
    marginBottom: 20,
  },
  quickDoctorItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  quickAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAvatarRingSelected: {
    borderColor: '#7C3AED',
  },
  quickAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAvatarInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  quickRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  quickRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickDoctorName: {
    marginTop: 4,
    fontSize: 12,
    color: '#111827',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  serviceCardSelected: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1,
    borderColor: '#EC4899',
  },
  serviceIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  serviceLabelSelected: {
    color: '#111827',
    fontWeight: '600',
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleMonth: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateRow: {
    marginBottom: 20,
  },
  dateItem: {
    width: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  dateItemSelected: {
    backgroundColor: '#7C3AED',
  },
  dateLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  dateLabelSelected: {
    color: '#E5E7EB',
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dateDaySelected: {
    color: '#FFFFFF',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  slotPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  slotPillSelected: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  slotPillDisabled: {
    backgroundColor: '#E5E7EB',
  },
  slotLabel: {
    fontSize: 12,
    color: '#111827',
  },
  slotLabelSelected: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  slotLabelDisabled: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bottomTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  primaryButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  bottomNavItem: {
    alignItems: 'center',
    flex: 1,
  },
  bottomNavIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomNavLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bottomNavIconActive: {
    color: '#7C3AED',
  },
  bottomNavLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  doctorSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginBottom: 12,
  },
  summaryAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryAvatarInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryText: {
    flex: 1,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRole: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryRatingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  summaryRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  summaryMainText: {
    fontSize: 13,
    color: '#111827',
  },
  paymentSectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentValue: {
    fontSize: 13,
    color: '#111827',
  },
  paymentTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    marginBottom: 8,
  },
  methodCardSelected: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  methodIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  methodText: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    color: '#111827',
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#7C3AED',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C3AED',
  },
  confirmBottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  confirmButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    marginBottom: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
