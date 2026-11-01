import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale, radius } from '../../theme/responsive';
import { useStore } from '../../store/useStore';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors, t } = useStore();
  const scaleAnim = useSharedValue(0.4);
  const opacityAnim = useSharedValue(0);
  const glowAnim = useSharedValue(0.8);

  useEffect(() => {
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacityAnim.value = withTiming(1, { duration: 600 });
    glowAnim.value = withSequence(
      withTiming(1.2, { duration: 700 }),
      withTiming(1, { duration: 700 })
    );

    const timer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowAnim.value }],
  }));

  return (
    <LinearGradient
      colors={['#0B1B3A', '#060E1E']}
      style={styles.container}
    >
      <View style={styles.centerBox}>
        {/* Glowing background ring */}
        <Animated.View
          style={[
            styles.glowRing,
            { backgroundColor: 'rgba(255, 183, 3, 0.15)' },
            glowStyle,
          ]}
        />

        {/* Animated Brand Icon */}
        <Animated.View style={[styles.iconWrapper, logoStyle]}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={moderateScale(56)}
            color="#FFB703"
          />
        </Animated.View>

        {/* Brand Name */}
        <Animated.View style={[styles.titleBox, logoStyle]}>
          <Text style={styles.brandTitle}>
            Volt<Text style={styles.brandAccent}>Mart</Text>
          </Text>
          <Text style={styles.tagline}>{t.tagline}</Text>
          <View style={styles.b2bBadge}>
            <Text style={styles.b2bText}>B2B WHOLESALE MARKETPLACE</Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Direct from Electrical Manufacturers</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: radius.pill,
    top: -verticalScale(10),
  },
  iconWrapper: {
    width: scale(100),
    height: scale(100),
    borderRadius: radius.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 183, 3, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  titleBox: {
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: moderateScale(36),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#FFB703',
  },
  tagline: {
    fontSize: moderateScale(13),
    color: '#94A3B8',
    marginTop: verticalScale(4),
    fontWeight: '500',
  },
  b2bBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.5)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: radius.pill,
    marginTop: verticalScale(12),
  },
  b2bText: {
    color: '#60A5FA',
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: verticalScale(36),
  },
  footerText: {
    color: '#64748B',
    fontSize: moderateScale(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

