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
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { generateOrderInvoicePdf } from '../../services/invoiceService';

interface OrderTrackingScreenProps {
  order: Order;
  onBack: () => void;
  onReorder: (order: Order) => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  order,
  onBack,
  onReorder,
}) => {
  const { colors, t } = useStore();

  const handleDownloadPdf = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await generateOrderInvoicePdf(order);
    } catch (e) {
      alert('Could not generate PDF invoice');
    }
  };

  const steps: { key: OrderStatus; label: string; desc: string; icon: string }[] = [
    { key: 'placed', label: t.statusPlaced, desc: 'Wholesale order registered on VoltMart', icon: 'clipboard-check' },
    { key: 'confirmed', label: t.statusConfirmed, desc: 'Verified & scheduled by sales department', icon: 'check-circle' },
    { key: 'packed', label: t.statusPacked, desc: 'Quality inspected & barcoded in master carton', icon: 'package-variant-closed' },
    { key: 'shipped', label: t.statusShipped, desc: 'In transit via Sundarban Courier Express', icon: 'truck-fast' },
    { key: 'delivered', label: t.statusDelivered, desc: 'Delivered to your shop & signed', icon: 'home-check' },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === order.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.orderTrackingTitle}</Text>
        <TouchableOpacity onPress={handleDownloadPdf} style={styles.backBtn}>
          <Feather name="download" size={moderateScale(20)} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Order Meta Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <View style={styles.metaRow}>
            <View>
              <Text style={[styles.orderNumber, { color: colors.text }]}>
                {order.orderNumber}
              </Text>
              <Text style={[styles.supplierName, { color: colors.secondary }]}>
                {order.companyName}
              </Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                Ordered on {order.createdAt}
              </Text>
            </View>

            <Badge
              label={order.paymentStatus}
              variant={order.paymentStatus === 'PAID' ? 'paid' : order.paymentStatus === 'PARTIAL' ? 'partial' : 'due'}
            />
          </View>
        </Animated.View>

        {/* Animated Timeline */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <Text style={[styles.timelineHeading, { color: colors.text }]}>
            Dispatch & Delivery Progress
          </Text>

          <View style={styles.timelineList}>
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <View key={step.key} style={styles.timelineItem}>
                  {/* Left Column: Icon + Vertical Connecting Line */}
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.indicatorCircle,
                        {
                          backgroundColor: isCompleted ? colors.success : colors.backgroundSecondary,
                          borderColor: isCurrent ? colors.accent : isCompleted ? colors.success : colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={step.icon as any}
                        size={moderateScale(16)}
                        color={isCompleted ? '#FFFFFF' : colors.textMuted}
                      />
                    </View>

                    {idx < steps.length - 1 ? (
                      <View
                        style={[
                          styles.verticalLine,
                          {
                            backgroundColor: idx < currentStepIdx ? colors.success : colors.border,
                          },
                        ]}
                      />
                    ) : null}
                  </View>

                  {/* Right Column: Step Label and Details */}
                  <View style={styles.stepContentCol}>
                    <View style={styles.stepTitleRow}>
                      <Text
                        style={[
                          styles.stepTitle,
                          {
                            color: isCompleted ? colors.text : colors.textMuted,
                            fontWeight: isCurrent ? '800' : '600',
                          },
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isCurrent ? (
                        <View style={[styles.activePill, { backgroundColor: 'rgba(255, 183, 3, 0.2)' }]}>
                          <Text style={[styles.activePillText, { color: '#B45309' }]}>LIVE</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                      {step.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Ordered Items Breakdown */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.itemsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <Text style={[styles.timelineHeading, { color: colors.text }]}>
            Ordered Products ({order.items.length})
          </Text>

          {order.items.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.itemRow,
                idx < order.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} resizeMode="cover" />
              <View style={styles.itemMeta}>
                <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.product.title}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {item.quantity} {item.product.unitType}s • ৳{item.unitPrice.toLocaleString()}/{item.product.unitType}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.text }]}>
                ৳{item.subtotal.toLocaleString()}
              </Text>
            </View>
          ))}

          {/* Totals Summary */}
          <View style={[styles.totalsBox, { borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Subtotal:</Text>
              <Text style={[styles.totalVal, { color: colors.text }]}>৳{order.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Amount Paid:</Text>
              <Text style={[styles.totalVal, { color: colors.success }]}>৳{order.paidAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Remaining Due:</Text>
              <Text style={[styles.totalVal, { color: order.dueAmount > 0 ? colors.danger : colors.text }]}>
                ৳{order.dueAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <AnimatedButton
            title={t.downloadInvoice}
            onPress={handleDownloadPdf}
            variant="outline"
            style={{ marginBottom: verticalScale(10) }}
            icon={<Feather name="file-text" size={moderateScale(16)} color={colors.text} />}
          />

          <AnimatedButton
            title={t.reorder}
            onPress={() => onReorder(order)}
            variant="accent"
            icon={<Feather name="repeat" size={moderateScale(16)} color="#0B1B3A" />}
          />
        </View>
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
  backBtn: {
    padding: scale(6),
  },
  topBarTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(50),
  },
  metaCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  supplierName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  dateText: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(3),
  },
  timelineCard: {
    padding: scale(16),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  timelineHeading: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginBottom: verticalScale(14),
  },
  timelineList: {
    paddingLeft: scale(4),
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: verticalScale(56),
  },
  indicatorCol: {
    alignItems: 'center',
    width: scale(32),
  },
  indicatorCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius.pill,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: verticalScale(2),
  },
  stepContentCol: {
    flex: 1,
    marginLeft: scale(12),
    paddingBottom: verticalScale(14),
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: moderateScale(13),
  },
  activePill: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(1),
    borderRadius: radius.pill,
    marginLeft: scale(6),
  },
  activePillText: {
    fontSize: moderateScale(9),
    fontWeight: '900',
  },
  stepDesc: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  itemsCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(16),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  itemImg: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md,
  },
  itemMeta: {
    flex: 1,
    marginLeft: scale(10),
  },
  itemTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  itemSub: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  itemTotal: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  totalsBox: {
    borderTopWidth: 1,
    paddingTop: verticalScale(10),
    marginTop: verticalScale(6),
    gap: verticalScale(4),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: moderateScale(12),
  },
  totalVal: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  actionsBox: {
    marginTop: verticalScale(6),
  },
});

