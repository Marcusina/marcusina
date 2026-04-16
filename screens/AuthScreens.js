import { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import {
  login as loginApi,
  register as registerApi,
  registerDoctor as registerDoctorApi,
  verifyEmailOtp as verifyEmailOtpApi,
  resendVerificationEmail,
  verifyIdentityByOtp,
} from '../api/auth.api';
import { validate } from '../utils/validator';
import { loginSchema, registerSchema } from '../constants/schemas';

function AppHeaderTitle() {
  return (
    <View style={styles.appHeaderContainer}>
      <Image 
        source={require('../assets/marcusina.jpeg')} 
        style={styles.appLogo}
        resizeMode="contain"
      />
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress} 
      style={[styles.primaryButton, disabled && styles.buttonDisabled]}
      disabled={disabled}
    >
      {typeof label === 'string' ? (
        <Text style={styles.primaryButtonLabel}>{label}</Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );
}

function TextField({ label, placeholder, value, onChangeText, secureTextEntry, error }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        style={[styles.textInput, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function CodeInputRow({ length, values, onChange }) {
  const inputs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const handleTextChange = (text, index) => {
    // Only allow digits
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length > 0) {
      const char = cleanText[cleanText.length - 1];
      const nextValues = [...values];
      nextValues[index] = char;
      onChange(nextValues);

      // Focus next if not at the end
      if (index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      // Handle deletion
      const nextValues = [...values];
      nextValues[index] = '';
      onChange(nextValues);
    }
  };

  const handleKeyPress = (e, index) => {
    // On backspace, focus previous if current is empty
    if (e.nativeEvent.key === 'Backspace' && values[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.codeRow}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          value={values[index]}
          onChangeText={(text) => handleTextChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={1}
          style={[
            styles.codeBox,
            values[index] && styles.codeBoxFilled,
            focusedIndex === index && styles.codeBoxFocused,
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

// Helper function for showing alerts on both web and mobile
function showAlert(title, message, onDismiss = null) {
  if (Platform.OS === 'web') {
    // For web, use a modal-like alert
    alert(`${title}\n\n${message}`);
    if (onDismiss && typeof onDismiss === 'function') {
      onDismiss();
    }
  } else {
    const buttons = onDismiss ? [{ text: 'OK', onPress: onDismiss }] : [{ text: 'OK' }];
    Alert.alert(title, message, buttons);
  }
}

export function LoginScreen({ onSignUp, onLoginSuccess, onEmailVerifyNeeded }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleLogin = async () => {
    const { isValid, errors: validationErrors } = validate(loginSchema.body, { email, password });
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      console.log('[Login] Sending request with:', { email, password });
      const response = await loginApi(email, password);
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      // Extract user and token from response (handle potential nesting in 'data' field)
      const userData = response.user || response.data?.user;
      const userToken = response.token || response.data?.token;

      if (userToken && userData) {
        onLoginSuccess(userData, userToken);
      } else if (response.message === 'Login successful' || response.status === 'success') {
        // If the message says success but data is in an unexpected place, 
        // try to find it or at least proceed if possible
        const fallbackUser = userData || { email };
        const fallbackToken = userToken || 'dummy-token';
        onLoginSuccess(fallbackUser, fallbackToken);
      } else {
        showAlert('Login Failed', response.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error stack:', error.stack);
      // Check if email verification is needed
      if (error.message.includes('Verify your email') || error.message.includes('email verified')) {
        if (onEmailVerifyNeeded) {
          showAlert('Email Verification Required', 'Please verify your email address to continue.', () => {
            onEmailVerifyNeeded(email);
          });
        } else {
          showAlert('Email Verification Required', error.message || 'Please verify your email address to continue.');
        }
      } else if (error.message.includes('New device detected') || error.message.includes('verify with OTP')) {
        setOtpMode(true);
        showAlert('Verification Needed', 'A verification code has been sent to your email. Please enter it below.');
      } else {
        showAlert('Login Error', error.message || 'Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showAlert('Invalid OTP', 'Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyIdentityByOtp(email, otpCode);
      console.log('OTP verification response:', JSON.stringify(response, null, 2));
      
      const userData = response.user || response.data?.user;
      const userToken = response.token || response.data?.token;

      if (userToken && userData) {
        onLoginSuccess(userData, userToken);
      } else if (response.message || response.token) {
        // Some responses might have token but in different structure
        onLoginSuccess({ email }, response.token || 'dummy-token');
      } else {
        showAlert('Verification Failed', response.message || response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showAlert('Verification Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  if (otpMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentMaxWidth}>
            <AppHeaderTitle />
            <View style={styles.loginCard}>
              <Text style={styles.screenTitle}>Verify Your Identity</Text>
              <Text style={styles.screenSubtitle}>
                A verification code has been sent to {email}. Please enter it below.
              </Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Verification Code</Text>
                <CodeInputRow length={6} values={otp} onChange={handleOtpChange} />
                <Text style={styles.otpHelpText}>Enter the 6-digit code</Text>
              </View>
              <PrimaryButton 
                label={loading ? <ActivityIndicator color="#FFF" /> : "Verify"} 
                onPress={handleVerifyOtp} 
                disabled={loading}
              />
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={() => { setOtpMode(false); setOtp(['', '', '', '', '', '']); }}>
                  <Text style={styles.footerLink}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentMaxWidth}>
          <AppHeaderTitle />
          <View style={styles.loginCard}>
            <Text style={styles.screenTitle}>Log In</Text>
            <Text style={styles.screenSubtitle}>
              Welcome back. Your health journey continues here.
            </Text>
            <TextField
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <TextField
              label="Password"
              placeholder="●●●●●●●●"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
            <View style={styles.forgotPasswordRow}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </View>
            <PrimaryButton 
              label={loading ? <ActivityIndicator color="#FFF" /> : "Log In"} 
              onPress={handleLogin} 
              disabled={loading}
            />
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function EmailVerifyScreen({ email, onBack, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyEmail = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      showAlert('Invalid Code', 'Please enter the full 6-digit code from your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailOtpApi(email, otpCode);
      showAlert('Success', 'Email verified successfully!', onVerified);
    } catch (error) {
      console.error('[EmailVerify] Error:', error);
      showAlert('Verification Error', error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await resendVerificationEmail(email);
      showAlert('Code Sent', response.message || 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('[EmailVerify][Resend] Error:', error);
      showAlert('Resend Failed', error.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
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
              Enter the 6-digit verification code sent to {email || 'your email'}.
            </Text>
            <CodeInputRow length={6} values={code} onChange={setCode} />
            <Text style={styles.otpHelpText}>The code expires after a short time, so use the most recent one.</Text>
            <View style={styles.didntReceiveContainer}>
              <Text style={styles.didntReceiveText}>Didn't receive the code?</Text>
              <TouchableOpacity onPress={handleResendCode} disabled={resending}>
                <Text style={styles.resendLink}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <PrimaryButton 
            label={loading ? <ActivityIndicator color="#FFF" /> : "Verify Email"} 
            onPress={handleVerifyEmail} 
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function PhoneVerifyScreen({ onBack, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
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
              Enter the 6-digit code sent via SMS to your phone number.
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
        </View>
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
        <View style={styles.contentMaxWidth}>
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
              Let's start with your legal name for medical records.
              This ensures your data is accurate and secure.
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
          <PrimaryButton label="Next Step" onPress={() => onNext({ name: `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim() })} />
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service.
          </Text>
        </View>
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
        <View style={styles.contentMaxWidth}>
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
              Please provide your contact details. We'll use these to verify your identity
              and keep your health data secure.
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
          <PrimaryButton label="Next Step" onPress={() => onNext({ email, phone })} />
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function LocationStepScreen({ onBack, onComplete }) {
  const [address, setAddress] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
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
              value={address}
              onChangeText={setAddress}
            />
            <View style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>Privacy First</Text>
              <Text style={styles.privacyText}>
                Your location is only used to match you with nearby providers.
                We never share your precise location.
              </Text>
            </View>
          </View>
          <PrimaryButton label="Complete Registration" onPress={() => onComplete({ location: address })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileBasicsScreen({ onBack, onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [gender, setGender] = useState('female');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseAuthority, setLicenseAuthority] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  const handleRegister = async () => {
    const { isValid, errors: validationErrors } = validate(registerSchema.body, { email, password });
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      let response;
      if (role === 'doctor') {
        const doctorData = {
          email,
          password,
          specialization,
          license_number: licenseNumber,
          license_issuing_authority: licenseAuthority,
          license_expiry_date: licenseExpiry, // Expecting YYYY-MM-DD
          years_of_experience: parseInt(yearsOfExperience) || 0,
          consultation_fee: parseFloat(consultationFee) || 0,
        };
        console.log('[Registration] Registering as doctor:', doctorData);
        response = await registerDoctorApi(doctorData);
      } else {
        console.log('[Registration] Registering as patient:', { email });
        response = await registerApi({ email, password });
      }
      
      console.log('[Registration] Success:', response);
      showAlert('Success', 'Registration successful! Please check your email for your 6-digit verification code.', () => {
        onRegisterSuccess({ email, gender, dob, role });
      });
    } catch (error) {
      console.error('[Registration] Error:', error.message);
      console.error('[Registration] Full error:', error);
      const errorMessage = error.message || 'Failed to register';
      showAlert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.contentMaxWidth}>
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
              Join us to transform your healthcare experience.
            </Text>

            <Text style={styles.fieldLabel}>I am a...</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  role === 'patient' && styles.genderOptionSelected,
                ]}
                onPress={() => setRole('patient')}
              >
                <Text style={styles.genderOptionLabel}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  role === 'doctor' && styles.genderOptionSelected,
                ]}
                onPress={() => setRole('doctor')}
              >
                <Text style={styles.genderOptionLabel}>Doctor/Specialist</Text>
              </TouchableOpacity>
            </View>

            <TextField
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            {role === 'doctor' && (
              <View style={{ marginTop: 8 }}>
                <TextField
                  label="Specialization"
                  placeholder="e.g. Cardiology"
                  value={specialization}
                  onChangeText={setSpecialization}
                />
                <TextField
                  label="Medical License Number"
                  placeholder="e.g. DOC123456"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                />
                <TextField
                  label="License Issuing Authority"
                  placeholder="e.g. Medical Board"
                  value={licenseAuthority}
                  onChangeText={setLicenseAuthority}
                />
                <TextField
                  label="License Expiry Date"
                  placeholder="YYYY-MM-DD"
                  value={licenseExpiry}
                  onChangeText={setLicenseExpiry}
                />
                <TextField
                  label="Years of Experience"
                  placeholder="e.g. 10"
                  value={yearsOfExperience}
                  onChangeText={setYearsOfExperience}
                />
                <TextField
                  label="Consultation Fee ($)"
                  placeholder="e.g. 100"
                  value={consultationFee}
                  onChangeText={setConsultationFee}
                />
              </View>
            )}

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
                style={[styles.textInput, errors.password && styles.inputError]}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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
          <PrimaryButton 
            label={loading ? <ActivityIndicator color="#FFF" /> : "Continue"} 
            onPress={handleRegister} 
            disabled={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileCustomizeScreen({ onBack, onNext, onSkip }) {
  const [bio, setBio] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <View style={styles.contentMaxWidth}>
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
          <PrimaryButton label="Next" onPress={() => onNext({ bio })} />
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipForNowText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SuccessScreen({ onGetStarted, role }) {
  const isDoctor = role === 'doctor';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>
          {isDoctor ? "Application Received!" : "You're all set!"}
        </Text>
        <Text style={styles.successSubtitle}>
          {isDoctor 
            ? "Your doctor profile is being reviewed by our medical board. We'll notify you once your account is active."
            : "Your journey to better health starts now."}
        </Text>
        <PrimaryButton 
          label={isDoctor ? "Go to Dashboard" : "Get Started"} 
          onPress={onGetStarted} 
        />
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
    flexGrow: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
      },
    }),
  },
  onboardingContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    flexGrow: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
      },
    }),
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  appHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appLogo: {
    width: 200,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
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
  otpHelpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
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
    justifyContent: 'center',
    gap: 12,
    marginVertical: 24,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  codeBoxFilled: {
    borderColor: '#7C3AED',
  },
  codeBoxFocused: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
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
  linkInfoBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  linkInfoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  didntReceiveContainer: {
    marginTop: 16,
    alignItems: 'center',
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
