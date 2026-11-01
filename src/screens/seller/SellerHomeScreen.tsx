import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { ProductCard } from '../../components/product/ProductCard';
import { Badge } from '../../components/common/Badge';
import { ProductCategory, Product } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SellerHomeScreenProps {
  onSelectProduct: (product: Product) => void;
  onNavigateToCatalog: (category?: ProductCategory) => void;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
}

export const SellerHomeScreen: React.FC<SellerHomeScreenProps> = ({
  onSelectProduct,
  onNavigateToCatalog,
  onOpenNotifications,
  onOpenChat,
}) => {
  const {
    user,
    colors,
    products,
    language,
    toggleLanguage,
    unreadNotificationsCount,
    t,
  } = useStore();

  const [activeBanner, setActiveBanner] = useState(0);

  const categories: { name: ProductCategory; icon: string; label: string }[] = [
    { name: 'Cables & Wires', icon: 'transit-connection-variant', label: 'Cables & Wires' },
    { name: 'Switches & Sockets', icon: 'power-socket-eu', label: 'Switches' },
    { name: 'Circuit Breakers & MCB', icon: 'fuse', label: 'Circuit Breakers' },
    { name: 'LED Lighting & Fixtures', icon: 'lightbulb-on-outline', label: 'LED Lights' },
    { name: 'Distribution Boxes & DB', icon: 'archive-outline', label: 'DB Boxes' },
    { name: 'Fans & Ventilation', icon: 'fan', label: 'Fans' },
    { name: 'Solar & Inverters', icon: 'solar-power', label: 'Solar' },
  ];

  const banners = [
    {
      id: 'ban_1',
      title: 'BRB Copper Cables Bulk Deal',
      subtitle: 'Flat 14% Manufacturer Wholesale Discount',
      badge: 'POPULAR B2B',
      gradient: ['#0B1B3A', '#1E3A8A'] as [string, string],
      image: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'ban_2',
      title: 'Super Star Royal Modular Switches',
      subtitle: 'Free Shop Display Board with 50+ Boxes',
      badge: 'SPECIAL PROMO',
      gradient: ['#78350F', '#B45309'] as [string, string],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'ban_3',
      title: 'Schneider Easy9 Circuit Breakers',
      subtitle: 'Genuine European Quality with 3-Year Warranty',
      badge: 'PREMIUM SAFETY',
      gradient: ['#064E3B', '#047857'] as [string, string],
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const flashDeals = products.filter(p => p.isFlashDeal);
  const bestSellers = products.filter(p => p.isBestSeller);
  const topBrands = [
    { name: 'BRB Cables', logo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80' },
    { name: 'Super Star', logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80' },
    { name: 'Schneider', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80' },
    { name: 'Walton Power', logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=80' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top App Bar Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="store" size={moderateScale(20)} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.shopRow}>
              <Text style={[styles.shopName, { color: colors.text }]} numberOfLines={1}>
                {user?.businessName || 'Bismillah Hardware Store'}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={moderateScale(15)} color={colors.success} />
            </View>
            <View style={styles.creditPill}>
              <Text style={[styles.creditText, { color: colors.secondary }]}>
                Credit Limit: ৳{(user?.availableCredit || 195000).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language Switcher */}
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.actionIconBtn, { backgroundColor: colors.backgroundSecondary }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.langText, { color: colors.text }]}>
              {language === 'en' ? 'বাংলা' : 'EN'}
            </Text>
          </TouchableOpacity>

          {/* Chat icon */}
          <TouchableOpacity
            onPress={onOpenChat}
            style={[styles.actionIconBtn, { backgroundColor: colors.backgroundSecondary }]}
            activeOpacity={0.7}
          >
            <Feather name="message-square" size={moderateScale(18)} color={colors.text} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={onOpenNotifications}
            style={[styles.actionIconBtn, { backgroundColor: colors.backgroundSecondary }]}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={moderateScale(18)} color={colors.text} />
            {unreadNotificationsCount > 0 ? (
              <View style={[styles.notifBadge, { backgroundColor: colors.danger }]} />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Search Bar Input Trigger */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.searchSection}>
          <TouchableOpacity
            onPress={() => onNavigateToCatalog()}
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
              shadows.sm,
            ]}
            activeOpacity={0.9}
          >
            <Feather name="search" size={moderateScale(18)} color={colors.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
              {t.searchPlaceholder}
            </Text>
            <View style={[styles.filterIconBtn, { backgroundColor: colors.accent }]}>
              <Feather name="sliders" size={moderateScale(14)} color="#0B1B3A" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Animated Banner Carousel */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.bannerSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const x = e.nativeEvent.contentOffset.x;
              const idx = Math.round(x / (SCREEN_WIDTH - scale(32)));
              setActiveBanner(idx);
            }}
            scrollEventThrottle={16}
          >
            {banners.map(b => (
              <LinearGradient
                key={b.id}
                colors={b.gradient}
                style={[styles.bannerCard, { width: SCREEN_WIDTH - scale(32) }]}
              >
                <View style={styles.bannerContent}>
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>{b.badge}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                  <TouchableOpacity
                    onPress={() => onNavigateToCatalog()}
                    style={styles.bannerBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bannerBtnText}>Order Bulk Now</Text>
                    <Feather name="arrow-right" size={moderateScale(13)} color="#0B1B3A" />
                  </TouchableOpacity>
                </View>

                <Image source={{ uri: b.image }} style={styles.bannerImage} resizeMode="cover" />
              </LinearGradient>
            ))}
          </ScrollView>

          {/* Dots */}
          <View style={styles.bannerDots}>
            {banners.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.bannerDot,
                  {
                    backgroundColor: idx === activeBanner ? colors.accent : 'rgba(255, 255, 255, 0.4)',
                    width: idx === activeBanner ? scale(18) : scale(6),
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Categories Section */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.categories}</Text>
            <TouchableOpacity onPress={() => onNavigateToCatalog()}>
              <Text style={[styles.seeAllText, { color: colors.secondary }]}>{t.seeAll}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat, idx) => (
              <TouchableOpacity
                key={cat.name}
                onPress={() => onNavigateToCatalog(cat.name)}
                style={styles.categoryItem}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                    shadows.sm,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={moderateScale(24)}
                    color={colors.secondary}
                  />
                </View>
                <Text style={[styles.categoryLabel, { color: colors.text }]} numberOfLines={1}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Flash Deals Horizontal Carousel */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <View style={styles.dealTitleRow}>
              <MaterialCommunityIcons name="lightning-bolt" size={moderateScale(20)} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: scale(4) }]}>
                {t.flashDeals}
              </Text>
            </View>
            <View style={[styles.countdownBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Feather name="clock" size={moderateScale(12)} color={colors.danger} />
              <Text style={[styles.countdownText, { color: colors.danger }]}>08h:42m</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalProductsScroll}>
            {flashDeals.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                product={prod}
                layout="horizontal"
                index={idx}
                onPress={() => onSelectProduct(prod)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Top Electrical Brands */}
        <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.topBrands}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
            {topBrands.map((brand, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onNavigateToCatalog()}
                style={[
                  styles.brandChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                  shadows.sm,
                ]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: brand.logo }} style={styles.brandLogo} resizeMode="cover" />
                <Text style={[styles.brandChipName, { color: colors.text }]}>{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Best Sellers Grid */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.bestSellers}</Text>
            <TouchableOpacity onPress={() => onNavigateToCatalog()}>
              <Text style={[styles.seeAllText, { color: colors.secondary }]}>{t.seeAll}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridWrapper}>
            {bestSellers.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                product={prod}
                layout="grid"
                index={idx}
                onPress={() => onSelectProduct(prod)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(45),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(10),
  },
  avatarBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginRight: scale(4),
  },
  creditPill: {
    marginTop: verticalScale(2),
  },
  creditText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  actionIconBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  langText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  notifBadge: {
    position: 'absolute',
    top: scale(7),
    right: scale(7),
    width: scale(8),
    height: scale(8),
    borderRadius: radius.pill,
  },
  scrollBody: {
    paddingBottom: verticalScale(90),
  },
  searchSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(12),
    marginBottom: verticalScale(12),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: scale(14),
    height: verticalScale(46),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: moderateScale(13),
    marginLeft: scale(10),
  },
  filterIconBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSection: {
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
  },
  bannerCard: {
    borderRadius: radius.xxl,
    height: verticalScale(145),
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    flex: 1.2,
    padding: scale(14),
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 183, 3, 0.25)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: radius.pill,
    marginBottom: verticalScale(6),
  },
  bannerBadgeText: {
    color: '#FFB703',
    fontSize: moderateScale(9),
    fontWeight: '800',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '800',
    lineHeight: moderateScale(19),
  },
  bannerSubtitle: {
    color: '#CBD5E1',
    fontSize: moderateScale(11),
    marginTop: verticalScale(3),
    marginBottom: verticalScale(8),
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB703',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: radius.md,
  },
  bannerBtnText: {
    color: '#0B1B3A',
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginRight: scale(4),
  },
  bannerImage: {
    flex: 0.8,
    height: '100%',
    opacity: 0.85,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  bannerDot: {
    height: verticalScale(5),
    borderRadius: radius.pill,
    marginHorizontal: scale(3),
  },
  sectionWrapper: {
    marginBottom: verticalScale(18),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  categoryScroll: {
    paddingHorizontal: scale(12),
    gap: scale(10),
  },
  categoryItem: {
    alignItems: 'center',
    width: scale(68),
  },
  categoryIconCircle: {
    width: scale(52),
    height: scale(52),
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: verticalScale(6),
  },
  categoryLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    textAlign: 'center',
  },
  dealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: radius.pill,
  },
  countdownText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginLeft: scale(4),
  },
  horizontalProductsScroll: {
    paddingHorizontal: scale(16),
  },
  brandsScroll: {
    paddingHorizontal: scale(16),
    gap: scale(10),
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  brandLogo: {
    width: scale(24),
    height: scale(24),
    borderRadius: radius.pill,
    marginRight: scale(8),
  },
  brandChipName: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(10),
  },
});

