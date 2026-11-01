import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  index?: number;
  layout?: 'grid' | 'horizontal';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  index = 0,
  layout = 'grid',
}) => {
  const { colors, addToCart, wishlist, toggleWishlist, t } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handleAddCart = (e: any) => {
    e.stopPropagation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addToCart(product, product.moq);
  };

  const handleToggleWishlist = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleWishlist(product.id);
  };

  const savingsAmount = product.pricePerUnit - product.wholesalePrice;
  const isHorizontal = layout === 'horizontal';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[
        isHorizontal ? styles.horizontalContainer : styles.gridContainer,
      ]}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.card,
          isHorizontal ? styles.horizontalCard : styles.gridCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          shadows.sm,
          animatedStyle,
        ]}
      >
        {/* Product Image & Badges */}
        <View style={isHorizontal ? styles.horizontalImageWrapper : styles.imageWrapper}>
          <Image
            source={{ uri: product.images[0] }}
            style={isHorizontal ? styles.horizontalImage : styles.image}
            resizeMode="cover"
          />

          {/* Top badges */}
          <View style={styles.topBadgesRow}>
            {product.discountPercentage > 0 ? (
              <Badge
                label={`-${product.discountPercentage}%`}
                variant="accent"
                size="sm"
              />
            ) : null}

            <TouchableOpacity
              onPress={handleToggleWishlist}
              style={[styles.wishlistBtn, { backgroundColor: colors.glassBg }]}
              activeOpacity={0.8}
            >
              <Feather
                name="heart"
                size={moderateScale(15)}
                color={isWishlisted ? colors.danger : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* MOQ pill overlay */}
          <View style={[styles.moqOverlay, { backgroundColor: 'rgba(11, 27, 58, 0.85)' }]}>
            <Text style={styles.moqOverlayText}>
              {t.moqLabel}: {product.moq} {product.unitType}s
            </Text>
          </View>
        </View>

        {/* Content details */}
        <View style={styles.content}>
          <Text style={[styles.brandText, { color: colors.secondary }]} numberOfLines={1}>
            {product.brand}
          </Text>

          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {product.title}
          </Text>

          {/* Company & Rating */}
          <View style={styles.companyRow}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={moderateScale(13)}
              color={colors.success}
            />
            <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
              {product.companyName}
            </Text>
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <View>
              <View style={styles.wholesaleRow}>
                <Text style={[styles.currency, { color: colors.accent }]}>৳</Text>
                <Text style={[styles.wholesalePrice, { color: colors.text }]}>
                  {product.wholesalePrice.toLocaleString()}
                </Text>
                <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                  /{product.unitType}
                </Text>
              </View>

              <View style={styles.retailRow}>
                <Text style={[styles.retailPrice, { color: colors.textMuted }]}>
                  MRP: ৳{product.pricePerUnit.toLocaleString()}
                </Text>
                {savingsAmount > 0 ? (
                  <Text style={[styles.savingsText, { color: colors.success }]}>
                    Save ৳{savingsAmount}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Quick Add To Cart Button */}
            <TouchableOpacity
              onPress={handleAddCart}
              style={[styles.addCartBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Feather name="shopping-bag" size={moderateScale(16)} color="#0B1B3A" />
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    width: '50%',
    padding: scale(6),
  },
  horizontalContainer: {
    width: scale(260),
    marginRight: scale(12),
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridCard: {
    width: '100%',
  },
  horizontalCard: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: verticalScale(140),
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  horizontalImageWrapper: {
    width: '100%',
    height: verticalScale(130),
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: scale(8),
    left: scale(8),
    right: scale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistBtn: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moqOverlay: {
    position: 'absolute',
    bottom: scale(6),
    left: scale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: radius.sm,
  },
  moqOverlayText: {
    color: '#FFFFFF',
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  content: {
    padding: scale(10),
  },
  brandText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: verticalScale(2),
  },
  title: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    lineHeight: moderateScale(17),
    height: verticalScale(34),
    marginBottom: verticalScale(4),
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  companyName: {
    fontSize: moderateScale(10),
    marginLeft: scale(4),
    flex: 1,
  },
  pricingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingTop: verticalScale(8),
  },
  wholesaleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginRight: scale(2),
  },
  wholesalePrice: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  unitText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    marginLeft: scale(2),
  },
  retailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  retailPrice: {
    fontSize: moderateScale(10),
    textDecorationLine: 'line-through',
    marginRight: scale(6),
  },
  savingsText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  addCartBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

