import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { ProductCard } from '../../components/product/ProductCard';
import { Product, ProductCategory } from '../../types';
import { AnimatedButton } from '../../components/common/AnimatedButton';

interface SellerProductsScreenProps {
  initialCategory?: ProductCategory;
  onSelectProduct: (product: Product) => void;
}

export const SellerProductsScreen: React.FC<SellerProductsScreenProps> = ({
  initialCategory,
  onSelectProduct,
}) => {
  const { products, colors, t } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'discount' | 'moq'>('discount');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const categories = [
    'ALL',
    'Cables & Wires',
    'Switches & Sockets',
    'Circuit Breakers & MCB',
    'LED Lighting & Fixtures',
    'Distribution Boxes & DB',
    'Fans & Ventilation',
    'Solar & Inverters',
  ];

  const brands = ['ALL', 'BRB Cables', 'Super Star', 'Schneider Electric', 'Walton'];

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.isHidden) return false;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'ALL' || p.brand.toLowerCase().includes(selectedBrand.toLowerCase());

      return matchesSearch && matchesCat && matchesBrand;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.wholesalePrice - b.wholesalePrice;
      if (sortBy === 'price_high') return b.wholesalePrice - a.wholesalePrice;
      if (sortBy === 'moq') return a.moq - b.moq;
      return b.discountPercentage - a.discountPercentage;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setSortBy('discount');
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Search Bar */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={moderateScale(18)} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: scale(4) }}>
              <Feather name="x" size={moderateScale(16)} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setFilterModalVisible(true);
          }}
          style={[styles.filterBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={moderateScale(18)} color="#0B1B3A" />
        </TouchableOpacity>
      </View>

      {/* Category Pills horizontal bar */}
      <View style={styles.catBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catBar}>
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: isSelected ? colors.accent : colors.textSecondary },
                  ]}
                >
                  {cat === 'ALL' ? 'All Electricals' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredProducts.length} wholesale products found
        </Text>
      </View>

      {/* Products Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify-close" size={moderateScale(54)} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No products match your filter</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try searching with another keyword or reset the category filters.
            </Text>
            <AnimatedButton
              title="Reset All Filters"
              onPress={handleResetFilters}
              variant="outline"
              style={{ marginTop: verticalScale(14) }}
            />
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredProducts.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                product={prod}
                layout="grid"
                index={idx}
                onPress={() => onSelectProduct(prod)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal Sheet */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.filter} & {t.sort}</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={moderateScale(20)} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort By */}
              <Text style={[styles.filterGroupTitle, { color: colors.textSecondary }]}>{t.sort}</Text>
              <View style={styles.chipsWrap}>
                {[
                  { key: 'discount', label: 'Highest Discount %' },
                  { key: 'price_low', label: 'Price: Low to High' },
                  { key: 'price_high', label: 'Price: High to Low' },
                  { key: 'moq', label: 'Lowest MOQ' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setSortBy(item.key as any)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: sortBy === item.key ? 'rgba(37, 99, 235, 0.12)' : colors.backgroundSecondary,
                        borderColor: sortBy === item.key ? colors.secondary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: sortBy === item.key ? colors.secondary : colors.text,
                          fontWeight: sortBy === item.key ? '800' : '500',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Brands */}
              <Text style={[styles.filterGroupTitle, { color: colors.textSecondary, marginTop: verticalScale(14) }]}>
                {t.brand}
              </Text>
              <View style={styles.chipsWrap}>
                {brands.map(brand => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => setSelectedBrand(brand)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedBrand === brand ? 'rgba(255, 183, 3, 0.2)' : colors.backgroundSecondary,
                        borderColor: selectedBrand === brand ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: selectedBrand === brand ? '#0B1B3A' : colors.text,
                          fontWeight: selectedBrand === brand ? '800' : '500',
                        },
                      ]}
                    >
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <AnimatedButton
                title={t.reset}
                onPress={handleResetFilters}
                variant="outline"
                style={{ flex: 1, marginRight: scale(8) }}
              />
              <AnimatedButton
                title={t.apply}
                onPress={() => setFilterModalVisible(false)}
                variant="accent"
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(45),
    paddingBottom: verticalScale(12),
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: scale(12),
    height: verticalScale(44),
    marginRight: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    marginLeft: scale(8),
    paddingVertical: 0,
  },
  filterBtn: {
    width: scale(44),
    height: verticalScale(44),
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBarWrapper: {
    paddingVertical: verticalScale(8),
  },
  catBar: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  catChip: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(7),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  resultsHeader: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(6),
  },
  resultsCount: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  scrollList: {
    paddingBottom: verticalScale(90),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(10),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(60),
    paddingHorizontal: scale(30),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(6),
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: scale(20),
    maxHeight: '75%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  filterGroupTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  filterChip: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: moderateScale(12),
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: verticalScale(20),
  },
});

