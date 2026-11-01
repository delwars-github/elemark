import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { Badge } from '../../components/common/Badge';

interface SellerProfileScreenProps {
  onOpenNotifications: () => void;
}

export const SellerProfileScreen: React.FC<SellerProfileScreenProps> = ({
  onOpenNotifications,
}) => {
  const {
    user,
    role,
    colors,
    themeMode,
    toggleThemeMode,
    language,
    toggleLanguage,
    switchRole,
    logout,
    t,
  } = useStore();

  const creditLimit = user?.creditLimit || 300000;
  const availableCredit = user?.availableCredit || 195000;
  const usedCredit = creditLimit - availableCredit;
  const usedPercent = Math.round((usedCredit / creditLimit) * 100);

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          logout();
        },
      },
    ]);
  };

  const handleSwitchToCompany = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    switchRole('COMPANY');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.profileTitle}</Text>
        <TouchableOpacity onPress={onOpenNotifications} style={styles.iconBtn}>
          <Feather name="bell" size={moderateScale(20)} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Business Profile Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="store" size={moderateScale(28)} color={colors.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>
                  {user?.businessName || 'Bismillah Hardware'}
                </Text>
                <MaterialCommunityIcons name="check-decagram" size={moderateScale(16)} color={colors.success} />
              </View>
              <Text style={[styles.proprietor, { color: colors.textSecondary }]}>
                {user?.name || 'Al-Haj Rafiqul Islam'} (Proprietor)
              </Text>
              <Text style={[styles.phoneText, { color: colors.secondary }]}>
                {user?.phone}
              </Text>
            </View>
          </View>

          <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metaInfoGrid}>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={moderateScale(14)} color={colors.textSecondary} />
              <Text style={[styles.metaValue, { color: colors.text }]}>{user?.address}</Text>
            </View>
            <View style={styles.metaRow}>
              <Feather name="award" size={moderateScale(14)} color={colors.textSecondary} />
              <Text style={[styles.metaValue, { color: colors.text }]}>Trade Lic: {user?.tradeLicense}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Credit Limit & Khata Status Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.creditCard, { backgroundColor: colors.primary }, shadows.md]}
        >
          <View style={styles.creditHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.creditTitle}>{t.creditLimitNotice}</Text>
              <Text style={styles.creditTotal}>৳{creditLimit.toLocaleString()}</Text>
            </View>
            <Badge label="ACTIVE B2B" variant="accent" size="sm" />
          </View>

          {/* Progress bar */}
          <View style={styles.creditProgressTrack}>
            <View style={[styles.creditProgressBar, { width: `${usedPercent}%` }]} />
          </View>

          <View style={styles.creditFooter}>
            <Text style={styles.creditFooterText}>
              {t.availableLimit}: <Text style={{ color: '#34D399', fontWeight: '800' }}>৳{availableCredit.toLocaleString()}</Text>
            </Text>
            <Text style={styles.creditFooterText}>
              {t.usedLimit}: <Text style={{ color: '#F87171', fontWeight: '800' }}>৳{usedCredit.toLocaleString()}</Text>
            </Text>
          </View>
        </Animated.View>

        {/* Quick Demo Role Switcher */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(400)}
          style={[styles.switchRoleCard, { backgroundColor: 'rgba(255, 183, 3, 0.12)', borderColor: colors.accent }]}
        >
          <View style={{ flex: 1, marginRight: scale(10) }}>
            <Text style={[styles.switchRoleTitle, { color: '#0B1B3A' }]}>
              {t.switchRoleDemo}
            </Text>
            <Text style={[styles.switchRoleSub, { color: colors.textSecondary }]}>
              Currently viewing as: <Text style={{ fontWeight: '800' }}>SELLER (Retailer)</Text>. Switch to Company mode to see product upload and incoming order management.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSwitchToCompany}
            style={[styles.switchRoleBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="factory" size={moderateScale(15)} color={colors.accent} />
            <Text style={styles.switchRoleBtnText}>Switch to Company</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Settings Group */}
        <Animated.View
          entering={FadeInDown.delay(260).duration(400)}
          style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          {/* Language Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Feather name="globe" size={moderateScale(18)} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.language}</Text>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={[styles.langChip, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.langChipText, { color: colors.secondary }]}>
                {language === 'en' ? 'English (Switch to বাংলা)' : 'বাংলা (Switch to EN)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dark Mode Toggle */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Feather name="moon" size={moderateScale(18)} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.darkMode}</Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleThemeMode}
              thumbColor={colors.accent}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* 24/7 Helpline */}
          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Feather name="phone-call" size={moderateScale(18)} color={colors.success} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.helpSupport}</Text>
            </View>
            <Text style={[styles.settingSubtext, { color: colors.success }]}>16210</Text>
          </TouchableOpacity>

          {/* Terms & Privacy */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="shield" size={moderateScale(18)} color={colors.secondary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t.termsConditions}</Text>
            </View>
            <Feather name="chevron-right" size={moderateScale(18)} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <AnimatedButton
          title={t.logout}
          onPress={handleLogout}
          variant="danger"
          size="md"
          style={{ marginTop: verticalScale(14) }}
          icon={<Feather name="log-out" size={moderateScale(16)} color="#FFFFFF" />}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(45),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  iconBtn: {
    padding: scale(6),
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
  profileCard: {
    padding: scale(16),
    borderRadius: radius.xxl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginRight: scale(4),
  },
  proprietor: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  phoneText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  metaDivider: {
    height: 1,
    marginVertical: verticalScale(12),
  },
  metaInfoGrid: {
    gap: verticalScale(6),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaValue: {
    fontSize: moderateScale(11),
    marginLeft: scale(8),
  },
  creditCard: {
    padding: scale(16),
    borderRadius: radius.xxl,
    marginBottom: verticalScale(14),
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  creditTitle: {
    color: '#CBD5E1',
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creditTotal: {
    color: '#FFB703',
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginTop: verticalScale(2),
  },
  creditProgressTrack: {
    height: verticalScale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: verticalScale(10),
  },
  creditProgressBar: {
    height: '100%',
    backgroundColor: '#FFB703',
  },
  creditFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditFooterText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
  },
  switchRoleCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1.5,
    marginBottom: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRoleTitle: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  switchRoleSub: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(3),
    lineHeight: moderateScale(15),
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: radius.md,
  },
  switchRoleBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginLeft: scale(4),
  },
  settingsGroup: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: verticalScale(14),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(13),
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginLeft: scale(12),
  },
  settingSubtext: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  langChip: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: radius.pill,
  },
  langChipText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
});

