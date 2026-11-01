import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { useStore } from '../../store/useStore';
import { AnimatedButton } from '../../components/common/AnimatedButton';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { colors, t, setOnboarded } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: t.onboarding1Title,
      desc: t.onboarding1Desc,
      icon: 'factory',
      iconColor: '#FFB703',
      bgBadge: 'WHOLESALE B2B',
    },
    {
      title: t.onboarding2Title,
      desc: t.onboarding2Desc,
      icon: 'book-open-page-variant',
      iconColor: '#34D399',
      bgBadge: 'KHATA & CREDIT',
    },
    {
      title: t.onboarding3Title,
      desc: t.onboarding3Desc,
      icon: 'truck-fast',
      iconColor: '#60A5FA',
      bgBadge: 'FAST DISPATCH',
    },
  ];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setOnboarded(true);
      onFinish();
    }
  };

  const handleSkip = () => {
    setOnboarded(true);
    onFinish();
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header with Skip */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={[styles.logoText, { color: colors.text }]}>
            Volt<Text style={{ color: colors.accent }}>Mart</Text>
          </Text>
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {t.skip}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Slide Animated Area */}
      <View style={styles.slideArea}>
        <Animated.View
          key={currentIndex}
          entering={FadeInRight.duration(400)}
          exiting={FadeOutLeft.duration(300)}
          style={styles.slideCard}
        >
          {/* Visual Graphic Container */}
          <LinearGradient
            colors={['#0B1B3A', '#162A56']}
            style={styles.graphicBox}
          >
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              ]}
            >
              <MaterialCommunityIcons
                name={currentSlide.icon as any}
                size={moderateScale(72)}
                color={currentSlide.iconColor}
              />
            </View>

            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{currentSlide.bgBadge}</Text>
            </View>
          </LinearGradient>

          {/* Texts */}
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              {currentSlide.title}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {currentSlide.desc}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Controls: Indicators & Next button */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === currentIndex ? colors.accent : colors.border,
                  width: idx === currentIndex ? scale(24) : scale(8),
                },
              ]}
            />
          ))}
        </View>

        <AnimatedButton
          title={currentIndex === slides.length - 1 ? t.getStarted : t.next}
          onPress={handleNext}
          variant="accent"
          size="lg"
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(50),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: moderateScale(22),
    fontWeight: '900',
  },
  skipBtn: {
    padding: scale(8),
  },
  skipText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  slideArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    width: '100%',
    alignItems: 'center',
  },
  graphicBox: {
    width: scale(250),
    height: verticalScale(240),
    borderRadius: radius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  iconBubble: {
    width: scale(130),
    height: scale(130),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badgePill: {
    position: 'absolute',
    bottom: verticalScale(14),
    backgroundColor: 'rgba(255, 183, 3, 0.25)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: radius.pill,
  },
  badgeText: {
    color: '#FFB703',
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: scale(10),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: verticalScale(10),
    lineHeight: moderateScale(28),
  },
  description: {
    fontSize: moderateScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  bottomBar: {
    paddingBottom: verticalScale(40),
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(22),
  },
  dot: {
    height: verticalScale(8),
    borderRadius: radius.pill,
    marginHorizontal: scale(4),
  },
  nextBtn: {
    width: '100%',
  },
});

