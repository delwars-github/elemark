import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  style?: ViewStyle;
  highlightColor?: string;
  trend?: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '৳',
  suffix = '',
  subtitle,
  icon,
  iconBgColor,
  style,
  highlightColor,
  trend,
  isPositive = true,
}) => {
  const { colors } = useStore();
  const scaleAnim = useSharedValue(0.9);
  const opacityAnim = useSharedValue(0);

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 14 });
    opacityAnim.value = withTiming(1, { duration: 450 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: highlightColor ? highlightColor : colors.cardBorder,
        },
        shadows.sm,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: iconBgColor || 'rgba(37, 99, 235, 0.1)' },
          ]}
        >
          {icon}
        </View>

        {trend ? (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: isPositive ? colors.success : colors.danger },
              ]}
            >
              {trend}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>

      <Text
        style={[
          styles.value,
          { color: highlightColor || colors.text },
        ]}
        numberOfLines={1}
      >
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    minWidth: scale(140),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  iconWrapper: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: radius.pill,
  },
  trendText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  title: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(3),
  },
});

