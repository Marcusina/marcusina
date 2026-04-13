import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export function ConsultBookingScreen({ onBack, onProceed, onGoHome }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah');
  const [selectedService, setSelectedService] = useState('Video Call');
  const [selectedDate, setSelectedDate] = useState('WED 19');
  const [selectedSlot, setSelectedSlot] = useState('09:30 AM');

  const doctors = [
    { name: 'Dr. Sarah', rating: '4.9', specialty: 'General Physician' },
    { name: 'Dr. Mark', rating: '4.8', specialty: 'Cardiologist' },
    { name: 'Dr. Elena', rating: '5.0', specialty: 'Dermatologist' },
    { name: 'Dr. James', rating: '4.7', specialty: 'Pediatrician' },
    { name: 'Dr. Chen', rating: '4.8', specialty: 'Neurologist' },
  ];

  const dates = [
    { label: 'MON', day: '17' },
    { label: 'TUE', day: '18' },
    { label: 'WED', day: '19' },
    { label: 'THU', day: '20' },
    { label: 'FRI', day: '21' },
    { label: 'SAT', day: '22' },
  ];

  const morningSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
  const afternoonSlots = ['02:00 PM', '03:30 PM', '04:00 PM'];

  return (
    <View style={styles.container}>
      {!isWeb && (
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Consultation</Text>
          <View style={styles.headerRight} />
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
          <View style={[styles.bookingLayout, isWeb && styles.webBookingLayout]}>
            <View style={[styles.bookingMain, isWeb && styles.webBookingMain]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Select Specialist</Text>
                <TouchableOpacity>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
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
                      style={[styles.doctorCard, isSelected && styles.doctorCardSelected]}
                      onPress={() => setSelectedDoctor(doctor.name)}
                    >
                      <View style={styles.doctorAvatar}>
                        <MaterialIcons name="person" size={32} color={isSelected ? '#7C3AED' : '#9CA3AF'} />
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <MaterialIcons name="check" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text style={[styles.doctorName, isSelected && styles.doctorNameSelected]}>{doctor.name}</Text>
                      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                      <View style={styles.ratingBox}>
                        <MaterialIcons name="star" size={14} color="#FBBF24" />
                        <Text style={styles.ratingText}>{doctor.rating}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.sectionTitle}>Service Type</Text>
              <View style={[styles.serviceRow, isWeb && styles.webServiceRow]}>
                {[
                  { label: 'Video Call', icon: 'videocam', price: '$25' },
                  { label: 'Voice Call', icon: 'call', price: '$15' },
                  { label: 'Chat', icon: 'chat', price: '$10' },
                ].map((item) => {
                  const isSelected = selectedService === item.label;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
                      onPress={() => setSelectedService(item.label)}
                    >
                      <View style={[styles.serviceIconBox, isSelected && styles.serviceIconBoxSelected]}>
                        <MaterialIcons name={item.icon} size={24} color={isSelected ? '#FFFFFF' : '#7C3AED'} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={[styles.serviceLabel, isSelected && styles.serviceLabelSelected]}>{item.label}</Text>
                        <Text style={styles.servicePrice}>{item.price}</Text>
                      </View>
                      {isSelected && <MaterialIcons name="check-circle" size={20} color="#7C3AED" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.bookingSidebar, isWeb && styles.webBookingSidebar]}>
              <View style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.sectionTitle}>Schedule</Text>
                  <Text style={styles.scheduleMonth}>June 2024</Text>
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
                        style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                        onPress={() => setSelectedDate(key)}
                      >
                        <Text style={[styles.dateLabel, isSelected && styles.dateLabelSelected]}>{date.label}</Text>
                        <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>{date.day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={styles.subSectionTitle}>MORNING SLOTS</Text>
                <View style={styles.slotRow}>
                  {morningSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.slotPill, isSelected && styles.slotPillSelected]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text style={[styles.slotLabel, isSelected && styles.slotLabelSelected]}>{slot}</Text>
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
                        style={[styles.slotPill, isSelected && styles.slotPillSelected]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text style={[styles.slotLabel, isSelected && styles.slotLabelSelected]}>{slot}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
                  <Text style={styles.proceedButtonText}>Confirm Booking</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function ConsultConfirmScreen({ onBack, onDone }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.container}>
      <View style={styles.confirmContent}>
        <View style={styles.successIconCircle}>
          <MaterialIcons name="check" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your consultation with Dr. Sarah has been scheduled for June 19, 2024 at 09:30 AM.
        </Text>
        
        <View style={[styles.summaryCard, isWeb && styles.webSummaryCard]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>Dr. Sarah</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>Video Call</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>09:30 AM</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Payment</Text>
            <Text style={[styles.summaryValue, styles.totalPrice]}>$25.00</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  webScrollContent: {
    paddingTop: 0,
  },
  contentMaxWidth: {
    paddingHorizontal: 20,
  },
  webContentMaxWidth: {
    paddingHorizontal: 0,
  },
  bookingLayout: {
    marginTop: 20,
    gap: 24,
  },
  webBookingLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookingMain: {
    flex: 1,
  },
  webBookingMain: {
    flex: 1.5,
  },
  bookingSidebar: {
    flex: 1,
  },
  webBookingSidebar: {
    flex: 1,
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
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  quickRow: {
    paddingBottom: 20,
  },
  doctorCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  doctorCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  selectedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  doctorNameSelected: {
    color: '#7C3AED',
  },
  doctorSpecialty: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  serviceRow: {
    gap: 12,
  },
  webServiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      web: { flex: 1, minWidth: 200 }
    })
  },
  serviceItemSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceIconBoxSelected: {
    backgroundColor: '#7C3AED',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  serviceLabelSelected: {
    color: '#7C3AED',
  },
  servicePrice: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }
    })
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scheduleMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  dateRow: {
    paddingBottom: 20,
  },
  dateItem: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateItemSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateLabelSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  dateDaySelected: {
    color: '#FFFFFF',
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  slotPillSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  slotLabelSelected: {
    color: '#7C3AED',
  },
  proceedButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  confirmContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 40,
  },
  webSummaryCard: {
    maxWidth: 500,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#7C3AED',
  },
  doneButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      web: { minWidth: 240 }
    })
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
