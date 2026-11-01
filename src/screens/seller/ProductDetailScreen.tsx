import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { Product } from '../../types';
import { useStore } from '../../store/useStore';
import { Badge } from '../../components/common/Badge';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { mockReviews } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onNavigateToCart: () => void;
  onOpenChat: (companyId: string) => void;
  onSelectRelated: (product: Product) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onNavigateToCart,
  onOpenChat,
  onSelectRelated,
}) => {
  const { colors, addToCart, wishlist, toggleWishlist, products, t } = useStore();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(product.moq);
  const [addedToast, setAddedToast] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const savingsPerUnit = product.pricePerUnit - product.wholesalePrice;
  const totalPrice = quantity * product.wholesalePrice;
  const totalSavings = quantity * savingsPerUnit;

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > product.moq) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setQuantity(prev => prev - 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  };

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onNavigateToCart();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Buy ${product.title} at wholesale rate ৳${product.wholesalePrice}/${product.unitType} on VoltMart B2B Marketplace!`,
      });
    } catch (e) {}
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
          {product.brand}
        </Text>

        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
            <Feather name="share-2" size={moderateScale(19)} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              toggleWishlist(product.id);
            }}
            style={styles.navBtn}
          >
            <Feather
              name="heart"
              size={moderateScale(20)}
              color={isWishlisted ? colors.danger : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Image Gallery Carousel */}
        <View style={styles.galleryWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / SCREEN_WIDTH);
              setActiveImageIdx(idx);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={[styles.galleryImage, { width: SCREEN_WIDTH }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination dots */}
          {product.images.length > 1 ? (
            <View style={styles.paginationRow}>
              {product.images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.galleryDot,
                    {
                      backgroundColor: idx === activeImageIdx ? colors.accent : 'rgba(255, 255, 255, 0.5)',
                      width: idx === activeImageIdx ? scale(16) : scale(6),
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {/* Discount badge */}
          {product.discountPercentage > 0 ? (
            <View style={styles.discountFloatingBadge}>
              <Badge
                label={`-${product.discountPercentage}% WHOLESALE OFF`}
                variant="accent"
              />
            </View>
          ) : null}
        </View>

        {/* Product Details Content */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.mainDetails}>
          {/* Brand & Category */}
          <View style={styles.metaRow}>
            <Text style={[styles.brandText, { color: colors.secondary }]}>
              {product.brand}
            </Text>
            <Badge label={product.category} variant="outline" size="sm" />
          </View>

          {/* Title */}
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {product.title}
          </Text>

          {/* Rating & Stock */}
          <View style={styles.ratingStockRow}>
            <View style={styles.ratingBubble}>
              <MaterialCommunityIcons name="star" size={moderateScale(15)} color="#F59E0B" />
              <Text style={styles.ratingScore}>{product.rating}</Text>
              <Text style={[styles.reviewsCount, { color: colors.textSecondary }]}>
                ({product.reviewsCount} reviews)
              </Text>
            </View>

            <Badge
              label={product.stockQuantity > 20 ? t.inStock : t.lowStock}
              variant={product.stockQuantity > 20 ? 'paid' : 'partial'}
              size="sm"
            />
          </View>

          {/* Wholesale Pricing Card */}
          <View
            style={[
              styles.pricingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
              shadows.sm,
            ]}
          >
            <View style={styles.priceRow}>
              <View>
                <Text style={[styles.pricingLabel, { color: colors.textSecondary }]}>
                  {t.wholesalePrice}
                </Text>
                <View style={styles.wholesaleBigRow}>
                  <Text style={[styles.currSign, { color: colors.accent }]}>৳</Text>
                  <Text style={[styles.wholesaleBigPrice, { color: colors.text }]}>
                    {product.wholesalePrice.toLocaleString()}
                  </Text>
                  <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>
                    /{product.unitType}
                  </Text>
                </View>
              </View>

              <View style={styles.retailCompareBox}>
                <Text style={[styles.pricingLabel, { color: colors.textMuted }]}>
                  {t.retailPrice}
                </Text>
                <Text style={[styles.retailOldPrice, { color: colors.textMuted }]}>
                  ৳{product.pricePerUnit.toLocaleString()}
                </Text>
                <Text style={[styles.savingsPill, { color: colors.success }]}>
                  Save ৳{savingsPerUnit} ({product.discountPercentage}%)
                </Text>
              </View>
            </View>

            {/* MOQ and Unit Notice */}
            <View style={[styles.moqBox, { backgroundColor: colors.backgroundSecondary }]}>
              <MaterialCommunityIcons name="information-outline" size={moderateScale(16)} color={colors.secondary} />
              <Text style={[styles.moqNoticeText, { color: colors.text }]}>
                {t.minOrderQtyNotice} <Text style={{ fontWeight: '800' }}>{product.moq} {product.unitType}s</Text>
              </Text>
            </View>
          </View>

          {/* Bulk Quantity Selector */}
          <View style={[styles.quantityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View>
              <Text style={[styles.qtyCardTitle, { color: colors.text }]}>Bulk Order Quantity</Text>
              <Text style={[styles.qtyCardSub, { color: colors.textSecondary }]}>
                Packaged in {product.unitType} units
              </Text>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={[
                  styles.stepperBtn,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    opacity: quantity <= product.moq ? 0.4 : 1,
                  },
                ]}
                disabled={quantity <= product.moq}
              >
                <Feather name="minus" size={moderateScale(18)} color={colors.text} />
              </TouchableOpacity>

              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={handleIncrement}
                style={[styles.stepperBtn, { backgroundColor: colors.accent }]}
              >
                <Feather name="plus" size={moderateScale(18)} color="#0B1B3A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Verified Manufacturer Profile Card */}
          <View
            style={[
              styles.manufacturerCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
              shadows.sm,
            ]}
          >
            <View style={styles.manufHeader}>
              <View style={[styles.manufAvatar, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="factory" size={moderateScale(22)} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.manufTitleRow}>
                  <Text style={[styles.manufName, { color: colors.text }]}>
                    {product.companyName}
                  </Text>
                  <MaterialCommunityIcons name="check-decagram" size={moderateScale(15)} color={colors.success} />
                </View>
                <Text style={[styles.manufMeta, { color: colors.textSecondary }]}>
                  {t.verifiedCompany} • BSTI Quality Assured
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => onOpenChat(product.companyId)}
              style={[styles.chatManufBtn, { backgroundColor: colors.backgroundSecondary }]}
              activeOpacity={0.8}
            >
              <Feather name="message-square" size={moderateScale(15)} color={colors.secondary} />
              <Text style={[styles.chatManufText, { color: colors.secondary }]}>
                Chat with Manufacturer Sales Rep
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warranty & Guarantee */}
          <View style={[styles.warrantyBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <MaterialCommunityIcons name="shield-check" size={moderateScale(24)} color={colors.success} />
            <View style={{ marginLeft: scale(10), flex: 1 }}>
              <Text style={[styles.warrantyTitle, { color: colors.success }]}>
                {t.warranty}
              </Text>
              <Text style={[styles.warrantyDesc, { color: colors.text }]}>
                {product.warrantyDuration}
              </Text>
            </View>
          </View>

          {/* Key Features & Specifications */}
          <View style={styles.sectionBox}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              {t.features}
            </Text>
            <Text style={[styles.productDescription, { color: colors.textSecondary }]}>
              {product.description}
            </Text>

            <View style={styles.featuresList}>
              {product.features.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check-circle" size={moderateScale(16)} color={colors.secondary} />
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {feat}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews & Ratings */}
          <View style={styles.sectionBox}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>
              {t.reviewsRatings}
            </Text>
            {mockReviews.map((rev, idx) => (
              <View
                key={rev.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                      {rev.buyerName}
                    </Text>
                    <Text style={[styles.reviewerShop, { color: colors.textSecondary }]}>
                      {rev.buyerShop}
                    </Text>
                  </View>

                  <View style={styles.reviewRating}>
                    <MaterialCommunityIcons name="star" size={moderateScale(14)} color="#F59E0B" />
                    <Text style={styles.reviewRatingScore}>{rev.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.reviewComment, { color: colors.text }]}>
                  "{rev.comment}"
                </Text>
              </View>
            ))}
          </View>

          {/* Related Products */}
          {relatedProducts.length > 0 ? (
            <View style={styles.sectionBox}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {t.relatedProducts}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: scale(10) }}>
                {relatedProducts.map((rel, idx) => (
                  <TouchableOpacity
                    key={rel.id}
                    onPress={() => onSelectRelated(rel)}
                    style={[styles.relatedCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <Image source={{ uri: rel.images[0] }} style={styles.relatedImg} resizeMode="cover" />
                    <Text style={[styles.relatedTitle, { color: colors.text }]} numberOfLines={1}>
                      {rel.title}
                    </Text>
                    <Text style={[styles.relatedPrice, { color: colors.secondary }]}>
                      ৳{rel.wholesalePrice}/{rel.unitType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Added to cart toast message */}
      {addedToast ? (
        <Animated.View entering={FadeInUp} style={[styles.toast, { backgroundColor: colors.primary }]}>
          <Feather name="check" size={moderateScale(18)} color="#FFB703" />
          <Text style={styles.toastText}>
            Added {quantity} {product.unitType}s to wholesale cart!
          </Text>
        </Animated.View>
      ) : null}

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }, shadows.lg]}>
        <View style={styles.bottomPriceCol}>
          <Text style={[styles.bottomTotalLabel, { color: colors.textSecondary }]}>
            Total Bulk ({quantity} {product.unitType}s)
          </Text>
          <Text style={[styles.bottomTotalPrice, { color: colors.text }]}>
            ৳{totalPrice.toLocaleString()}
          </Text>
          <Text style={[styles.bottomTotalSavings, { color: colors.success }]}>
            Saving ৳{totalSavings.toLocaleString()}
          </Text>
        </View>

        <View style={styles.bottomButtonsRow}>
          <AnimatedButton
            title={t.addToCart}
            onPress={handleAddToCart}
            variant="outline"
            size="md"
            style={{ marginRight: scale(8) }}
            icon={<Feather name="shopping-bag" size={moderateScale(16)} color={colors.text} />}
          />

          <AnimatedButton
            title={t.buyNow}
            onPress={handleBuyNow}
            variant="accent"
            size="md"
            icon={<Feather name="zap" size={moderateScale(16)} color="#0B1B3A" />}
          />
        </View>
      </View>
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
  navBtn: {
    padding: scale(6),
  },
  topBarTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: scale(10),
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  scrollBody: {
    paddingBottom: verticalScale(120),
  },
  galleryWrapper: {
    height: verticalScale(280),
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  galleryImage: {
    height: '100%',
  },
  paginationRow: {
    position: 'absolute',
    bottom: verticalScale(12),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryDot: {
    height: verticalScale(6),
    borderRadius: radius.pill,
    marginHorizontal: scale(3),
  },
  discountFloatingBadge: {
    position: 'absolute',
    top: verticalScale(14),
    left: scale(16),
  },
  mainDetails: {
    padding: scale(16),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  brandText: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(8),
  },
  ratingStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  ratingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginLeft: scale(4),
  },
  reviewsCount: {
    fontSize: moderateScale(12),
    marginLeft: scale(4),
  },
  pricingCard: {
    padding: scale(16),
    borderRadius: radius.xxl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  pricingLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  wholesaleBigRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: verticalScale(2),
  },
  currSign: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginRight: scale(2),
  },
  wholesaleBigPrice: {
    fontSize: moderateScale(26),
    fontWeight: '900',
  },
  unitLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  retailCompareBox: {
    alignItems: 'flex-end',
  },
  retailOldPrice: {
    fontSize: moderateScale(14),
    textDecorationLine: 'line-through',
    marginTop: verticalScale(2),
  },
  savingsPill: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginTop: verticalScale(3),
  },
  moqBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: radius.md,
  },
  moqNoticeText: {
    fontSize: moderateScale(12),
    marginLeft: scale(8),
  },
  quantityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  qtyCardTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  qtyCardSub: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  stepperBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    minWidth: scale(32),
    textAlign: 'center',
  },
  manufacturerCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  manufHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  manufAvatar: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  manufTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manufName: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginRight: scale(4),
  },
  manufMeta: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  chatManufBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(8),
    borderRadius: radius.md,
  },
  chatManufText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  warrantyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(12),
    borderRadius: radius.lg,
    marginBottom: verticalScale(16),
  },
  warrantyTitle: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  warrantyDesc: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  sectionBox: {
    marginBottom: verticalScale(20),
  },
  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginBottom: verticalScale(8),
  },
  productDescription: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    marginBottom: verticalScale(10),
  },
  featuresList: {
    gap: verticalScale(6),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: moderateScale(13),
    marginLeft: scale(8),
    flex: 1,
    lineHeight: moderateScale(18),
  },
  reviewCard: {
    padding: scale(12),
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  reviewerName: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  reviewerShop: {
    fontSize: moderateScale(10),
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingScore: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(2),
  },
  reviewComment: {
    fontSize: moderateScale(12),
    fontStyle: 'italic',
    lineHeight: moderateScale(16),
  },
  relatedCard: {
    width: scale(130),
    padding: scale(8),
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  relatedImg: {
    width: '100%',
    height: verticalScale(80),
    borderRadius: radius.md,
    marginBottom: verticalScale(6),
  },
  relatedTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  relatedPrice: {
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  toast: {
    position: 'absolute',
    top: verticalScale(90),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: radius.pill,
    zIndex: 100,
    ...shadows.md,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderTopWidth: 1,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  bottomTotalPrice: {
    fontSize: moderateScale(18),
    fontWeight: '900',
  },
  bottomTotalSavings: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

