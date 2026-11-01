import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { LedgerEntry } from '../../types';
import { useStore } from '../../store/useStore';
import { Badge } from '../common/Badge';

interface TransactionRowProps {
  entry: LedgerEntry;
  index?: number;
  onViewInvoice?: (entry: LedgerEntry) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  entry,
  index = 0,
  onViewInvoice,
}) => {
  const { colors, t } = useStore();
  const isPurchase = entry.type === 'PURCHASE';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(350)}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isPurchase ? 'rgba(37, 99, 235, 0.1)' : 'rgba(16, 185, 129, 0.12)',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isPurchase ? 'cart-arrow-down' : 'cash-check'}
              size={moderateScale(18)}
              color={isPurchase ? colors.secondary : colors.success}
            />
          </View>
          <View>
            <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
              {entry.companyName}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {entry.date} • {entry.referenceReceiptNo || 'N/A'}
            </Text>
          </View>
        </View>

        <Badge
          label={isPurchase ? (entry.dueAmount > 0 ? t.dueStatus : t.paidStatus) : t.paidStatus}
          variant={isPurchase ? (entry.dueAmount > 0 ? 'due' : 'paid') : 'paid'}
          size="sm"
        />
      </View>

      {/* Description / Summary */}
      {entry.productSummary || entry.note ? (
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {entry.productSummary || entry.note}
        </Text>
      ) : null}

      {/* Financial breakdown */}
      <View style={[styles.amountRow, { borderTopColor: colors.border }]}>
        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            {isPurchase ? 'Order Total' : 'Installment'}
          </Text>
          <Text style={[styles.amountVal, { color: colors.text }]}>
            ৳{(entry.totalAmount || entry.paidAmount).toLocaleString()}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            {t.paidNow}
          </Text>
          <Text style={[styles.amountVal, { color: colors.success }]}>
            ৳{entry.paidAmount.toLocaleString()}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            {t.dueStatus}
          </Text>
          <Text
            style={[
              styles.amountVal,
              { color: entry.dueAmount > 0 ? colors.danger : colors.textSecondary },
            ]}
          >
            ৳{(entry.dueAmount || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            Balance
          </Text>
          <Text style={[styles.amountVal, { color: colors.text, fontWeight: '800' }]}>
            ৳{entry.newBalance.toLocaleString()}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: scale(12),
    marginBottom: verticalScale(10),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(8),
  },
  iconWrapper: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  companyName: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  dateText: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
  },
  description: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(15),
    marginBottom: verticalScale(8),
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: verticalScale(8),
  },
  amountCol: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: moderateScale(9),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  amountVal: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
});

