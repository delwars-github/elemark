import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { Product } from '../../types';
import { Badge } from '../../components/common/Badge';

interface CompanyProductsScreenProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}

export const CompanyProductsScreen: React.FC<CompanyProductsScreenProps> = ({
  onAddProduct,
  onEditProduct,
}) => {
  const {
    companyProducts,
    deleteProduct,
    toggleHideProduct,
    colors,
    t,
  } = useStore();

  const handleDelete = (prod: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${prod.title}" from wholesale inventory?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            deleteProduct(prod.id);
          },
        },
      ]
    );
  };

  const handleToggleHide = (prod: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleHideProduct(prod.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {t.manageProducts} ({companyProducts.length})
        </Text>
        <TouchableOpacity
          onPress={onAddProduct}
          style={[styles.addBtnTop, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={moderateScale(18)} color="#0B1B3A" />
          <Text style={styles.addBtnTopText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {companyProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="package-variant" size={moderateScale(54)} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No products listed yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start selling to thousands of verified electrical shopkeepers by uploading your products.
            </Text>
          </View>
        ) : (
          companyProducts.map((prod, idx) => (
            <Animated.View
              key={prod.id}
              entering={FadeInDown.delay(idx * 60).duration(400)}
              style={[
                styles.productCard,
                {
                  backgroundColor: colors.card,
                  borderColor: prod.isHidden ? colors.border : colors.cardBorder,
                  opacity: prod.isHidden ? 0.75 : 1,
                },
                shadows.sm,
              ]}
            >
              <View style={styles.topInfoRow}>
                <Image source={{ uri: prod.images[0] }} style={styles.prodImg} resizeMode="cover" />

                <View style={styles.detailsCol}>
                  <View style={styles.titleStatusRow}>
                    <Text style={[styles.prodTitle, { color: colors.text }]} numberOfLines={2}>
                      {prod.title}
                    </Text>
                  </View>

                  <Text style={[styles.categoryText, { color: colors.secondary }]}>
                    {prod.category} • {prod.brand}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text style={[styles.wholesalePrice, { color: colors.text }]}>
                      ৳{prod.wholesalePrice.toLocaleString()}
                    </Text>
                    <Text style={[styles.mrpText, { color: colors.textMuted }]}>
                      MRP: ৳{prod.pricePerUnit.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status and Stock pill */}
              <View style={[styles.stockPillRow, { borderTopColor: colors.border }]}>
                <View style={styles.stockItem}>
                  <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Stock:</Text>
                  <Text style={[styles.stockVal, { color: colors.text }]}>
                    {prod.stockQuantity} {prod.unitType}s
                  </Text>
                </View>

                <View style={styles.stockItem}>
                  <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>MOQ:</Text>
                  <Text style={[styles.stockVal, { color: colors.text }]}>
                    {prod.moq} {prod.unitType}s
                  </Text>
                </View>

                <Badge
                  label={prod.isHidden ? 'Hidden' : 'Live on Market'}
                  variant={prod.isHidden ? 'due' : 'paid'}
                  size="sm"
                />
              </View>

              {/* Action buttons footer */}
              <View style={[styles.actionsFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => handleToggleHide(prod)}
                  style={styles.actionBtn}
                >
                  <Feather
                    name={prod.isHidden ? 'eye' : 'eye-off'}
                    size={moderateScale(15)}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                    {prod.isHidden ? t.unhide : t.hide}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onEditProduct(prod)}
                  style={styles.actionBtn}
                >
                  <Feather name="edit-2" size={moderateScale(15)} color={colors.secondary} />
                  <Text style={[styles.actionBtnText, { color: colors.secondary }]}>
                    {t.edit}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(prod)}
                  style={styles.actionBtn}
                >
                  <Feather name="trash-2" size={moderateScale(15)} color={colors.danger} />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                    {t.delete}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button (+ Add Product) */}
      <TouchableOpacity
        onPress={onAddProduct}
        style={[styles.fab, { backgroundColor: colors.accent }, shadows.lg]}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={moderateScale(26)} color="#0B1B3A" />
      </TouchableOpacity>
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
  topBarTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  addBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.md,
  },
  addBtnTopText: {
    color: '#0B1B3A',
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginLeft: scale(4),
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(80),
    paddingHorizontal: scale(30),
  },
  emptyTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    marginTop: verticalScale(12),
  },
  emptySubtitle: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(4),
  },
  productCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: scale(12),
    marginBottom: verticalScale(14),
  },
  topInfoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
  },
  prodImg: {
    width: scale(75),
    height: scale(75),
    borderRadius: radius.lg,
    backgroundColor: '#F1F5F9',
  },
  detailsCol: {
    flex: 1,
    marginLeft: scale(12),
    justifyContent: 'center',
  },
  titleStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prodTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    lineHeight: moderateScale(17),
  },
  categoryText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
    gap: scale(8),
  },
  wholesalePrice: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  mrpText: {
    fontSize: moderateScale(11),
    textDecorationLine: 'line-through',
  },
  stockPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: verticalScale(8),
    marginBottom: verticalScale(8),
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: moderateScale(11),
    marginRight: scale(4),
  },
  stockVal: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  actionsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: verticalScale(8),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
  },
  actionBtnText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: scale(6),
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(24),
    right: scale(20),
    width: scale(54),
    height: scale(54),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

