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
import { StatCard } from '../../components/common/StatCard';
import { BarChart, DueRatioBar } from '../../components/charts/BarChart';
import { Badge } from '../../components/common/Badge';

interface CompanyDashboardScreenProps {
  onNavigateToUpload: () => void;
  onNavigateToProducts: () => void;
  onNavigateToOrders: () => void;
  onNavigateToLedger: () => void;
}

export const CompanyDashboardScreen: React.FC<CompanyDashboardScreenProps> = ({
  onNavigateToUpload,
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToLedger,
}) => {
  const {
    user,
    colors,
    companyProducts,
    companyOrders,
    companyTotalRevenue,
    companyTotalDueReceivable,
    companyPendingOrdersCount,
    switchRole,
    t,
  } = useStore();

  const revenueChartData = [
    { label: 'Jun', value: 42000 },
    { label: 'Jul', value: 65000 },
    { label: 'Aug', value: 58000 },
    { label: 'Sep', value: 89000 },
    { label: 'Oct', value: 112000 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <View style={styles.headerLeft}>
          <View style={[styles.companyAvatar, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="factory" size={moderateScale(22)} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.companyTitleRow}>
              <Text style={[styles.companyTitle, { color: colors.text }]} numberOfLines={1}>
                {user?.businessName || 'Super Star Group (SSG)'}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={moderateScale(15)} color={colors.success} />
            </View>
            <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>
              {t.companyDashboardTitle}
            </Text>
          </View>
        </View>

        {/* Demo Switcher to Seller */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            switchRole('SELLER');
          }}
          style={[styles.switchBadge, { backgroundColor: 'rgba(255, 183, 3, 0.2)' }]}
          activeOpacity={0.8}
        >
          <Text style={styles.switchBadgeText}>View as Seller</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* KPI Metrics 4-Grid */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.statsGrid}>
          <StatCard
            title={t.totalProductsListed}
            value={companyProducts.length}
            prefix=""
            icon={<MaterialCommunityIcons name="package-variant" size={moderateScale(20)} color={colors.secondary} />}
            iconBgColor="rgba(37, 99, 235, 0.12)"
            style={{ flex: 1, minWidth: scale(140) }}
          />

          <StatCard
            title={t.totalOrdersReceived}
            value={companyOrders.length}
            prefix=""
            icon={<MaterialCommunityIcons name="truck-delivery" size={moderateScale(20)} color={colors.accent} />}
            iconBgColor="rgba(255, 183, 3, 0.15)"
            trend="+12%"
            isPositive
            style={{ flex: 1, minWidth: scale(140) }}
          />

          <StatCard
            title={t.totalRevenue}
            value={companyTotalRevenue}
            icon={<MaterialCommunityIcons name="cash-multiple" size={moderateScale(20)} color={colors.success} />}
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

        {/* Quick Management Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.quickActionsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>{t.quickActions}</Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              onPress={onNavigateToUpload}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255, 183, 3, 0.2)' }]}>
                <Feather name="plus-circle" size={moderateScale(22)} color="#B45309" />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{t.addProduct}</Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>Upload specs & pricing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNavigateToOrders}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                <Feather name="inbox" size={moderateScale(22)} color={colors.secondary} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{t.incomingOrders}</Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{companyPendingOrdersCount} pending dispatch</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNavigateToProducts}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Feather name="box" size={moderateScale(22)} color={colors.success} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{t.manageProducts}</Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>Edit stock & status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNavigateToLedger}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <MaterialCommunityIcons name="book-open-outline" size={moderateScale(22)} color={colors.danger} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{t.retailerLedgers}</Text>
              <Text style={[styles.actionSub, { color: colors.textSecondary }]}>Seller dues & reminders</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Revenue Analytics Chart */}
        <Animated.View
          entering={FadeInDown.delay(180).duration(400)}
          style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>{t.revenueAnalytics}</Text>
          <Text style={[styles.chartSub, { color: colors.textSecondary }]}>
            Gross monthly wholesale sales from verified retailers (৳)
          </Text>
          <BarChart data={revenueChartData} barColor={colors.accent} />
        </Animated.View>

        {/* Top Performing Electrical Products */}
        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.topProductsSection}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>{t.topSellingProducts}</Text>

          {companyProducts.slice(0, 3).map((prod, idx) => (
            <View
              key={prod.id}
              style={[styles.prodRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
            >
              <Image source={{ uri: prod.images[0] }} style={styles.prodImg} resizeMode="cover" />
              <View style={{ flex: 1, marginLeft: scale(10) }}>
                <Text style={[styles.prodTitle, { color: colors.text }]} numberOfLines={1}>
                  {prod.title}
                </Text>
                <Text style={[styles.prodMeta, { color: colors.textSecondary }]}>
                  Stock: {prod.stockQuantity} {prod.unitType}s • MOQ: {prod.moq}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.prodPrice, { color: colors.secondary }]}>
                  ৳{prod.wholesalePrice.toLocaleString()}
                </Text>
                <Badge label="Active" variant="paid" size="sm" />
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(45),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(10),
  },
  companyAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  companyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginRight: scale(4),
  },
  companySubtitle: {
    fontSize: moderateScale(11),
  },
  switchBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: radius.pill,
  },
  switchBadgeText: {
    color: '#B45309',
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    marginBottom: verticalScale(16),
  },
  quickActionsSection: {
    marginBottom: verticalScale(16),
  },
  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginBottom: verticalScale(10),
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  actionCard: {
    width: '48%',
    padding: scale(12),
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  actionIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  actionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  actionSub: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  chartCard: {
    padding: scale(16),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(16),
  },
  chartSub: {
    fontSize: moderateScale(11),
    marginBottom: verticalScale(8),
  },
  topProductsSection: {
    marginBottom: verticalScale(16),
  },
  prodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  prodImg: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius.md,
  },
  prodTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  prodMeta: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  prodPrice: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
});

