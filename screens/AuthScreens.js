import { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

function AppHeaderTitle() {
  return (
    <View style={styles.appHeaderContainer}>
      <View style={styles.appIcon}>
        <Text style={styles.appIconHeart}>♥</Text>
      </View>
      <Text style={styles.appName}>Marcusina</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function TextField({ label, placeholder, value, onChangeText, secureTextEntry }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        style={styles.textInput}
      />
    </View>
  );
}

function CodeInputRow({ length, values, onChange }) {
  return (
    <View style={styles.codeRow}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          value={values[index]}
          onChangeText={(text) => {
            const trimmed = text.slice(-1);
            const next = [...values];
            next[index] = trimmed;
            onChange(next);
          }}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.codeBox,
            values[index] && styles.codeBoxFilled,
          ]}
        />
      ))}
    </View>
  );
}

function StepHeader({ stepIndex, totalSteps, title, showSkip, onBack, onSkip }) {
  const progress = (stepIndex / totalSteps) * 100;

  return (
    <View style={styles.stepHeaderContainer}>
      <View style={styles.stepHeaderTopRow}>
        <TouchableOpacity onPress={onBack} hitSlop={16}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.stepHeaderStepText}>{title}</Text>
        {showSkip ? (
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export function LoginScreen({ onSignUp, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppHeaderTitle />
        <View style={styles.loginCard}>
          <Text style={styles.screenTitle}>Log In</Text>
          <Text style={styles.screenSubtitle}>Welcome back. Your health journey continues here.</Text>
          <TextField
            label="Email"
            placeholder="hello@example.com"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="●●●●●●●●"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.forgotPasswordRow}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </View>
          <PrimaryButton label="Log In" onPress={onLogin} />
          <View style={styles.orRow}>
            <View style={styles.orDivider} />
            <Text style={styles.orText}>OR CONTINUE WITH</Text>
            <View style={styles.orDivider} />
          </View>
          <View style={styles.socialRow}>
            <View style={styles.socialButton}>
              <Text style={styles.socialButtonLabel}>G</Text>
            </View>
            <View style={styles.socialButton}>
              <Text style={styles.socialButtonLabel}></Text>
            </View>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function EmailVerifyScreen({ onBack, onVerified }) {
  const [code, setCode] = useState(['', '', '', '']);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.stepHeaderContainer}>
          <View style={styles.stepHeaderTopRow}>
            <TouchableOpacity onPress={onBack} hitSlop={16}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.stepHeaderStepText}>Step 2 of 3</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.verificationIconWrapper}>
          <View style={styles.verificationIconCircle}>
            <Text style={styles.verificationIconEmoji}>✉️</Text>
          </View>
        </View>
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Verify your email</Text>
          <Text style={styles.screenSubtitle}>
            We sent a 4-digit code to user@email.com. Enter it below to verify your identity.
          </Text>
          <CodeInputRow length={4} values={code} onChange={setCode} />
          <Text style={styles.didntReceiveText}>I didn't receive a code</Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>
        <PrimaryButton label="Verify Email ✓" onPress={onVerified} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function PhoneVerifyScreen({ onBack, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.stepHeaderContainer}>
          <View style={styles.stepHeaderTopRow}>
            <TouchableOpacity onPress={onBack} hitSlop={16}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.stepHeaderStepText}>Step 2 of 3</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.verificationIconWrapper}>
          <View style={[styles.verificationIconCircle, styles.phoneIconCircle]}>
            <Text style={styles.verificationIconEmoji}>📱</Text>
          </View>
        </View>
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Check your phone</Text>
          <Text style={styles.screenSubtitle}>
            Enter the 6-digit code sent via SMS to +1 (555) 123-4567.
          </Text>
          <CodeInputRow length={6} values={code} onChange={setCode} />
          <View style={styles.resendRow}>
            <Text style={styles.didntReceivePrefix}>Didn't receive code?</Text>
            <TouchableOpacity>
              <Text style={styles.resendLinkInline}>Resend SMS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.resendTimerText}>Resend available in 00:24</Text>
        </View>
        <PrimaryButton label="Confirm & Continue" onPress={onVerified} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function NameStepScreen({ onBack, onNext, onSkip }) {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <StepHeader
          stepIndex={1}
          totalSteps={3}
          title="Step 1 of 3"
          showSkip
          onBack={onBack}
          onSkip={onSkip}
        />
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Tell us about yourself</Text>
          <Text style={styles.screenSubtitle}>
            Let's start with your legal name for medical records. This ensures your data is
            accurate and secure.
          </Text>
          <TextField
            label="First Name"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextField
            label="Middle Name"
            placeholder="Middle Name (Optional)"
            value={middleName}
            onChangeText={setMiddleName}
          />
          <TextField
            label="Last Name"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <PrimaryButton label="Next Step" onPress={onNext} />
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ContactStepScreen({ onBack, onNext, onSkip }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <StepHeader
          stepIndex={2}
          totalSteps={3}
          title="Step 2 of 3"
          showSkip
          onBack={onBack}
          onSkip={onSkip}
        />
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Let's stay in touch</Text>
          <Text style={styles.screenSubtitle}>
            Please provide your contact details. We'll use these to verify your identity and keep
            your health data secure.
          </Text>
          <TextField
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Phone Number"
            placeholder="(555) 000-0000"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <PrimaryButton label="Next Step" onPress={onNext} />
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export function LocationStepScreen({ onBack, onComplete }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <StepHeader
          stepIndex={3}
          totalSteps={3}
          title="Final Step"
          showSkip={false}
          onBack={onBack}
        />
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Where are you located?</Text>
          <Text style={styles.screenSubtitle}>
            We use this to find the best health providers near you.
          </Text>
          <View style={styles.locationCard}>
            <View style={styles.locationPlaceholder}>
              <Text style={styles.locationPin}>📍</Text>
            </View>
            <PrimaryButton label="Auto-detect location" onPress={() => {}} />
          </View>
          <Text style={styles.orManualText}>OR ENTER MANUALLY</Text>
          <TextField
            label="Street Address"
            placeholder="Search for your address..."
            value=""
            onChangeText={() => {}}
          />
          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Privacy First</Text>
            <Text style={styles.privacyText}>
              Your location is only used to match you with nearby providers. We never share your
              precise location.
            </Text>
          </View>
        </View>
        <PrimaryButton label="Complete Registration" onPress={onComplete} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileBasicsScreen({ onBack, onNext }) {
  const [gender, setGender] = useState('female');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');

  let strengthScore = 0;
  if (password.length >= 8) strengthScore += 1;
  if (/[A-Z]/.test(password)) strengthScore += 1;
  if (/[0-9]/.test(password)) strengthScore += 1;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore += 1;

  let strengthLabel = 'Weak';
  if (strengthScore >= 3) strengthLabel = 'Medium';
  if (strengthScore === 4) strengthLabel = 'Strong';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.stepHeaderContainer}>
          <View style={styles.stepHeaderTopRow}>
            <TouchableOpacity onPress={onBack} hitSlop={16}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.stepHeaderStepText}>Sign Up</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Profile Basics</Text>
          <Text style={styles.screenSubtitle}>
            This helps us personalize your health plan.
          </Text>
          <Text style={styles.fieldLabel}>Gender Identity</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'male' && styles.genderOptionSelected,
              ]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.genderOptionLabel}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'female' && styles.genderOptionSelected,
              ]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.genderOptionLabel}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                gender === 'other' && styles.genderOptionSelected,
              ]}
              onPress={() => setGender('other')}
            >
              <Text style={styles.genderOptionLabel}>Other</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="mm/dd/yyyy"
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Create Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="●●●●●●●●"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.textInput}
            />
          </View>
          <View style={styles.passwordStrengthRow}>
            <Text style={styles.passwordStrengthLabel}>{strengthLabel} strength</Text>
            <Text style={styles.passwordStrengthCount}>{strengthScore}/4 requirements met</Text>
          </View>
          <View style={styles.passwordStrengthTrack}>
            <View
              style={[
                styles.passwordStrengthFill,
                { width: `${(strengthScore / 4) * 100}%` },
              ]}
            />
          </View>
        </View>
        <PrimaryButton label="Continue" onPress={onNext} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileCustomizeScreen({ onBack, onNext, onSkip }) {
  const [bio, setBio] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <StepHeader
          stepIndex={4}
          totalSteps={4}
          title="Step 4"
          showSkip={false}
          onBack={onBack}
        />
        <View style={styles.onboardingBody}>
          <Text style={styles.screenTitle}>Customize Your Profile</Text>
          <Text style={styles.screenSubtitle}>
            Add a face to your journey. You can always change this later.
          </Text>
          <View style={styles.profileAvatarWrapper}>
            <View style={styles.profileAvatarCircle}>
              <Text style={styles.profileAvatarPlaceholder}>👤</Text>
            </View>
            <View style={styles.profileAvatarPlus}>
              <Text style={styles.profileAvatarPlusText}>＋</Text>
            </View>
          </View>
          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="I'm here to improve my cardio and eat better..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={150}
            style={styles.bioInput}
          />
          <Text style={styles.bioCounter}>{bio.length}/150</Text>
        </View>
        <PrimaryButton label="Next" onPress={onNext} />
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipForNowText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SuccessScreen({ onGetStarted }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>You're all set!</Text>
        <Text style={styles.successSubtitle}>
          Your journey to better health starts now.
        </Text>
        <PrimaryButton label="Get Started" onPress={onGetStarted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  onboardingContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  appHeaderContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appIconHeart: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  loginCard: {
    marginTop: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#F97316',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 8,
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialButtonLabel: {
    fontSize: 22,
    color: '#111827',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
  },
  footerLink: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  stepHeaderContainer: {
    marginBottom: 24,
  },
  stepHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backArrow: {
    fontSize: 20,
    color: '#111827',
  },
  stepHeaderStepText: {
    fontSize: 14,
    color: '#6B7280',
  },
  skipText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#EC4899',
  },
  onboardingBody: {
    marginBottom: 24,
  },
  termsText: {
    marginTop: 12,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  locationCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  locationPlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  locationPin: {
    fontSize: 32,
  },
  orManualText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 1,
  },
  privacyCard: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginTop: 16,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 13,
    color: '#6B7280',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successCheck: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 20,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFilled: {
    borderColor: '#7C3AED',
  },
  verificationIconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconCircle: {
    backgroundColor: '#FEF3C7',
  },
  verificationIconEmoji: {
    fontSize: 40,
  },
  didntReceiveText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  resendLink: {
    marginTop: 4,
    fontSize: 13,
    color: '#F97316',
    fontWeight: '500',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  didntReceivePrefix: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
  },
  resendLinkInline: {
    fontSize: 13,
    color: '#EC4899',
    fontWeight: '500',
  },
  resendTimerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  genderOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3E8FF',
  },
  genderOptionLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  passwordStrengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: '#F97316',
  },
  passwordStrengthCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  passwordStrengthTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
  },
  passwordStrengthFill: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#F97316',
  },
  profileAvatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  profileAvatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarPlaceholder: {
    fontSize: 40,
  },
  profileAvatarPlus: {
    position: 'absolute',
    bottom: 4,
    right: (112 - 56) / 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarPlusText: {
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: -2,
  },
  bioInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  bioCounter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  skipForNowText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});

