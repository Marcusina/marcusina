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

export function HomeScreen({ user, onOpenProfile, onConsult, onOpenGroups, onOpenPlace }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'M';

  return (
    <View style={styles.homeContainer}>
      {!isWeb && (
        <View style={styles.homeHeaderRow}>
          <Image 
            source={require('../assets/marcusina.jpeg')} 
            style={styles.homeLogo}
            resizeMode="contain"
          />
          <View style={styles.homeHeaderRight}>
            <TouchableOpacity onPress={onOpenProfile}>
              <View style={styles.homeAvatar}>
                <Text style={styles.homeAvatarText}>{userInitial}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <MaterialIcons name="shopping-cart" size={24} color="#4B5563" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[
          styles.homeScroll,
          isWeb && styles.webHomeScroll
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.contentMaxWidth,
          isWeb && styles.webContentMaxWidth
        ]}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search medications, vitamins...</Text>
          </View>
          
          <View style={[styles.heroSection, isWeb && styles.webHeroSection]}>
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
            
            {isWeb && (
              <View style={styles.webPromoStats}>
                <View style={styles.statCard}>
                  <MaterialIcons name="local-shipping" size={24} color="#7C3AED" />
                  <Text style={styles.statValue}>2hr</Text>
                  <Text style={styles.statLabel}>Express Delivery</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="verified" size={24} color="#7C3AED" />
                  <Text style={styles.statValue}>100%</Text>
                  <Text style={styles.statLabel}>Genuine Meds</Text>
                </View>
              </View>
            )}
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
              { label: 'Pain Relief', icon: 'healing' },
              { label: 'Vitamins', icon: 'Spa' },
              { label: 'SkinCare', icon: 'face' },
              { label: 'First Aid', icon: 'medical-services' },
              { label: 'Baby', icon: 'child-care' },
            ].map((item) => (
              <View key={item.label} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <MaterialIcons name={item.icon || 'category'} size={24} color="#7C3AED" />
                </View>
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
              <View key={item.name} style={[styles.productCard, isWeb && styles.webProductCard]}>
                <View style={styles.productImagePlaceholder}>
                  <MaterialIcons name="image" size={40} color="#E5E7EB" />
                </View>
                <View style={styles.productBadgeContainer}>
                  <Text style={styles.productBadge}>{item.badge}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productMeta}>{item.meta}</Text>
                <View style={styles.productBottomRow}>
                  <Text style={styles.productPrice}>{item.price}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  homeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  homeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeLogo: {
    width: 110,
    height: 32,
  },
  headerIconButton: {
    marginLeft: 16,
    padding: 4,
    position: 'relative',
  },
  homeAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  homeAvatarText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },
  homeScroll: {
    paddingBottom: 24,
  },
  webHomeScroll: {
    paddingBottom: 40,
  },
  contentMaxWidth: {
    paddingHorizontal: 20,
  },
  webContentMaxWidth: {
    paddingHorizontal: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  heroSection: {
    marginBottom: 24,
  },
  webHeroSection: {
    flexDirection: 'row',
    gap: 20,
  },
  promoCard: {
    flex: 2,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  webPromoStats: {
    flex: 1,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  promoChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  promoChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 20,
    maxWidth: '70%',
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
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
  sectionSeeAll: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryRow: {
    paddingBottom: 8,
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  webProductCard: {
    width: '23%',
  },
  productImagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBadgeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  productBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    height: 40,
  },
  productMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
