import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { StatCard } from '../../components/common/StatCard';
import { CompanyLedgerCard } from '../../components/ledger/CompanyLedgerCard';
import { TransactionRow } from '../../components/ledger/TransactionRow';
import { PayDueModal } from '../../components/ledger/PayDueModal';
import { BarChart, DueRatioBar } from '../../components/charts/BarChart';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { CompanyLedgerSummary, LedgerEntry } from '../../types';
import { generateLedgerStatementPdf } from '../../services/invoiceService';

export const SellerLedgerScreen: React.FC = () => {
  const {
    user,
    colors,
    companyWiseLedgerList,
    sellerTotalPurchased,
    sellerTotalPaid,
    sellerTotalDue,
    ledger,
    t,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'companies' | 'transactions' | 'analytics'>('companies');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PAID'>('ALL');
  const [selectedCompanyForPay, setSelectedCompanyForPay] = useState<CompanyLedgerSummary | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filtered transactions
  const filteredLedger = ledger.filter(item => {
    if (statusFilter === 'DUE') return item.dueAmount > 0;
    if (statusFilter === 'PAID') return item.dueAmount === 0;
    return true;
  });

  // Chart data for monthly purchases
  const monthlyChartData = [
    { label: 'Jun', value: 34000 },
    { label: 'Jul', value: 52000 },
    { label: 'Aug', value: 48000 },
    { label: 'Sep', value: 71000 },
    { label: 'Oct', value: 87715 },
  ];

  const handleOpenPayDue = (comp: CompanyLedgerSummary) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCompanyForPay(comp);
    setPayModalVisible(true);
  };

  const handleExportStatement = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setExporting(true);
    try {
      await generateLedgerStatementPdf(
        user?.name || 'Al-Haj Rafiqul Islam',
        user?.businessName || 'Bismillah Hardware Store',
        ledger,
        sellerTotalPurchased,
        sellerTotalPaid,
        sellerTotalDue
      );
    } catch (e) {
      alert('Could not export statement');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <View style={styles.topBarTitleRow}>
          <MaterialCommunityIcons name="book-open-page-variant" size={moderateScale(24)} color={colors.accent} />
          <Text style={[styles.topBarTitle, { color: colors.text, marginLeft: scale(8) }]}>
            {t.ledgerTitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleExportStatement}
          style={[styles.exportBtn, { backgroundColor: colors.backgroundSecondary }]}
          activeOpacity={0.8}
        >
          <Feather name="download" size={moderateScale(15)} color={colors.secondary} />
          <Text style={[styles.exportBtnText, { color: colors.secondary }]}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Overview Stats Cards Grid */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.statsGrid}>
          <StatCard
            title={t.totalPurchased}
            value={sellerTotalPurchased}
            icon={<MaterialCommunityIcons name="cart-check" size={moderateScale(20)} color={colors.secondary} />}
            iconBgColor="rgba(37, 99, 235, 0.12)"
            trend="+18%"
            isPositive
            style={{ flex: 1, minWidth: scale(100) }}
          />

          <StatCard
            title={t.totalPaid}
            value={sellerTotalPaid}
            icon={<MaterialCommunityIcons name="cash-check" size={moderateScale(20)} color={colors.success} />}
            iconBgColor="rgba(16, 185, 129, 0.12)"
            highlightColor={colors.success}
            style={{ flex: 1, minWidth: scale(100) }}
          />

          <StatCard
            title={t.totalOutstandingDue}
            value={sellerTotalDue}
            icon={<MaterialCommunityIcons name="clock-alert-outline" size={moderateScale(20)} color={colors.danger} />}
            iconBgColor="rgba(239, 68, 68, 0.12)"
            highlightColor={colors.danger}
            style={{ flex: 1, minWidth: scale(100) }}
          />
        </Animated.View>

        {/* Due vs Paid Visual Ratio Bar */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.ratioCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Accounting Ratio: Paid vs Outstanding Due (বাকি)
          </Text>
          <DueRatioBar paid={sellerTotalPaid} due={sellerTotalDue} />
        </Animated.View>

        {/* Section Tabs: Companies vs Transactions vs Analytics */}
        <View style={[styles.tabSelector, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setActiveTab('companies');
            }}
            style={[
              styles.tabSelectBtn,
              activeTab === 'companies' && { backgroundColor: colors.primary, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                styles.tabSelectText,
                { color: activeTab === 'companies' ? colors.accent : colors.textSecondary },
              ]}
            >
              {t.companyWiseLedger}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setActiveTab('transactions');
            }}
            style={[
              styles.tabSelectBtn,
              activeTab === 'transactions' && { backgroundColor: colors.primary, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                styles.tabSelectText,
                { color: activeTab === 'transactions' ? colors.accent : colors.textSecondary },
              ]}
            >
              {t.paymentHistory}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setActiveTab('analytics');
            }}
            style={[
              styles.tabSelectBtn,
              activeTab === 'analytics' && { backgroundColor: colors.primary, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                styles.tabSelectText,
                { color: activeTab === 'analytics' ? colors.accent : colors.textSecondary },
              ]}
            >
              Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Company-Wise Ledger Cards */}
        {activeTab === 'companies' ? (
          <View style={styles.tabContent}>
            {companyWiseLedgerList.map((comp, idx) => (
              <CompanyLedgerCard
                key={comp.companyId}
                summary={comp}
                index={idx}
                onPayDue={handleOpenPayDue}
              />
            ))}
          </View>
        ) : null}

        {/* Tab 2: Transaction History */}
        {activeTab === 'transactions' ? (
          <View style={styles.tabContent}>
            {/* Filter Pills: All / Due / Paid */}
            <View style={styles.filterPillsRow}>
              {(['ALL', 'DUE', 'PAID'] as const).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setStatusFilter(f)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: statusFilter === f ? colors.secondary : colors.backgroundSecondary,
                      borderColor: statusFilter === f ? colors.secondary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: statusFilter === f ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {f === 'ALL' ? t.allStatuses : f === 'DUE' ? t.dueStatus : t.paidStatus}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredLedger.map((entry, idx) => (
              <TransactionRow
                key={entry.id}
                entry={entry}
                index={idx}
              />
            ))}
          </View>
        ) : null}

        {/* Tab 3: Monthly Analytics Chart */}
        {activeTab === 'analytics' ? (
          <Animated.View
            entering={FadeInDown}
            style={[styles.analyticsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}
          >
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              Monthly Wholesale Purchase Trends (BDT)
            </Text>
            <Text style={[styles.analyticsSub, { color: colors.textSecondary }]}>
              Highest purchase recorded in October 2026 (৳87,715)
            </Text>

            <BarChart data={monthlyChartData} barColor={colors.secondary} />
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* Pay Due Modal */}
      <PayDueModal
        visible={payModalVisible}
        onClose={() => setPayModalVisible(false)}
        summary={selectedCompanyForPay}
      />
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
  topBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.md,
  },
  exportBtnText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginLeft: scale(4),
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(90),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  ratioCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  sectionHeading: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(4),
  },
  tabSelector: {
    flexDirection: 'row',
    padding: scale(4),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  tabSelectBtn: {
    flex: 1,
    paddingVertical: verticalScale(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelectText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  tabContent: {
    minHeight: verticalScale(200),
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  filterPill: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  analyticsCard: {
    padding: scale(16),
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  analyticsSub: {
    fontSize: moderateScale(11),
    marginBottom: verticalScale(12),
  },
});

