import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { UserRole } from '../../types';
import { useStore } from '../../store/useStore';
import { InputField } from '../../components/common/InputField';
import { AnimatedButton } from '../../components/common/AnimatedButton';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { colors, t, login, signup } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('SELLER');

  // Form states
  const [phone, setPhone] = useState('01712345678');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [tradeLicense, setTradeLicense] = useState('');

  // OTP Modal
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleRole = (targetRole: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRole(targetRole);
    if (targetRole === 'COMPANY') {
      setPhone('01711002233');
      setBusinessName('Super Star Group (SSG)');
    } else {
      setPhone('01712345678');
      setBusinessName('Bismillah Electric & Hardware Store');
    }
  };

  const handleAuthAction = async () => {
    setErrors({});
    if (!phone || phone.length < 10) {
      setErrors({ phone: 'Enter a valid phone number' });
      return;
    }
    if (!password || password.length < 4) {
      setErrors({ password: 'Password must be at least 4 digits' });
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setErrors({ fullName: 'Full name is required' });
        return;
      }
      if (!businessName) {
        setErrors({ businessName: 'Business name is required' });
        return;
      }
      // Trigger OTP verification for signup
      setOtpModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await login(phone, role, businessName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSuccess();
    } catch (e) {
      alert('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 4) {
      alert('Please enter 4-digit verification code');
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: fullName,
        businessName,
        phone,
        email,
        address,
        city,
        tradeLicense,
        role,
      });
      setOtpModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSuccess();
    } catch (e) {
      alert('Signup verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={moderateScale(28)}
              color="#FFB703"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Volt<Text style={{ color: colors.accent }}>Mart</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isLogin ? t.loginSubtitle : t.signupSubtitle}
          </Text>
        </Animated.View>

        {/* Animated Role Toggle: COMPANY vs SELLER */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.roleToggleCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <Text style={[styles.roleSelectTitle, { color: colors.textSecondary }]}>
            {t.selectRole}
          </Text>

          <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundSecondary }]}>
            <TouchableOpacity
              onPress={() => toggleRole('COMPANY')}
              activeOpacity={0.8}
              style={[
                styles.roleOption,
                role === 'COMPANY' && {
                  backgroundColor: colors.primary,
                  borderRadius: radius.lg,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="factory"
                size={moderateScale(18)}
                color={role === 'COMPANY' ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === 'COMPANY' ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                COMPANY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleRole('SELLER')}
              activeOpacity={0.8}
              style={[
                styles.roleOption,
                role === 'SELLER' && {
                  backgroundColor: colors.accent,
                  borderRadius: radius.lg,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="store"
                size={moderateScale(18)}
                color={role === 'SELLER' ? '#0B1B3A' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === 'SELLER' ? '#0B1B3A' : colors.textSecondary },
                ]}
              >
                SELLER (Shopkeeper)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
            {role === 'COMPANY' ? t.roleCompanyDesc : t.roleSellerDesc}
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          {!isLogin ? (
            <>
              <InputField
                label={t.fullName}
                placeholder="e.g. Al-Haj Rafiqul Islam"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                leftIcon={<Feather name="user" size={moderateScale(18)} color={colors.textSecondary} />}
              />

              <InputField
                label={role === 'COMPANY' ? t.businessNameCompany : t.businessNameSeller}
                placeholder={role === 'COMPANY' ? 'e.g. Walton Power Industries' : 'e.g. Bismillah Hardware'}
                value={businessName}
                onChangeText={setBusinessName}
                error={errors.businessName}
                leftIcon={<Feather name="briefcase" size={moderateScale(18)} color={colors.textSecondary} />}
              />
            </>
          ) : null}

          <InputField
            label={t.phone}
            placeholder={t.phonePlaceholder}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            leftIcon={<Feather name="phone" size={moderateScale(18)} color={colors.textSecondary} />}
          />

          {!isLogin ? (
            <>
              <InputField
                label={t.email}
                placeholder="info@business.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                leftIcon={<Feather name="mail" size={moderateScale(18)} color={colors.textSecondary} />}
              />

              <InputField
                label={t.address}
                placeholder="e.g. Nawabpur Electric Market"
                value={address}
                onChangeText={setAddress}
                leftIcon={<Feather name="map-pin" size={moderateScale(18)} color={colors.textSecondary} />}
              />

              <InputField
                label={t.tradeLicense}
                placeholder="TRAD/DNCC/XXXXX"
                value={tradeLicense}
                onChangeText={setTradeLicense}
                leftIcon={<Feather name="award" size={moderateScale(18)} color={colors.textSecondary} />}
              />
            </>
          ) : null}

          <InputField
            label={t.password}
            placeholder="••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
            leftIcon={<Feather name="lock" size={moderateScale(18)} color={colors.textSecondary} />}
          />

          {isLogin ? (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.secondary }]}>
                {t.forgotPassword}
              </Text>
            </TouchableOpacity>
          ) : null}

          <AnimatedButton
            title={isLogin ? t.login : t.signup}
            onPress={handleAuthAction}
            variant="accent"
            size="lg"
            loading={loading}
            style={{ marginTop: verticalScale(14) }}
            icon={<Feather name="arrow-right" size={moderateScale(18)} color="#0B1B3A" />}
            iconPosition="right"
          />

          {/* Toggle between Login and Signup */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {isLogin ? t.noAccount : t.haveAccount}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginLeft: scale(6) }}>
              <Text style={[styles.switchLink, { color: colors.secondary }]}>
                {isLogin ? t.signup : t.login}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.otpModal,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              shadows.lg,
            ]}
          >
            <View style={styles.otpIconBubble}>
              <MaterialCommunityIcons name="cellphone-message" size={moderateScale(32)} color={colors.secondary} />
            </View>

            <Text style={[styles.otpTitle, { color: colors.text }]}>{t.verifyOtp}</Text>
            <Text style={[styles.otpSubtitle, { color: colors.textSecondary }]}>
              {t.otpSentTo} {phone}
            </Text>

            <TextInput
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.secondary,
                  color: colors.text,
                },
              ]}
              placeholder="1234"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              value={otpCode}
              onChangeText={setOtpCode}
              textAlign="center"
            />

            <AnimatedButton
              title={t.verifyAndProceed}
              onPress={handleVerifyOtp}
              variant="accent"
              loading={loading}
              style={{ width: '100%', marginTop: verticalScale(16) }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  iconBadge: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.pill,
    backgroundColor: '#0B1B3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginTop: verticalScale(4),
    paddingHorizontal: scale(20),
  },
  roleToggleCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(16),
  },
  roleSelectTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: scale(4),
    borderRadius: radius.xl,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(8),
  },
  roleText: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    marginLeft: scale(6),
  },
  roleDescription: {
    fontSize: moderateScale(11),
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  formCard: {
    padding: scale(18),
    borderRadius: radius.xxl,
    borderWidth: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(10),
  },
  forgotText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  switchText: {
    fontSize: moderateScale(13),
  },
  switchLink: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  otpModal: {
    width: '100%',
    padding: scale(24),
    borderRadius: radius.xxl,
    alignItems: 'center',
    borderWidth: 1,
  },
  otpIconBubble: {
    width: scale(64),
    height: scale(64),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  otpTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  otpSubtitle: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(16),
  },
  otpInput: {
    width: scale(160),
    height: verticalScale(48),
    borderRadius: radius.lg,
    borderWidth: 2,
    fontSize: moderateScale(22),
    fontWeight: '800',
    letterSpacing: scale(8),
  },
});

