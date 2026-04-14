import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getCurrentUser, updateProfile, getUserProfile, getPatientProfile } from './api/auth.api';
import { getToken, saveToken, removeToken, getProfile, saveProfile } from './utils/storage';
import {
  LoginScreen,
  ProfileBasicsScreen,
  EmailVerifyScreen,
  PhoneVerifyScreen,
  ProfileCustomizeScreen,
  NameStepScreen,
  ContactStepScreen,
  LocationStepScreen,
  SuccessScreen,
} from './screens/AuthScreens';
import { HomeScreen } from './screens/HomeScreen';
import {
  HealthProfileScreen,
  PublicProfileScreen,
  ProfileScreen,
} from './screens/ProfileScreen';
import { GroupsScreen } from './screens/GroupsScreen';
import { PlaceScreen } from './screens/PlaceScreen';
import {
  ConsultBookingScreen,
  ConsultConfirmScreen,
} from './screens/ConsultScreens';
import { Layout } from './components/Layout';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [verificationSource, setVerificationSource] = useState('registration'); // 'registration' or 'login'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [regEmail, setRegEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    handle: '',
    bio: '',
    bloodType: '',
    height: '',
    weight: '',
  });

  // Load saved token and profile on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedToken = await getToken();
        const savedProfile = await getProfile();
        
        if (savedToken) {
          setToken(savedToken);
          setScreen('home');
        }
        
        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (e) {
        console.error('Error loading saved data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedData();
  }, []);

  const handleLoginSuccess = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await saveToken(userToken);
    
    if (userData) {
      const updatedProfile = {
        ...profile,
        name: userData.name || profile.name,
        email: userData.email || profile.email,
        phone: userData.phone || profile.phone,
        location: userData.location || profile.location,
        handle: userData.handle || profile.handle,
        bio: userData.bio || profile.bio,
        bloodType: userData.bloodType || profile.bloodType,
        height: userData.height || profile.height,
        weight: userData.weight || profile.weight,
      };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
    setScreen('home');
  };

  const handleLogout = async () => {
    try {
      setToken(null);
      setUser(null);
      await removeToken();
      setScreen('login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  console.log('[App] Rendering screen:', screen);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
          
          if (userData && userData._id) {
            let fullProfile = { ...profile };
            
            // Fetch User Profile
            try {
              const userProfile = await getUserProfile(token, userData._id);
              if (userProfile) {
                fullProfile = {
                  ...fullProfile,
                  name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
                  bio: userProfile.bio || fullProfile.bio,
                  location: userProfile.location_address || fullProfile.location,
                  email: userData.email || fullProfile.email,
                  phone: userData.phone_number || fullProfile.phone,
                };
              }
            } catch (err) {
              console.log('No user profile found yet or error fetching');
            }

            // Fetch Patient Profile
            try {
              const patientProfile = await getPatientProfile(token, userData._id);
              if (patientProfile) {
                fullProfile = {
                  ...fullProfile,
                  bloodType: patientProfile.blood_group || fullProfile.bloodType,
                  height: patientProfile.height_cm ? patientProfile.height_cm.toString() : fullProfile.height,
                  weight: patientProfile.weight_kg ? patientProfile.weight_kg.toString() : fullProfile.weight,
                };
              }
            } catch (err) {
              console.log('No patient profile found yet or error fetching');
            }

            setProfile(fullProfile);
            await saveProfile(fullProfile);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          if (error.message.includes('Unauthorized') || error.message.includes('token')) {
            setToken(null);
            setUser(null);
            await removeToken();
            setScreen('login');
          }
        }
      }
    };
    fetchUserData();
  }, [token]);

  let content = null;

  if (screen === 'login') {
    content = (
      <LoginScreen
        onSignUp={() => setScreen('profileBasics')}
        onLoginSuccess={handleLoginSuccess}
        onEmailVerifyNeeded={(email) => {
          setRegEmail(email);
          setVerificationSource('login');
          setScreen('emailVerify');
        }}
      />
    );
  } else if (screen === 'profileBasics') {
    content = (
      <ProfileBasicsScreen
        onBack={() => setScreen('login')}
        onRegisterSuccess={(data) => {
          setRegEmail(data.email);
          setVerificationSource('registration');
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen('emailVerify');
        }}
      />
    );
  } else if (screen === 'emailVerify') {
    content = (
      <EmailVerifyScreen
        email={regEmail}
        onBack={() => setScreen(verificationSource === 'login' ? 'login' : 'profileBasics')}
        onVerified={() => {
          if (verificationSource === 'login') {
            // User came from login, go back to login to retry
            setScreen('login');
          } else {
            // User came from registration, proceed to next step
            setScreen('phoneVerify');
          }
        }}
      />
    );
  } else if (screen === 'phoneVerify') {
    content = (
      <PhoneVerifyScreen
        onBack={() => setScreen('emailVerify')}
        onVerified={() => setScreen('profileCustomize')}
      />
    );
  } else if (screen === 'profileCustomize') {
    content = (
      <ProfileCustomizeScreen
        onBack={() => setScreen('phoneVerify')}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen('name');
        }}
        onSkip={() => setScreen('name')}
      />
    );
  } else if (screen === 'name') {
    content = (
      <NameStepScreen
        onBack={() => setScreen('profileCustomize')}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen('contact');
        }}
        onSkip={() => setScreen('success')}
      />
    );
  } else if (screen === 'contact') {
    content = (
      <ContactStepScreen
        onBack={() => setScreen('name')}
        onNext={(data) => {
          const updated = { ...profile, ...data };
          setProfile(updated);
          saveProfile(updated);
          setScreen('location');
        }}
        onSkip={() => setScreen('success')}
      />
    );
  } else if (screen === 'location') {
    content = (
      <LocationStepScreen
        onBack={() => setScreen('contact')}
        onComplete={async (data) => {
          const finalProfile = { ...profile, ...data };
          setProfile(finalProfile);
          await saveProfile(finalProfile);
          try {
            // If we have a token (user is registered/logged in), save to DB
            if (token) {
              await updateProfile(token, finalProfile);
            }
          } catch (error) {
            console.error('Failed to save onboarding data:', error);
          }
          setScreen('success');
        }}
      />
    );
  } else if (screen === 'success') {
    content = <SuccessScreen onGetStarted={() => setScreen('home')} />;
  } else if (screen === 'home') {
    content = (
      <HomeScreen
        user={user}
        onOpenProfile={() => setScreen('profileHealth')}
        onOpenGroups={() => setScreen('groups')}
        onConsult={() => setScreen('consultBook')}
        onOpenPlace={() => setScreen('place')}
      />
    );
  } else if (screen === 'profileHealth') {
    content = (
      <HealthProfileScreen
        onBackHome={() => setScreen('home')}
        onEditProfile={() => setScreen('profileEdit')}
        profile={profile}
        onLogout={handleLogout}
      />
    );
  } else if (screen === 'profilePublic') {
    content = (
      <PublicProfileScreen
        onBackHome={() => setScreen('home')}
        onEditProfile={() => setScreen('profileEdit')}
        profile={profile}
      />
    );
  } else if (screen === 'profileEdit') {
    content = (
      <ProfileScreen
        profile={profile}
        onCancel={() => setScreen('profilePublic')}
        onSave={async (updated) => {
          try {
            if (token) {
              await updateProfile(token, updated);
            }
            setProfile(updated);
            await saveProfile(updated);
            setScreen('profilePublic');
          } catch (error) {
            console.error('Failed to update profile:', error);
            // Handle error (e.g., show an alert)
          }
        }}
      />
    );
  } else if (screen === 'consultBook') {
    content = (
      <ConsultBookingScreen
        onBack={() => setScreen('home')}
        onProceed={() => setScreen('consultConfirm')}
        onGoHome={() => setScreen('home')}
      />
    );
  } else if (screen === 'consultConfirm') {
    content = (
      <ConsultConfirmScreen
        onBack={() => setScreen('consultBook')}
        onDone={() => setScreen('home')}
      />
    );
  } else if (screen === 'groups') {
    content = (
      <GroupsScreen
        onBackHome={() => setScreen('home')}
        onOpenConsult={() => setScreen('consultBook')}
        onOpenProfile={() => setScreen('profileHealth')}
      />
    );
  } else if (screen === 'place') {
    content = (
      <PlaceScreen
        onBackHome={() => setScreen('home')}
        onOpenConsult={() => setScreen('consultBook')}
        onOpenGroups={() => setScreen('groups')}
        onOpenProfile={() => setScreen('profileHealth')}
      />
    );
  }

  const authenticatedScreens = [
    'home',
    'profileHealth',
    'profilePublic',
    'profileEdit',
    'consultBook',
    'consultConfirm',
    'groups',
    'place',
  ];

  const isAuthScreen = authenticatedScreens.includes(screen);

  return (
    <SafeAreaProvider>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Initializing...</Text>
        </View>
      ) : isAuthScreen ? (
        <Layout
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
          userProfile={profile}
          onLogout={handleLogout}
        >
          {content}
        </Layout>
      ) : (
        content || (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading App...</Text>
          </View>
        )
      )}
    </SafeAreaProvider>
  );
}

