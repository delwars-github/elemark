import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { useStore } from '../../store/useStore';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradient?: [string, string];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  gradient,
}) => {
  const { colors } = useStore();
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    scaleAnim.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: disabled ? 0.55 : 1,
  }));

  // Sizing definitions with size-matters
  const sizeStyles = {
    sm: {
      paddingVertical: verticalScale(6),
      paddingHorizontal: scale(12),
      borderRadius: radius.md,
      fontSize: moderateScale(13),
    },
    md: {
      paddingVertical: verticalScale(11),
      paddingHorizontal: scale(18),
      borderRadius: radius.lg,
      fontSize: moderateScale(15),
    },
    lg: {
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(24),
      borderRadius: radius.xl,
      fontSize: moderateScale(17),
    },
  }[size];

  // Variant styling
  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'accent':
        return { backgroundColor: colors.accent };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'danger':
        return { backgroundColor: colors.danger };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'accent') return '#0B1B3A'; // Dark text on gold accent
    if (variant === 'outline') return colors.text;
    if (variant === 'ghost') return colors.primary;
    return '#FFFFFF';
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={{ marginRight: spacing.sm }}
        />
      ) : null}
      {!loading && icon && iconPosition === 'left' ? (
        <Animated.View style={{ marginRight: spacing.sm }}>{icon}</Animated.View>
      ) : null}
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {!loading && icon && iconPosition === 'right' ? (
        <Animated.View style={{ marginLeft: spacing.sm }}>{icon}</Animated.View>
      ) : null}
    </>
  );

  const buttonGradient =
    gradient ||
    (variant === 'accent'
      ? colors.accentGradient
      : variant === 'secondary'
      ? colors.blueGradient
      : undefined);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        animatedStyle,
        style,
      ]}
    >
      {buttonGradient && variant !== 'outline' && variant !== 'ghost' ? (
        <LinearGradient
          colors={buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {content}
        </LinearGradient>
      ) : (
        <Animated.View
          style={[
            styles.inner,
            getButtonStyles(),
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {content}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

