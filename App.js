import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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

  let content = null;

  if (screen === 'login') {
    content = (
      <LoginScreen
        onSignUp={() => setScreen('profileBasics')}
        onLogin={() => setScreen('home')}
      />
    );
  } else if (screen === 'profileBasics') {
    content = (
      <ProfileBasicsScreen
        onBack={() => setScreen('login')}
        onNext={() => setScreen('emailVerify')}
      />
    );
  } else if (screen === 'emailVerify') {
    content = (
      <EmailVerifyScreen
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
      />
    );
  } else if (screen === 'profilePublic') {
    content = (
      <PublicProfileScreen
        onBackHome={() => setScreen('home')}
        onEditProfile={() => setScreen('profileEdit')}
      />
    );
  } else if (screen === 'profileEdit') {
    content = (
      <ProfileScreen
        onCancel={() => setScreen('profilePublic')}
        onSave={() => setScreen('profilePublic')}
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

  return <SafeAreaProvider>{content}</SafeAreaProvider>;
}

