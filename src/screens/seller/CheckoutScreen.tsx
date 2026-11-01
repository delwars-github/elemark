import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { PaymentMethod, PaymentChannel, Order } from '../../types';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { generateOrderInvoicePdf } from '../../services/invoiceService';

interface CheckoutScreenProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack,
  onOrderSuccess,
}) => {
  const { user, cart, cartTotal, colors, createOrder, t } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('partial');
  const [partialPaidStr, setPartialPaidStr] = useState<string>(
    String(Math.round(cartTotal.total * 0.5)) // Default 50% partial
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('bKash');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    user?.address || 'Shop #14, Nawabpur Electric Market, Dhaka-1100'
  );
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Success modal
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const grandTotal = cartTotal.total;

  // Paid Now vs Remaining Due calculation
  const { paidNow, remainingDue } = React.useMemo(() => {
    if (paymentMethod === 'full') {
      return { paidNow: grandTotal, remainingDue: 0 };
    }
    if (paymentMethod === 'due') {
      return { paidNow: 0, remainingDue: grandTotal };
    }
    // Partial
    const entered = parseFloat(partialPaidStr) || 0;
    const clamped = Math.min(Math.max(0, entered), grandTotal);
    return { paidNow: clamped, remainingDue: grandTotal - clamped };
  }, [paymentMethod, partialPaidStr, grandTotal]);

  const channels: { key: PaymentChannel; label: string; icon: string }[] = [
    { key: 'bKash', label: 'bKash Merchant', icon: 'cellphone' },
    { key: 'Nagad', label: 'Nagad B2B', icon: 'flash' },
    { key: 'Rocket', label: 'Rocket', icon: 'rocket' },
    { key: 'Bank Transfer', label: 'City Bank / BRAC B2B', icon: 'bank' },
    { key: 'Cash on Delivery', label: 'Cash on Transport', icon: 'cash-multiple' },
  ];

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const primaryCompany = cart[0].product;

      const newOrder = await createOrder({
        buyerId: user?.id || 'seller_bismillah',
        buyerName: user?.name || 'Al-Haj Rafiqul Islam',
        buyerShopName: user?.businessName || 'Bismillah Hardware',
        buyerPhone: user?.phone || '01712345678',
        buyerAddress: deliveryAddress,
        companyId: primaryCompany.companyId,
        companyName: primaryCompany.companyName,
        items: cart,
        subtotal: cartTotal.subtotal,
        bulkDiscount: cartTotal.bulkDiscount,
        couponDiscount: 0,
        deliveryCharge: cartTotal.estimatedDelivery,
        vatAmount: cartTotal.estimatedVat,
        totalAmount: grandTotal,
        paidAmount: paidNow,
        dueAmount: remainingDue,
        paymentMethod,
        paymentChannel,
        paymentStatus: paidNow === grandTotal ? 'PAID' : paidNow > 0 ? 'PARTIAL' : 'DUE',
        status: 'placed',
        notes: orderNotes,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSuccessOrder(newOrder);
    } catch (e) {
      alert('Order placement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!successOrder) return;
    try {
      await generateOrderInvoicePdf(successOrder);
    } catch (e) {
      alert('Could not generate PDF invoice');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.checkoutTitle}</Text>
        <View style={{ width: scale(32) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Delivery Address Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={moderateScale(18)} color={colors.secondary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.deliveryAddress}</Text>
          </View>

          <TextInput
            style={[
              styles.addressInput,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={2}
          />
        </Animated.View>

        {/* Payment Structure Selector (Full, Partial, Due/বাকি) */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="credit-card-settings-outline" size={moderateScale(18)} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t.paymentMethodTitle}</Text>
          </View>

          {/* Payment Structure Radio Options */}
          <View style={styles.paymentOptionsList}>
            {/* 100% Full Payment */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setPaymentMethod('full');
              }}
              style={[
                styles.paymentOptionItem,
                {
                  backgroundColor: paymentMethod === 'full' ? 'rgba(37, 99, 235, 0.1)' : colors.backgroundSecondary,
                  borderColor: paymentMethod === 'full' ? colors.secondary : colors.border,
                },
              ]}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, { borderColor: paymentMethod === 'full' ? colors.secondary : colors.textMuted }]}>
                  {paymentMethod === 'full' ? <View style={[styles.radioInner, { backgroundColor: colors.secondary }]} /> : null}
                </View>
                <View style={{ marginLeft: scale(10), flex: 1 }}>
                  <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>{t.fullPayment}</Text>
                  <Text style={[styles.paymentOptionSub, { color: colors.textSecondary }]}>Pay ৳{grandTotal.toLocaleString()} upfront with zero due</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Partial Payment + Due (বাকি) */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setPaymentMethod('partial');
              }}
              style={[
                styles.paymentOptionItem,
                {
                  backgroundColor: paymentMethod === 'partial' ? 'rgba(255, 183, 3, 0.12)' : colors.backgroundSecondary,
                  borderColor: paymentMethod === 'partial' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, { borderColor: paymentMethod === 'partial' ? colors.accent : colors.textMuted }]}>
                  {paymentMethod === 'partial' ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
                </View>
                <View style={{ marginLeft: scale(10), flex: 1 }}>
                  <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>{t.partialPayment}</Text>
                  <Text style={[styles.paymentOptionSub, { color: colors.textSecondary }]}>
                    Pay part now, remainder goes to your Wholesale Ledger (বাকি)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Credit / Full Due (বাকি খাতা) */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setPaymentMethod('due');
              }}
              style={[
                styles.paymentOptionItem,
                {
                  backgroundColor: paymentMethod === 'due' ? 'rgba(239, 68, 68, 0.08)' : colors.backgroundSecondary,
                  borderColor: paymentMethod === 'due' ? colors.danger : colors.border,
                },
              ]}
            >
              <View style={styles.radioRow}>
                <View style={[styles.radioCircle, { borderColor: paymentMethod === 'due' ? colors.danger : colors.textMuted }]}>
                  {paymentMethod === 'due' ? <View style={[styles.radioInner, { backgroundColor: colors.danger }]} /> : null}
                </View>
                <View style={{ marginLeft: scale(10), flex: 1 }}>
                  <Text style={[styles.paymentOptionTitle, { color: colors.text }]}>{t.duePayment}</Text>
                  <Text style={[styles.paymentOptionSub, { color: colors.textSecondary }]}>
                    0 BDT now. Full amount added to your 30-Day B2B Credit Limit
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Partial payment custom input */}
          {paymentMethod === 'partial' ? (
            <Animated.View entering={FadeInDown} style={styles.partialInputBox}>
              <Text style={[styles.partialInputLabel, { color: colors.textSecondary }]}>
                {t.enterPayAmount}
              </Text>
              <View style={[styles.partialInputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Text style={[styles.currSymbol, { color: colors.accent }]}>৳</Text>
                <TextInput
                  style={[styles.partialTextInput, { color: colors.text }]}
                  keyboardType="numeric"
                  value={partialPaidStr}
                  onChangeText={setPartialPaidStr}
                />
              </View>
              <Text style={[styles.dueNoticeText, { color: colors.danger }]}>
                Remaining Due: ৳{remainingDue.toLocaleString()} (Will be added to Manufacturer Khata)
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* Payment Channel Selection */}
        {paymentMethod !== 'due' ? (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
          >
            <View style={styles.cardHeader}>
              <Feather name="credit-card" size={moderateScale(18)} color={colors.secondary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t.paymentChannelTitle}</Text>
            </View>

            <View style={styles.channelsGrid}>
              {channels.map(ch => {
                const isSelected = paymentChannel === ch.key;
                return (
                  <TouchableOpacity
                    key={ch.key}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setPaymentChannel(ch.key);
                    }}
                    style={[
                      styles.channelItem,
                      {
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : colors.backgroundSecondary,
                        borderColor: isSelected ? colors.secondary : colors.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={ch.icon as any}
                      size={moderateScale(20)}
                      color={isSelected ? colors.secondary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.channelName,
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
          </Animated.View>
        ) : null}

        {/* Animated Summary Card: Total, Bulk Discount, Paid Now, Remaining Due */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.animatedSummaryCard, { backgroundColor: '#0B1B3A' }, shadows.md]}
        >
          <View style={styles.goldHeaderRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={moderateScale(20)} color="#FFB703" />
            <Text style={styles.goldHeaderTitle}>WHOLESALE PAYMENT BREAKDOWN</Text>
          </View>

          <View style={styles.summaryBreakdownRow}>
            <Text style={styles.breakdownLabel}>Total Order Amount:</Text>
            <Text style={styles.breakdownVal}>৳{grandTotal.toLocaleString()}</Text>
          </View>

          {cartTotal.bulkDiscount > 0 ? (
            <View style={styles.summaryBreakdownRow}>
              <Text style={styles.breakdownLabel}>Bulk Discount (5%):</Text>
              <Text style={[styles.breakdownVal, { color: '#34D399' }]}>
                -৳{cartTotal.bulkDiscount.toLocaleString()}
              </Text>
            </View>
          ) : null}

          <View style={styles.goldDivider} />

          <View style={styles.summaryBreakdownRow}>
            <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#FFFFFF' }]}>
              {t.paidNow}:
            </Text>
            <Text style={[styles.breakdownVal, { color: '#34D399', fontWeight: '900', fontSize: moderateScale(16) }]}>
              ৳{paidNow.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryBreakdownRow}>
            <Text style={[styles.breakdownLabel, { fontWeight: '700', color: '#CBD5E1' }]}>
              {t.remainingDue}:
            </Text>
            <Text
              style={[
                styles.breakdownVal,
                { color: remainingDue > 0 ? '#F87171' : '#94A3B8', fontWeight: '900', fontSize: moderateScale(16) },
              ]}
            >
              ৳{remainingDue.toLocaleString()}
            </Text>
          </View>
        </Animated.View>

        {/* Order Notes */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: verticalScale(6) }]}>
            Special Instructions / Courier Notes
          </Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
            placeholder="e.g. Please deliver via Sundarban Courier, Nawabpur branch"
            placeholderTextColor={colors.textMuted}
            value={orderNotes}
            onChangeText={setOrderNotes}
          />
        </View>

        {/* Submit Order Button */}
        <AnimatedButton
          title={t.confirmOrder}
          onPress={handleConfirmOrder}
          variant="accent"
          size="lg"
          loading={loading}
          style={{ marginTop: verticalScale(14) }}
          icon={<Feather name="check-circle" size={moderateScale(18)} color="#0B1B3A" />}
        />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={!!successOrder}
        transparent
        animationType="fade"
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.successModal, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.lg]}>
            <View style={styles.successIconBubble}>
              <MaterialCommunityIcons name="check-decagram" size={moderateScale(56)} color={colors.success} />
            </View>

            <Text style={[styles.successTitle, { color: colors.text }]}>
              {t.orderSuccessTitle}
            </Text>
            <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
              {t.orderSuccessDesc}
            </Text>

            {successOrder ? (
              <View style={[styles.invoiceInfoBox, { backgroundColor: colors.backgroundSecondary }]}>
                <Text style={[styles.invoiceNo, { color: colors.text }]}>
                  Order #{successOrder.orderNumber}
                </Text>
                <Text style={[styles.invoiceCompany, { color: colors.secondary }]}>
                  Supplier: {successOrder.companyName}
                </Text>
                <Text style={[styles.invoiceAmount, { color: colors.accent }]}>
                  Total: ৳{successOrder.totalAmount.toLocaleString()}
                </Text>
              </View>
            ) : null}

            <AnimatedButton
              title={t.downloadInvoice}
              onPress={handleDownloadInvoice}
              variant="outline"
              size="md"
              style={{ width: '100%', marginBottom: verticalScale(10) }}
              icon={<Feather name="download" size={moderateScale(16)} color={colors.text} />}
            />

            <AnimatedButton
              title={t.trackOrder}
              onPress={() => {
                const order = successOrder;
                setSuccessOrder(null);
                if (order) onOrderSuccess(order);
              }}
              variant="accent"
              size="lg"
              style={{ width: '100%' }}
              icon={<Feather name="arrow-right" size={moderateScale(18)} color="#0B1B3A" />}
              iconPosition="right"
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
  backBtn: {
    padding: scale(6),
  },
  topBarTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(60),
  },
  card: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  cardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  addressInput: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: scale(10),
    fontSize: moderateScale(13),
  },
  paymentOptionsList: {
    gap: verticalScale(8),
  },
  paymentOptionItem: {
    padding: scale(12),
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: scale(20),
    height: scale(20),
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: scale(10),
    height: scale(10),
    borderRadius: radius.pill,
  },
  paymentOptionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  paymentOptionSub: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  partialInputBox: {
    marginTop: verticalScale(12),
  },
  partialInputLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  partialInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: scale(12),
    height: verticalScale(44),
  },
  currSymbol: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginRight: scale(6),
  },
  partialTextInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  dueNoticeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginTop: verticalScale(6),
  },
  channelsGrid: {
    gap: verticalScale(8),
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  channelName: {
    fontSize: moderateScale(13),
    marginLeft: scale(10),
  },
  animatedSummaryCard: {
    borderRadius: radius.xxl,
    padding: scale(16),
    marginBottom: verticalScale(14),
  },
  goldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  goldHeaderTitle: {
    color: '#FFB703',
    fontSize: moderateScale(12),
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: scale(6),
  },
  summaryBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  breakdownLabel: {
    color: '#CBD5E1',
    fontSize: moderateScale(12),
  },
  breakdownVal: {
    color: '#FFFFFF',
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  goldDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: verticalScale(8),
  },
  notesInput: {
    borderRadius: radius.lg,
    padding: scale(10),
    fontSize: moderateScale(12),
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  successModal: {
    width: '100%',
    padding: scale(24),
    borderRadius: radius.xxl,
    alignItems: 'center',
    borderWidth: 1,
  },
  successIconBubble: {
    marginBottom: verticalScale(12),
  },
  successTitle: {
    fontSize: moderateScale(20),
    fontWeight: '900',
    textAlign: 'center',
  },
  successDesc: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginTop: verticalScale(6),
    lineHeight: moderateScale(18),
  },
  invoiceInfoBox: {
    width: '100%',
    padding: scale(12),
    borderRadius: radius.lg,
    alignItems: 'center',
    marginVertical: verticalScale(16),
  },
  invoiceNo: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  invoiceCompany: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  invoiceAmount: {
    fontSize: moderateScale(16),
    fontWeight: '900',
    marginTop: verticalScale(4),
  },
});

