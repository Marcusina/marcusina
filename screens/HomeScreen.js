import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export function HomeScreen({ onOpenProfile, onConsult, onOpenGroups, onOpenPlace }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeContainer}>
        <View style={styles.homeHeaderRow}>
          <View style={styles.homeTitleRow}>
            <View style={styles.homeAvatar}>
              <Text style={styles.homeAvatarText}>M</Text>
            </View>
            <Text style={styles.homeBrandText}>Marcusina</Text>
          </View>
          <TouchableOpacity>
            <View style={styles.cartIconWrapper}>
              <Text style={styles.cartIcon}>🛒</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>1</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.homeScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentMaxWidth}>
            <View style={styles.searchBar}>
              <Text style={styles.searchPlaceholder}>Search medications, vitamins...</Text>
            </View>
            <View style={styles.promoCard}>
              <View style={styles.promoChip}>
                <Text style={styles.promoChipText}>QuickProcess</Text>
              </View>
              <Text style={styles.promoTitle}>Upload Prescription</Text>
              <Text style={styles.promoSubtitle}>
                Quick processing & home delivery within 2 hours.
              </Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Upload Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity>
                <Text style={styles.sectionSeeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {[
                { label: 'Pain Relief' },
                { label: 'Vitamins' },
                { label: 'SkinCare' },
                { label: 'First Aid' },
                { label: 'Baby' },
              ].map((item) => (
                <View key={item.label} style={styles.categoryItem}>
                  <View style={styles.categoryCircle} />
                  <Text style={styles.categoryLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <View style={styles.productsGrid}>
              {[
                {
                  badge: 'Best Seller',
                  name: 'Vitality Vitamin C 1000mg',
                  meta: '60 Tablets',
                  price: '$12.99',
                },
                {
                  badge: 'Pain Relief',
                  name: 'Rapid Relief Paracetamol',
                  meta: '24 Caplets',
                  price: '$5.49',
                },
                {
                  badge: '-20%',
                  name: 'Hyaluronic Acid Serum',
                  meta: '30ml Bottle',
                  price: '$24.00',
                },
                {
                  badge: 'Devices',
                  name: 'Digital Thermometer',
                  meta: 'Instant Read',
                  price: '$15.50',
                },
              ].map((item) => (
                <View key={item.name} style={styles.productCard}>
                  <View style={styles.productImagePlaceholder} />
                  <Text style={styles.productBadge}>{item.badge}</Text>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productMeta}>{item.meta}</Text>
                  <View style={styles.productBottomRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <View style={styles.addButton}>
                      <Text style={styles.addButtonText}>＋</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="home" size={22} color="#7C3AED" style={styles.tabIcon} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={onOpenPlace}>
            <MaterialIcons name="place" size={22} color="#9CA3AF" style={styles.tabIcon} />
            <Text style={styles.tabLabel}>Place</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={onOpenGroups}>
            <MaterialIcons name="groups" size={22} color="#9CA3AF" style={styles.tabIcon} />
            <Text style={styles.tabLabel}>Social</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={onOpenProfile}>
            <MaterialIcons name="person" size={22} color="#9CA3AF" style={styles.tabIcon} />
            <Text style={styles.tabLabel}>Profile</Text>
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
  homeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  homeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  homeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  homeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  homeBrandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cartIconWrapper: {
    padding: 4,
  },
  cartIcon: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  homeScroll: {
    paddingHorizontal: 24,
    paddingBottom: 160,
    paddingTop: 16,
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  searchBar: {
    height: 44,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  promoCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#7C3AED',
    marginBottom: 24,
  },
  promoChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
    marginBottom: 12,
  },
  promoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#E5E7EB',
    marginBottom: 16,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FBBF24',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
  sectionSeeAll: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '500',
  },
  categoryRow: {
    paddingVertical: 4,
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 16,
  },
  productImagePlaceholder: {
    height: 96,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  productBadge: {
    fontSize: 11,
    color: '#F97316',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: -2,
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});
