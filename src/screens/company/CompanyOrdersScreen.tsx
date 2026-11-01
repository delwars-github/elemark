import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/common/Badge';

export const CompanyOrdersScreen: React.FC = () => {
  const { companyOrders, updateOrderStatus, colors, t } = useStore();

  const handleAdvanceStatus = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (order.status === 'placed') {
      updateOrderStatus(order.id, 'confirmed', 'Order accepted by factory dispatch team');
    } else if (order.status === 'confirmed') {
      updateOrderStatus(order.id, 'packed', 'Cartons sealed and marked for courier pickup');
    } else if (order.status === 'packed') {
      updateOrderStatus(order.id, 'shipped', 'Handed over to courier express');
    } else if (order.status === 'shipped') {
      updateOrderStatus(order.id, 'delivered', 'Confirmed delivered to retail shop');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t.incomingOrders} ({companyOrders.length})
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {companyOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="truck-outline" size={moderateScale(54)} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No incoming orders yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Retailer purchase orders will appear here in real-time.
            </Text>
          </View>
        ) : (
          companyOrders.map((order, idx) => (
            <Animated.View
              key={order.id}
              entering={FadeInDown.delay(idx * 60).duration(400)}
              style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
            >
              {/* Top order header */}
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={[styles.orderNumber, { color: colors.text }]}>
                    {order.orderNumber}
                  </Text>
                  <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
                    {order.createdAt}
                  </Text>
                </View>

                <Badge
                  label={order.paymentStatus}
                  variant={order.paymentStatus === 'PAID' ? 'paid' : order.paymentStatus === 'PARTIAL' ? 'partial' : 'due'}
                />
              </View>

              {/* Retailer Info */}
              <View style={[styles.retailerBox, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.retailerRow}>
                  <MaterialCommunityIcons name="store" size={moderateScale(18)} color={colors.secondary} />
                  <Text style={[styles.buyerShopName, { color: colors.text }]}>
                    {order.buyerShopName}
                  </Text>
                </View>

                <Text style={[styles.buyerContact, { color: colors.textSecondary }]}>
                  Prop: {order.buyerName} • Phone: {order.buyerPhone}
                </Text>
                <Text style={[styles.buyerAddress, { color: colors.textSecondary }]}>
                  Delivery: {order.buyerAddress}
                </Text>
              </View>

              {/* Items summary */}
              <View style={styles.itemsSummary}>
                {order.items.map((item, iIdx) => (
                  <View key={iIdx} style={styles.itemLine}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.product.title}
                    </Text>
                    <Text style={[styles.itemQtyPrice, { color: colors.textSecondary }]}>
                      {item.quantity} {item.product.unitType}s • ৳{item.subtotal.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Order total & dues row */}
              <View style={[styles.financialRow, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.finLabel, { color: colors.textSecondary }]}>Order Total:</Text>
                  <Text style={[styles.finVal, { color: colors.text }]}>৳{order.totalAmount.toLocaleString()}</Text>
                </View>

                <View>
                  <Text style={[styles.finLabel, { color: colors.success }]}>Received Now:</Text>
                  <Text style={[styles.finVal, { color: colors.success }]}>৳{order.paidAmount.toLocaleString()}</Text>
                </View>

                <View>
                  <Text style={[styles.finLabel, { color: order.dueAmount > 0 ? colors.danger : colors.textSecondary }]}>
                    Outstanding Due:
                  </Text>
                  <Text style={[styles.finVal, { color: order.dueAmount > 0 ? colors.danger : colors.text }]}>
                    ৳{order.dueAmount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Action buttons based on current lifecycle status */}
              <View style={[styles.statusActionRow, { borderTopColor: colors.border }]}>
                <View style={styles.currentStatusPill}>
                  <Text style={[styles.currentStatusText, { color: colors.secondary }]}>
                    Status: <Text style={{ fontWeight: '800' }}>{order.status.toUpperCase()}</Text>
                  </Text>
                </View>

                {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                  <TouchableOpacity
                    onPress={() => handleAdvanceStatus(order)}
                    style={[styles.advanceBtn, { backgroundColor: colors.accent }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.advanceBtnText}>
                      {order.status === 'placed'
                        ? 'Confirm Order'
                        : order.status === 'confirmed'
                        ? 'Mark Packed'
                        : order.status === 'packed'
                        ? 'Dispatch Order'
                        : 'Mark Delivered'}
                    </Text>
                    <Feather name="arrow-right" size={moderateScale(14)} color="#0B1B3A" />
                  </TouchableOpacity>
                ) : (
                  <Badge label="COMPLETED" variant="paid" size="sm" />
                )}
              </View>
            </Animated.View>
          ))
        )}
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
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(80),
    paddingHorizontal: scale(30),
  },
  emptyTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    marginTop: verticalScale(12),
  },
  emptySubtitle: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  orderCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: scale(14),
    marginBottom: verticalScale(14),
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  orderNumber: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  orderTime: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  retailerBox: {
    padding: scale(10),
    borderRadius: radius.lg,
    marginBottom: verticalScale(10),
  },
  retailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(3),
  },
  buyerShopName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  buyerContact: {
    fontSize: moderateScale(11),
    marginLeft: scale(24),
  },
  buyerAddress: {
    fontSize: moderateScale(10),
    marginLeft: scale(24),
    marginTop: verticalScale(2),
  },
  itemsSummary: {
    marginBottom: verticalScale(10),
    gap: verticalScale(4),
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    flex: 1,
  },
  itemQtyPrice: {
    fontSize: moderateScale(11),
    marginLeft: scale(10),
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: verticalScale(8),
    marginBottom: verticalScale(10),
  },
  finLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  finVal: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginTop: verticalScale(2),
  },
  statusActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: verticalScale(10),
  },
  currentStatusPill: {
    flex: 1,
  },
  currentStatusText: {
    fontSize: moderateScale(11),
  },
  advanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: radius.md,
  },
  advanceBtnText: {
    color: '#0B1B3A',
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginRight: scale(4),
  },
});

