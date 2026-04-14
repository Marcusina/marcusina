import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SIDEBAR_WIDTH = 260;
const MOBILE_BREAKPOINT = 768;

export function Layout({ children, currentScreen, onNavigate, userProfile, onLogout }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= MOBILE_BREAKPOINT;

  const navItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'groups', label: 'Groups', icon: 'group' },
    { id: 'place', label: 'Market', icon: 'store' },
    { id: 'consultBook', label: 'Consult', icon: 'medical-services' },
    { id: 'profileHealth', label: 'Profile', icon: 'person' },
  ];

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Image 
          source={require('../assets/marcusina.jpeg')} 
          style={styles.sidebarLogo}
          resizeMode="contain"
        />
      </View>
      <ScrollView style={styles.sidebarNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              currentScreen === item.id && styles.navItemActive,
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <View style={styles.navIconWrapper}>
              <MaterialIcons
                name={item.icon}
                size={22}
                color={currentScreen === item.id ? '#7C3AED' : '#6B7280'}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === item.id && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sidebarFooter}>
        <TouchableOpacity style={styles.userProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0) || 'M'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{userProfile?.name || 'Marcusina'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{userProfile?.email || ''}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutItem} onPress={onLogout}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.bottomNavItem}
          onPress={() => onNavigate(item.id)}
        >
          <MaterialIcons
            name={item.icon}
            size={24}
            color={currentScreen === item.id ? '#7C3AED' : '#9CA3AF'}
          />
          <Text
            style={[
              styles.bottomNavLabel,
              currentScreen === item.id && styles.bottomNavLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {isDesktop && renderSidebar()}
      <View style={styles.mainContent}>
        {isDesktop && (
          <View style={styles.webHeader}>
            <View style={styles.webHeaderContent}>
              <View style={styles.webHeaderLeft}>
                <Text style={styles.webPageTitle}>
                  {navItems.find(i => i.id === currentScreen)?.label || 'Dashboard'}
                </Text>
              </View>
              <View style={styles.webHeaderSearch}>
                <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <Text style={styles.searchPlaceholder}>Search anything...</Text>
              </View>
              <View style={styles.webHeaderActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons name="notifications-none" size={22} color="#4B5563" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons name="shopping-cart" size={22} color="#4B5563" />
                </TouchableOpacity>
                <View style={styles.headerDivider} />
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                  <MaterialIcons name="logout" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerProfileButton}>
                  <View style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>
                      {userProfile?.name?.charAt(0) || 'M'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        <ScrollView
          style={styles.mainArea}
          contentContainerStyle={[
            isDesktop && styles.webMainArea,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.contentContainer,
            isDesktop && styles.webContentContainer
          ]}>
            {children}
          </View>
        </ScrollView>
        {!isDesktop && renderBottomNav()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    display: 'flex',
  },
  sidebarHeader: {
    padding: 24,
    paddingBottom: 32,
  },
  sidebarLogo: {
    width: 140,
    height: 40,
  },
  sidebarNav: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#F5F3FF',
  },
  navIconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  navLabel: {
    marginLeft: 8,
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#FFF1F2',
  },
  logoutLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#7C3AED',
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  mainContent: {
    flex: 1,
    height: '100%',
  },
  webHeader: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  webHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
  },
  webHeaderLeft: {
    flex: 1,
  },
  webPageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  webHeaderSearch: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 32,
    maxWidth: 500,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  webHeaderActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    position: 'relative',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  headerProfileButton: {
    marginLeft: 4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  headerAvatarText: {
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 14,
  },
  mainArea: {
    flex: 1,
  },
  webMainArea: {
    padding: 32,
  },
  contentContainer: {
    flex: 1,
  },
  webContentContainer: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bottomNavLabelActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
});
