import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { CompanyLedgerSummary } from '../../types';
import { useStore } from '../../store/useStore';
import { Badge } from '../common/Badge';

interface CompanyLedgerCardProps {
  summary: CompanyLedgerSummary;
  onPayDue: (summary: CompanyLedgerSummary) => void;
  index?: number;
}

export const CompanyLedgerCard: React.FC<CompanyLedgerCardProps> = ({
  summary,
  onPayDue,
  index = 0,
}) => {
  const { colors, t } = useStore();
  const hasDue = summary.totalDue > 0;
  const paidRatio = summary.totalPurchased > 0 ? (summary.totalPaid / summary.totalPurchased) * 100 : 100;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).duration(400)}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: hasDue ? 'rgba(239, 68, 68, 0.25)' : colors.cardBorder,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons
              name="factory"
              size={moderateScale(18)}
              color={colors.accent}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
                {summary.companyName}
              </Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={moderateScale(14)}
                color={colors.success}
              />
            </View>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {summary.orderCount} Orders • Last Trade: {summary.lastTransactionDate}
            </Text>
          </View>
        </View>

        <Badge
          label={hasDue ? `${t.dueStatus}: ৳${summary.totalDue.toLocaleString()}` : t.paidStatus}
          variant={hasDue ? 'due' : 'paid'}
          size="sm"
        />
      </View>

      {/* Financial metrics grid */}
      <View style={[styles.metricsGrid, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {t.totalPurchased}
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            ৳{summary.totalPurchased.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            {t.totalPaid}
          </Text>
          <Text style={[styles.metricValue, { color: colors.success }]}>
            ৳{summary.totalPaid.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: hasDue ? colors.danger : colors.textSecondary }]}>
            {t.totalOutstandingDue}
          </Text>
          <Text style={[styles.metricValue, { color: hasDue ? colors.danger : colors.text }]}>
            ৳{summary.totalDue.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Ratio progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(100, paidRatio)}%`,
                backgroundColor: hasDue ? colors.secondary : colors.success,
              },
            ]}
          />
        </View>
      </View>

      {/* Action footer */}
      {hasDue ? (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => onPayDue(summary)}
            style={[styles.payBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
          >
            <Feather name="credit-card" size={moderateScale(15)} color="#0B1B3A" />
            <Text style={styles.payBtnText}>{t.payDue}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: scale(14),
    marginBottom: verticalScale(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(8),
  },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginRight: scale(4),
  },
  metaText: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  metricsGrid: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(8),
    marginBottom: verticalScale(10),
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  metricLabel: {
    fontSize: moderateScale(9),
    fontWeight: '600',
    marginBottom: verticalScale(3),
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  progressContainer: {
    marginBottom: verticalScale(8),
  },
  progressTrack: {
    height: verticalScale(6),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.pill,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: verticalScale(4),
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: radius.md,
  },
  payBtnText: {
    color: '#0B1B3A',
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(6),
  },
});

