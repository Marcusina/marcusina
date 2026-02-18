import { useState } from 'react';
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

  if (screen === 'login') {
    return (
      <LoginScreen
        onSignUp={() => setScreen('profileBasics')}
        onLogin={() => setScreen('home')}
      />
    );
  }

  if (screen === 'profileBasics') {
    return (
      <ProfileBasicsScreen
        onBack={() => setScreen('login')}
        onNext={() => setScreen('emailVerify')}
      />
    );
  }

  if (screen === 'emailVerify') {
    return (
      <EmailVerifyScreen
        onBack={() => setScreen('profileBasics')}
        onVerified={() => setScreen('phoneVerify')}
      />
    );
  }

  if (screen === 'phoneVerify') {
    return (
      <PhoneVerifyScreen
        onBack={() => setScreen('emailVerify')}
        onVerified={() => setScreen('profileCustomize')}
      />
    );
  }

  if (screen === 'profileCustomize') {
    return (
      <ProfileCustomizeScreen
        onBack={() => setScreen('phoneVerify')}
        onNext={() => setScreen('name')}
        onSkip={() => setScreen('name')}
      />
    );
  }

  if (screen === 'name') {
    return (
      <NameStepScreen
        onBack={() => setScreen('profileCustomize')}
        onNext={() => setScreen('contact')}
        onSkip={() => setScreen('success')}
      />
    );
  }

  if (screen === 'contact') {
    return (
      <ContactStepScreen
        onBack={() => setScreen('name')}
        onNext={() => setScreen('location')}
        onSkip={() => setScreen('success')}
      />
    );
  }

  if (screen === 'location') {
    return (
      <LocationStepScreen
        onBack={() => setScreen('contact')}
        onComplete={() => setScreen('success')}
      />
    );
  }

  if (screen === 'success') {
    return <SuccessScreen onGetStarted={() => setScreen('home')} />;
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        onOpenProfile={() => setScreen('profileHealth')}
        onOpenGroups={() => setScreen('groups')}
        onConsult={() => setScreen('consultBook')}
        onOpenPlace={() => setScreen('place')}
      />
    );
  }

  if (screen === 'profileHealth') {
    return (
      <HealthProfileScreen
        onBackHome={() => setScreen('home')}
        onEditProfile={() => setScreen('profileEdit')}
      />
    );
  }

  if (screen === 'profilePublic') {
    return (
      <PublicProfileScreen
        onBackHome={() => setScreen('home')}
        onEditProfile={() => setScreen('profileEdit')}
      />
    );
  }

  if (screen === 'profileEdit') {
    return (
      <ProfileScreen
        onCancel={() => setScreen('profilePublic')}
        onSave={() => setScreen('profilePublic')}
      />
    );
  }

  if (screen === 'consultBook') {
    return (
      <ConsultBookingScreen
        onBack={() => setScreen('home')}
        onProceed={() => setScreen('consultConfirm')}
        onGoHome={() => setScreen('home')}
      />
    );
  }

  if (screen === 'consultConfirm') {
    return (
      <ConsultConfirmScreen
        onBack={() => setScreen('consultBook')}
        onDone={() => setScreen('home')}
      />
    );
  }

  if (screen === 'groups') {
    return (
      <GroupsScreen
        onBackHome={() => setScreen('home')}
        onOpenConsult={() => setScreen('consultBook')}
        onOpenProfile={() => setScreen('profileHealth')}
      />
    );
  }

  if (screen === 'place') {
    return (
      <PlaceScreen
        onBackHome={() => setScreen('home')}
        onOpenConsult={() => setScreen('consultBook')}
        onOpenGroups={() => setScreen('groups')}
        onOpenProfile={() => setScreen('profileHealth')}
      />
    );
  }

  return null;
}

