import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getCurrentUser } from './api/auth.api';
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

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [regEmail, setRegEmail] = useState('');
  const [profile, setProfile] = useState({
    name: 'Marcus Chen',
    email: 'marcus.chen@healthmail.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    handle: '@marcus_wellness',
    bio: 'Health enthusiast & Tele-med advocate. Sharing my journey towards a balanced lifestyle and clinical insights. 🌿✨',
    bloodType: 'O+',
    height: '182 cm',
    weight: '75 kg',
  });

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setScreen('home');
  };

  console.log('[App] Rendering screen:', screen);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          // If token is invalid, clear it
          if (error.message.includes('Unauthorized') || error.message.includes('token')) {
            setToken(null);
            setUser(null);
            setScreen('login');
          }
        }
      }
    };
    fetchUser();
  }, [token]);

  let content = null;

  if (screen === 'login') {
    content = (
      <LoginScreen
        onSignUp={() => setScreen('profileBasics')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  } else if (screen === 'profileBasics') {
    content = (
      <ProfileBasicsScreen
        onBack={() => setScreen('login')}
        onRegisterSuccess={(email) => {
          setRegEmail(email);
          setScreen('emailVerify');
        }}
      />
    );
  } else if (screen === 'emailVerify') {
    content = (
      <EmailVerifyScreen
        email={regEmail}
        onBack={() => setScreen('profileBasics')}
        onVerified={() => setScreen('phoneVerify')}
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
        onNext={() => setScreen('name')}
        onSkip={() => setScreen('name')}
      />
    );
  } else if (screen === 'name') {
    content = (
      <NameStepScreen
        onBack={() => setScreen('profileCustomize')}
        onNext={() => setScreen('contact')}
        onSkip={() => setScreen('success')}
      />
    );
  } else if (screen === 'contact') {
    content = (
      <ContactStepScreen
        onBack={() => setScreen('name')}
        onNext={() => setScreen('location')}
        onSkip={() => setScreen('success')}
      />
    );
  } else if (screen === 'location') {
    content = (
      <LocationStepScreen
        onBack={() => setScreen('contact')}
        onComplete={() => setScreen('success')}
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
        onSave={(updated) => {
          setProfile(updated);
          setScreen('profilePublic');
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

  return (
    <SafeAreaProvider>
      {content || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading App...</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

