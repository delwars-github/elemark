import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { CompanyLedgerSummary, PaymentChannel } from '../../types';
import { useStore } from '../../store/useStore';
import { AnimatedButton } from '../common/AnimatedButton';

interface PayDueModalProps {
  visible: boolean;
  onClose: () => void;
  summary: CompanyLedgerSummary | null;
}

export const PayDueModal: React.FC<PayDueModalProps> = ({
  visible,
  onClose,
  summary,
}) => {
  const { colors, payDueInstallment, t } = useStore();
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('bKash');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!summary) return null;

  const currentDue = summary.totalDue;
  const channels: { key: PaymentChannel; label: string; icon: string }[] = [
    { key: 'bKash', label: 'bKash', icon: 'cellphone' },
    { key: 'Nagad', label: 'Nagad', icon: 'flash' },
    { key: 'Rocket', label: 'Rocket', icon: 'rocket' },
    { key: 'Bank Transfer', label: 'Bank Transfer', icon: 'bank' },
  ];

  const presets = [
    5000,
    10000,
    25000,
    currentDue,
  ].filter(val => val <= currentDue);

  const handleSelectPreset = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAmountStr(String(val));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    if (amount > currentDue) {
      alert(`Payment amount cannot exceed current due (৳${currentDue.toLocaleString()})`);
      return;
    }

    setLoading(true);
    try {
      await payDueInstallment(
        summary.companyId,
        summary.companyName,
        amount,
        selectedChannel
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSuccessMsg(`৳${amount.toLocaleString()} paid successfully via ${selectedChannel}`);
      setTimeout(() => {
        setSuccessMsg(null);
        setAmountStr('');
        setLoading(false);
        onClose();
      }, 1400);
    } catch (e) {
      setLoading(false);
      alert('Payment submission failed');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetWrapper}
            >
              <View
                style={[
                  styles.sheet,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                  shadows.lg,
                ]}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                      {t.payDueTitle}
                    </Text>
                    <Text style={[styles.companySubtitle, { color: colors.secondary }]}>
                      {summary.companyName}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Feather name="x" size={moderateScale(20)} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Due Banner */}
                <View style={[styles.dueBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Text style={[styles.dueBannerLabel, { color: colors.danger }]}>
                    {t.currentDue}
                  </Text>
                  <Text style={[styles.dueBannerValue, { color: colors.danger }]}>
                    ৳{currentDue.toLocaleString()}
                  </Text>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    {t.paymentAmount}
                  </Text>
                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.currSymbol, { color: colors.accent }]}>৳</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      value={amountStr}
                      onChangeText={setAmountStr}
                    />
                  </View>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetsRow}>
                  {presets.map((val, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectPreset(val)}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: amountStr === String(val) ? colors.accent : colors.backgroundSecondary,
                          borderColor: amountStr === String(val) ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          {
                            color: amountStr === String(val) ? '#0B1B3A' : colors.text,
                            fontWeight: amountStr === String(val) ? '800' : '600',
                          },
                        ]}
                      >
                        {val === currentDue ? 'Full Balance' : `৳${val.toLocaleString()}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Channels */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: verticalScale(14) }]}>
                  {t.paymentChannelTitle}
                </Text>

                <View style={styles.channelsGrid}>
                  {channels.map(ch => {
                    const isSelected = selectedChannel === ch.key;
                    return (
                      <TouchableOpacity
                        key={ch.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setSelectedChannel(ch.key);
                        }}
                        style={[
                          styles.channelCard,
                          {
                            backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : colors.backgroundSecondary,
                            borderColor: isSelected ? colors.secondary : colors.border,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={ch.icon as any}
                          size={moderateScale(18)}
                          color={isSelected ? colors.secondary : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.channelLabel,
                            {
                              color: isSelected ? colors.secondary : colors.text,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {ch.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {successMsg ? (
                  <View style={[styles.successBanner, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Feather name="check-circle" size={moderateScale(18)} color={colors.success} />
                    <Text style={[styles.successText, { color: colors.success }]}>
                      {successMsg}
                    </Text>
                  </View>
                ) : null}

                {/* Action button */}
                <AnimatedButton
                  title={t.payNowConfirm}
                  onPress={handleSubmit}
                  variant="accent"
                  loading={loading}
                  style={{ marginTop: verticalScale(16) }}
                  icon={<Feather name="shield" size={moderateScale(16)} color="#0B1B3A" />}
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    padding: scale(18),
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(14),
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  companySubtitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  closeBtn: {
    padding: scale(4),
  },
  dueBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: radius.lg,
    marginBottom: verticalScale(14),
  },
  dueBannerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dueBannerValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: verticalScale(8),
  },
  inputLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(6),
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: scale(14),
    height: verticalScale(48),
  },
  currSymbol: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginRight: scale(8),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: verticalScale(6),
  },
  presetChip: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  presetText: {
    fontSize: moderateScale(11),
  },
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginTop: verticalScale(6),
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  channelLabel: {
    fontSize: moderateScale(12),
    marginLeft: scale(6),
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: radius.md,
    marginTop: verticalScale(12),
  },
  successText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(8),
  },
});

