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
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getMedications, getCart, addToCart } from '../api/meds.api';
import { useTheme } from '../context/ThemeContext';

export function HomeScreen({ user, token, onOpenProfile, onConsult, onOpenGroups, onOpenPlace }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'M';

  const [medications, setMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const fetchMedications = useCallback(async (search = '', category = null) => {
    if (!token) return;
    try {
      setIsSearching(true);
      const query = category || search;
      const response = await getMedications(token, { search: query });
      setMedications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [token]);

  const fetchCartCount = useCallback(async () => {
    if (!token) return;
    try {
      const cart = await getCart(token);
      const count = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchMedications();
    fetchCartCount();
  }, [fetchMedications, fetchCartCount]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setSelectedCategory(null);
    fetchMedications(text, null);
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      fetchMedications(searchQuery, null);
    } else {
      setSelectedCategory(category);
      fetchMedications('', category);
    }
  };

  const handleAddToCart = async (medicationId) => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to add items to cart');
      return;
    }
    try {
      await addToCart(token, medicationId, 1);
      fetchCartCount();
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add item to cart');
    }
  };

  const handleUploadPrescription = () => {
    Alert.alert('Coming Soon', 'Prescription upload will be available in the next update.');
  };

  const categories = [
    { label: 'Pain Relief', icon: 'healing', value: 'Analgesic' },
    { label: 'Vitamins', icon: 'spa', value: 'Vitamin' },
    { label: 'Antibiotics', icon: 'biotech', value: 'Antibiotic' },
    { label: 'First Aid', icon: 'medical-services', value: 'First Aid' },
    { label: 'Baby', icon: 'child-care', value: 'Baby' },
  ];

  return (
    <View style={styles.homeContainer}>
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
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications, vitamins..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
            {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
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
              <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPrescription}>
                <Text style={styles.uploadButtonText}>Upload Now</Text>
              </TouchableOpacity>
            </View>
            
            {isWeb && (
              <View style={styles.webPromoStats}>
                <View style={styles.statCard}>
                  <MaterialIcons name="local-shipping" size={24} color={theme.primary} />
                  <Text style={styles.statValue}>2hr</Text>
                  <Text style={styles.statLabel}>Express Delivery</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="verified" size={24} color={theme.primary} />
                  <Text style={styles.statValue}>100%</Text>
                  <Text style={styles.statLabel}>Genuine Meds</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => handleCategorySelect(null)}>
              <Text style={styles.sectionSeeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((item) => (
              <TouchableOpacity 
                key={item.label} 
                style={[
                  styles.categoryItem,
                  selectedCategory === item.value && styles.categoryItemActive
                ]}
                onPress={() => handleCategorySelect(item.value)}
              >
                <View style={[
                  styles.categoryCircle,
                  selectedCategory === item.value && styles.categoryCircleActive
                ]}>
                  <MaterialIcons 
                    name={item.icon || 'category'} 
                    size={24} 
                    color={selectedCategory === item.value ? "#FFFFFF" : theme.primary} 
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === item.value && styles.categoryLabelActive
                ]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory} Products` : searchQuery ? 'Search Results' : 'Popular Products'}
          </Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : medications.length > 0 ? (
            <View style={styles.productsGrid}>
              {medications.map((item) => (
                <View key={item._id} style={[styles.productCard, isWeb && styles.webProductCard]}>
                  <View style={styles.productImagePlaceholder}>
                    {item.image_url && item.image_url.length > 0 ? (
                      <Image 
                        source={{ uri: item.image_url[0].url }} 
                        style={styles.productImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcons name="image" size={40} color="#E5E7EB" />
                    )}
                  </View>
                  <View style={styles.productBadgeContainer}>
                    <Text style={styles.productBadge}>
                      {item.requires_prescription ? 'Prescription Req.' : 'OTC'}
                    </Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{item.medication_name}</Text>
                  <Text style={styles.productMeta}>{item.generic_name}</Text>
                  <View style={styles.productBottomRow}>
                    <Text style={styles.productPrice}>$10.00</Text> 
                    <TouchableOpacity 
                      style={styles.addButton} 
                      onPress={() => handleAddToCart(item._id)}
                    >
                      <MaterialIcons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No medications found.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  homeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.error,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  homeAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primaryLight,
  },
  homeAvatarText: {
    color: theme.primary,
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
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
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
    backgroundColor: theme.primary,
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
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
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
    color: theme.primary,
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
    color: theme.text,
  },
  sectionSeeAll: {
    color: theme.primary,
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
    backgroundColor: theme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.primaryLight,
  },
  categoryCircleActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  productCard: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  webProductCard: {
    width: '23%',
  },
  productImagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: theme.background,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadgeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  productBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primary,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    height: 40,
  },
  productMeta: {
    fontSize: 12,
    color: theme.textMuted,
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
    color: theme.text,
  },
  addButton: {
    backgroundColor: theme.primary,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyText: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 16,
  },
});
