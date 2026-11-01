import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { SellerLedgerSummary } from '../../types';

export const CompanyLedgerScreen: React.FC = () => {
  const {
    companyTotalRevenue,
    companyTotalDueReceivable,
    companyOrders,
    payDueInstallment,
    user,
    colors,
    t,
  } = useStore();

  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerLedgerSummary | null>(null);
  const [offlineAmountStr, setOfflineAmountStr] = useState('');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Group seller dues from company orders
  const sellerSummaries: SellerLedgerSummary[] = React.useMemo(() => {
    const map: Record<string, SellerLedgerSummary> = {};

    companyOrders.forEach(o => {
      if (!map[o.buyerId]) {
        map[o.buyerId] = {
          buyerId: o.buyerId,
          buyerShopName: o.buyerShopName,
          buyerName: o.buyerName,
          buyerPhone: o.buyerPhone,
          totalPurchased: 0,
          totalPaid: 0,
          totalDue: 0,
          lastPaymentDate: o.createdAt,
          orderCount: 0,
        };
      }
      map[o.buyerId].totalPurchased += o.totalAmount;
      map[o.buyerId].totalPaid += o.paidAmount;
      map[o.buyerId].totalDue += o.dueAmount;
      map[o.buyerId].orderCount += 1;
    });

    return Object.values(map);
  }, [companyOrders]);

  const handleSendReminder = (seller: SellerLedgerSummary) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setReminderToast(`Payment reminder sent via SMS to ${seller.buyerShopName} (${seller.buyerPhone})`);
    setTimeout(() => setReminderToast(null), 2500);
  };

  const handleRecordOfflinePayment = async () => {
    const amount = parseFloat(offlineAmountStr);
    if (isNaN(amount) || amount <= 0 || !selectedSeller) {
      alert('Please enter valid amount');
      return;
    }

    try {
      await payDueInstallment(
        user?.id || 'comp_superstar',
        user?.businessName || 'Super Star Group (SSG)',
        amount,
        'Cash on Delivery'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRecordModalVisible(false);
      setOfflineAmountStr('');
      alert(`Recorded offline payment of ৳${amount.toLocaleString()} from ${selectedSeller.buyerShopName}`);
    } catch (e) {
      alert('Failed to record payment');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t.retailerLedgers} ({sellerSummaries.length})
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Overall Due & Revenue Overview */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.statsGrid}>
          <StatCard
            title="Total Revenue Collected"
            value={companyTotalRevenue}
            icon={<MaterialCommunityIcons name="cash-check" size={moderateScale(20)} color={colors.success} />}
            iconBgColor="rgba(16, 185, 129, 0.12)"
            highlightColor={colors.success}
            style={{ flex: 1, minWidth: scale(140) }}
          />

          <StatCard
            title={t.totalReceivableDue}
            value={companyTotalDueReceivable}
            icon={<MaterialCommunityIcons name="clock-alert-outline" size={moderateScale(20)} color={colors.danger} />}
            iconBgColor="rgba(239, 68, 68, 0.12)"
            highlightColor={colors.danger}
            style={{ flex: 1, minWidth: scale(140) }}
          />
        </Animated.View>

        {/* Reminder notification toast */}
        {reminderToast ? (
          <View style={[styles.toast, { backgroundColor: colors.primary }]}>
            <Feather name="bell" size={moderateScale(16)} color="#FFB703" />
            <Text style={styles.toastText}>{reminderToast}</Text>
          </View>
        ) : null}

        {/* List of Retailers Dues */}
        <Text style={[styles.sectionHeading, { color: colors.text, marginTop: verticalScale(10) }]}>
          Retailer Accounts & Outstanding Dues (বাকি)
        </Text>

        {sellerSummaries.map((seller, idx) => {
          const hasDue = seller.totalDue > 0;
          return (
            <Animated.View
              key={seller.buyerId}
              entering={FadeInDown.delay(idx * 70).duration(400)}
              style={[
                styles.sellerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: hasDue ? 'rgba(239, 68, 68, 0.25)' : colors.cardBorder,
                },
                shadows.sm,
              ]}
            >
              <View style={styles.sellerHeader}>
                <View style={styles.sellerLeft}>
                  <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="store" size={moderateScale(20)} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sellerShop, { color: colors.text }]} numberOfLines={1}>
                      {seller.buyerShopName}
                    </Text>
                    <Text style={[styles.sellerProp, { color: colors.textSecondary }]}>
                      {seller.buyerName} • {seller.buyerPhone}
                    </Text>
                  </View>
                </View>

                <Badge
                  label={hasDue ? `Due: ৳${seller.totalDue.toLocaleString()}` : 'Cleared'}
                  variant={hasDue ? 'due' : 'paid'}
                  size="sm"
                />
              </View>

              {/* Financial Breakdown */}
              <View style={[styles.financialGrid, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.finCol}>
                  <Text style={[styles.finColLabel, { color: colors.textSecondary }]}>Purchased</Text>
                  <Text style={[styles.finColVal, { color: colors.text }]}>
                    ৳{seller.totalPurchased.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.finDivider, { backgroundColor: colors.border }]} />

                <View style={styles.finCol}>
                  <Text style={[styles.finColLabel, { color: colors.textSecondary }]}>Collected</Text>
                  <Text style={[styles.finColVal, { color: colors.success }]}>
                    ৳{seller.totalPaid.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.finDivider, { backgroundColor: colors.border }]} />

                <View style={styles.finCol}>
                  <Text style={[styles.finColLabel, { color: hasDue ? colors.danger : colors.textSecondary }]}>
                    Due (বাকি)
                  </Text>
                  <Text style={[styles.finColVal, { color: hasDue ? colors.danger : colors.text }]}>
                    ৳{seller.totalDue.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Actions Footer */}
              <View style={[styles.actionsFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => handleSendReminder(seller)}
                  style={[styles.actionBtn, { backgroundColor: colors.backgroundSecondary }]}
                  activeOpacity={0.8}
                >
                  <Feather name="bell" size={moderateScale(14)} color={colors.secondary} />
                  <Text style={[styles.actionBtnText, { color: colors.secondary }]}>Send Due Reminder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedSeller(seller);
                    setRecordModalVisible(true);
                  }}
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                  activeOpacity={0.8}
                >
                  <Feather name="plus-circle" size={moderateScale(14)} color="#0B1B3A" />
                  <Text style={[styles.actionBtnText, { color: '#0B1B3A' }]}>Record Payment</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Record Offline Payment Modal */}
      <Modal
        visible={recordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.recordModalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Record Offline Cash Payment</Text>
              <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
                <Feather name="x" size={moderateScale(20)} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sellerTargetName, { color: colors.secondary }]}>
              {selectedSeller?.buyerShopName} ({selectedSeller?.buyerName})
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Cash Received Amount (৳)
            </Text>

            <View style={[styles.amountInputBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
              <Text style={[styles.currPrefix, { color: colors.accent }]}>৳</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                keyboardType="numeric"
                placeholder="5000"
                placeholderTextColor={colors.textMuted}
                value={offlineAmountStr}
                onChangeText={setOfflineAmountStr}
              />
            </View>

            <AnimatedButton
              title="Record & Update Khata"
              onPress={handleRecordOfflinePayment}
              variant="accent"
              size="lg"
              style={{ marginTop: verticalScale(16) }}
            />
          </View>
        </View>
      </Modal>
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
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
  statsGrid: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: verticalScale(14),
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: radius.md,
    marginBottom: verticalScale(12),
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(8),
    flex: 1,
  },
  sectionHeading: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginBottom: verticalScale(10),
  },
  sellerCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(8),
  },
  sellerAvatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  sellerShop: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  sellerProp: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  financialGrid: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(6),
    marginBottom: verticalScale(10),
  },
  finCol: {
    flex: 1,
    alignItems: 'center',
  },
  finDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  finColLabel: {
    fontSize: moderateScale(9),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  finColVal: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    marginTop: verticalScale(2),
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scale(8),
    borderTopWidth: 1,
    paddingTop: verticalScale(8),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.md,
  },
  actionBtnText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(4),
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  recordModalCard: {
    width: '100%',
    padding: scale(20),
    borderRadius: radius.xxl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  sellerTargetName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(6),
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: scale(12),
    height: verticalScale(46),
  },
  currPrefix: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginRight: scale(6),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

