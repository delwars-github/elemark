import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { CartItem } from '../../types';

interface CartScreenProps {
  onProceedCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onProceedCheckout,
  onExploreProducts,
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    colors,
    t,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'VOLT500' || couponCode.toUpperCase() === 'ELECTRO5') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCouponApplied(true);
    } else {
      alert('Invalid Promo Code. Try "VOLT500"');
    }
  };

  // Group cart items by company
  const companyGroups = React.useMemo(() => {
    const groups: Record<string, { companyName: string; items: CartItem[] }> = {};
    cart.forEach(item => {
      const cId = item.product.companyId;
      if (!groups[cId]) {
        groups[cId] = {
          companyName: item.product.companyName,
          items: [],
        };
      }
      groups[cId].items.push(item);
    });
    return Object.values(groups);
  }, [cart]);

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.cartTitle}</Text>
        </View>

        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
            <MaterialCommunityIcons name="cart-off" size={moderateScale(54)} color={colors.secondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.cartEmpty}</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            {t.cartEmptyDesc}
          </Text>
          <AnimatedButton
            title="Browse Electrical Catalog"
            onPress={onExploreProducts}
            variant="accent"
            size="lg"
            style={{ marginTop: verticalScale(20), width: '80%' }}
            icon={<Feather name="grid" size={moderateScale(18)} color="#0B1B3A" />}
          />
        </View>
      </View>
    );
  }

  const finalTotal = cartTotal.total - (couponApplied ? 500 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t.cartTitle} ({cart.length})
        </Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Company Grouped Items */}
        {companyGroups.map((group, gIdx) => (
          <Animated.View
            key={gIdx}
            entering={FadeInDown.delay(gIdx * 70).duration(400)}
            style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
          >
            {/* Company Header */}
            <View style={[styles.groupHeader, { borderBottomColor: colors.border }]}>
              <MaterialCommunityIcons name="factory" size={moderateScale(18)} color={colors.secondary} />
              <Text style={[styles.groupCompanyName, { color: colors.text }]} numberOfLines={1}>
                {group.companyName}
              </Text>
            </View>

            {/* Items inside group */}
            {group.items.map((item, iIdx) => (
              <View
                key={item.product.id}
                style={[
                  styles.cartItemRow,
                  iIdx < group.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
              >
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={styles.itemImg}
                  resizeMode="cover"
                />

                <View style={styles.itemDetails}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.product.title}
                  </Text>

                  <Text style={[styles.itemPrice, { color: colors.secondary }]}>
                    ৳{item.product.wholesalePrice.toLocaleString()} / {item.product.unitType}
                  </Text>

                  {/* MOQ Notice */}
                  <Text style={[styles.moqText, { color: colors.textMuted }]}>
                    {t.moqNoticeShort} {item.product.moq} {item.product.unitType}s
                  </Text>

                  {/* Quantity Stepper & Subtotal */}
                  <View style={styles.itemBottomRow}>
                    <View style={styles.stepperBox}>
                      <TouchableOpacity
                        onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        style={[styles.stepBtn, { backgroundColor: colors.backgroundSecondary }]}
                      >
                        <Feather name="minus" size={moderateScale(14)} color={colors.text} />
                      </TouchableOpacity>

                      <Text style={[styles.stepVal, { color: colors.text }]}>
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        style={[styles.stepBtn, { backgroundColor: colors.accent }]}
                      >
                        <Feather name="plus" size={moderateScale(14)} color="#0B1B3A" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                        ৳{item.subtotal.toLocaleString()}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        style={styles.deleteBtn}
                      >
                        <Feather name="trash-2" size={moderateScale(14)} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        ))}

        {/* Promo / Coupon Box */}
        <View style={[styles.couponCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="tag" size={moderateScale(18)} color={colors.accent} style={{ marginRight: scale(8) }} />
          <TextInput
            style={[styles.couponInput, { color: colors.text }]}
            placeholder={t.couponCode}
            placeholderTextColor={colors.textMuted}
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={handleApplyCoupon}
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.applyBtnText}>{t.applyCoupon}</Text>
          </TouchableOpacity>
        </View>

        {couponApplied ? (
          <View style={[styles.couponSuccessPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Feather name="check" size={moderateScale(14)} color={colors.success} />
            <Text style={[styles.couponSuccessText, { color: colors.success }]}>
              Promo VOLT500 Applied! ৳500 Bulk Discount
            </Text>
          </View>
        ) : null}

        {/* Order Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{t.orderSummary}</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.subtotal}</Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              ৳{cartTotal.subtotal.toLocaleString()}
            </Text>
          </View>

          {cartTotal.bulkDiscount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>{t.bulkDiscount} (5%)</Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>
                -৳{cartTotal.bulkDiscount.toLocaleString()}
              </Text>
            </View>
          ) : null}

          {couponApplied ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Coupon Discount</Text>
              <Text style={[styles.summaryVal, { color: colors.success }]}>-৳500</Text>
            </View>
          ) : null}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.deliveryCharge}</Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              ৳{cartTotal.estimatedDelivery.toLocaleString()}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t.vatTax}</Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              ৳{cartTotal.estimatedVat.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>{t.totalOrderAmount}</Text>
            <Text style={[styles.totalVal, { color: colors.accent }]}>
              ৳{finalTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }, shadows.lg]}>
        <View>
          <Text style={[styles.checkoutSubtotal, { color: colors.textSecondary }]}>Total Payable</Text>
          <Text style={[styles.checkoutPrice, { color: colors.text }]}>৳{finalTotal.toLocaleString()}</Text>
        </View>

        <AnimatedButton
          title={t.proceedToCheckout}
          onPress={onProceedCheckout}
          variant="accent"
          size="lg"
          style={{ width: scale(200) }}
          icon={<Feather name="arrow-right" size={moderateScale(18)} color="#0B1B3A" />}
          iconPosition="right"
        />
      </View>
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
  clearBtn: {
    padding: scale(6),
  },
  clearBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  emptyIconCircle: {
    width: scale(110),
    height: scale(110),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(19),
  },
  groupCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: scale(12),
    marginBottom: verticalScale(14),
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: verticalScale(8),
    marginBottom: verticalScale(10),
    borderBottomWidth: 1,
  },
  groupCompanyName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  cartItemRow: {
    flexDirection: 'row',
    paddingVertical: verticalScale(10),
  },
  itemImg: {
    width: scale(70),
    height: scale(70),
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: scale(10),
  },
  itemTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: moderateScale(17),
  },
  itemPrice: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  moqText: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(1),
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  stepBtn: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepVal: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    minWidth: scale(24),
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  deleteBtn: {
    marginTop: verticalScale(4),
    padding: scale(2),
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: verticalScale(12),
  },
  couponInput: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '700',
    paddingVertical: 0,
  },
  applyBtn: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: radius.md,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  couponSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    borderRadius: radius.md,
    marginBottom: verticalScale(12),
  },
  couponSuccessText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  summaryCard: {
    padding: scale(16),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  summaryTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginBottom: verticalScale(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  summaryLabel: {
    fontSize: moderateScale(12),
  },
  summaryVal: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  totalDivider: {
    height: 1,
    marginVertical: verticalScale(8),
  },
  totalLabel: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  totalVal: {
    fontSize: moderateScale(18),
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderTopWidth: 1,
  },
  checkoutSubtotal: {
    fontSize: moderateScale(11),
  },
  checkoutPrice: {
    fontSize: moderateScale(20),
    fontWeight: '900',
  },
});

