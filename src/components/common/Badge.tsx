import React from 'react';
import { Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { scale, verticalScale, moderateScale, radius } from '../../theme/responsive';
import { useStore } from '../../store/useStore';

interface BadgeProps {
  label: string;
  variant?: 'paid' | 'due' | 'partial' | 'accent' | 'primary' | 'outline' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useStore();

  const getColors = () => {
    switch (variant) {
      case 'paid':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.paidBadge, border: 'rgba(16, 185, 129, 0.3)' };
      case 'due':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: colors.dueBadge, border: 'rgba(239, 68, 68, 0.3)' };
      case 'partial':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.partialBadge, border: 'rgba(245, 158, 11, 0.3)' };
      case 'accent':
        return { bg: 'rgba(255, 183, 3, 0.2)', text: '#92400E', border: 'rgba(255, 183, 3, 0.4)' };
      case 'info':
        return { bg: 'rgba(37, 99, 235, 0.12)', text: colors.secondary, border: 'rgba(37, 99, 235, 0.25)' };
      case 'outline':
        return { bg: 'transparent', text: colors.textSecondary, border: colors.border };
      default:
        return { bg: 'rgba(11, 27, 58, 0.08)', text: colors.primary, border: 'rgba(11, 27, 58, 0.15)' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingVertical: isSm ? verticalScale(2) : verticalScale(4),
          paddingHorizontal: isSm ? scale(6) : scale(10),
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: scale(4) }}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          {
            color: c.text,
            fontSize: isSm ? moderateScale(10) : moderateScale(11),
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});

