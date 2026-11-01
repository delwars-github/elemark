import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { Product, ProductCategory, UnitType } from '../../types';
import { InputField } from '../../components/common/InputField';
import { AnimatedButton } from '../../components/common/AnimatedButton';

interface AddEditProductScreenProps {
  productToEdit?: Product;
  onBack: () => void;
  onSuccess: () => void;
}

export const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({
  productToEdit,
  onBack,
  onSuccess,
}) => {
  const { user, addProduct, updateProduct, colors, t } = useStore();
  const isEditing = !!productToEdit;

  // Form states
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [brand, setBrand] = useState(productToEdit?.brand || user?.businessName?.split(' ')[0] || 'Super Star');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'Switches & Sockets');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [featuresStr, setFeaturesStr] = useState(productToEdit?.features.join(', ') || '');
  const [mrpStr, setMrpStr] = useState(productToEdit ? String(productToEdit.pricePerUnit) : '');
  const [wholesaleStr, setWholesaleStr] = useState(productToEdit ? String(productToEdit.wholesalePrice) : '');
  const [moqStr, setMoqStr] = useState(productToEdit ? String(productToEdit.moq) : '10');
  const [stockStr, setStockStr] = useState(productToEdit ? String(productToEdit.stockQuantity) : '200');
  const [unitType, setUnitType] = useState<UnitType>(productToEdit?.unitType || 'box');
  const [warranty, setWarranty] = useState(productToEdit?.warrantyDuration || '24 Months Replacement');
  const [discountStr, setDiscountStr] = useState(productToEdit ? String(productToEdit.discountPercentage) : '15');
  const [tagsStr, setTagsStr] = useState(productToEdit?.tags.join(', ') || 'Electrical, Wholesale, Bulk');
  const [images, setImages] = useState<string[]>(
    productToEdit?.images || [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    ]
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: ProductCategory[] = [
    'Cables & Wires',
    'Switches & Sockets',
    'Circuit Breakers & MCB',
    'LED Lighting & Fixtures',
    'Distribution Boxes & DB',
    'Fans & Ventilation',
    'Solar & Inverters',
    'Electrician Tools & Meters',
  ];

  const unitTypes: UnitType[] = ['piece', 'box', 'carton', 'coil'];

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (e) {
      // Mock fallback image if permissions or device simulation
      setImages([
        ...images,
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      ]);
    }
  };

  const handleSaveProduct = async () => {
    setErrors({});
    if (!title.trim()) {
      setErrors({ title: 'Product title is required' });
      return;
    }
    const mrp = parseFloat(mrpStr);
    const wholesale = parseFloat(wholesaleStr);
    const moq = parseInt(moqStr, 10);
    const stock = parseInt(stockStr, 10);

    if (isNaN(mrp) || mrp <= 0) {
      setErrors({ mrp: 'Enter valid MRP' });
      return;
    }
    if (isNaN(wholesale) || wholesale <= 0) {
      setErrors({ wholesale: 'Enter valid wholesale price' });
      return;
    }
    if (wholesale >= mrp) {
      setErrors({ wholesale: 'Wholesale price must be lower than MRP' });
      return;
    }

    setLoading(true);
    try {
      const features = featuresStr
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const tags = tagsStr
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const discount = Math.round(((mrp - wholesale) / mrp) * 100);

      if (isEditing && productToEdit) {
        await updateProduct(productToEdit.id, {
          title,
          brand,
          category,
          description,
          features,
          pricePerUnit: mrp,
          wholesalePrice: wholesale,
          moq: isNaN(moq) ? 5 : moq,
          stockQuantity: isNaN(stock) ? 100 : stock,
          unitType,
          warrantyDuration: warranty,
          discountPercentage: discount,
          tags,
          images,
        });
      } else {
        await addProduct({
          companyId: user?.id || 'comp_superstar',
          companyName: user?.businessName || 'Super Star Group (SSG)',
          companyLogo: user?.logo,
          title,
          brand,
          category,
          description,
          features: features.length > 0 ? features : ['100% Genuine Electrical Component', 'BSTI Tested'],
          pricePerUnit: mrp,
          wholesalePrice: wholesale,
          moq: isNaN(moq) ? 5 : moq,
          stockQuantity: isNaN(stock) ? 100 : stock,
          unitType,
          warrantyDuration: warranty,
          discountPercentage: discount,
          tags: tags.length > 0 ? tags : ['Electrical', 'Wholesale'],
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=600&auto=format&fit=crop&q=80'],
          rating: 5.0,
          reviewsCount: 1,
          isFlashDeal: false,
          isBestSeller: true,
          isNewArrival: true,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSuccess();
    } catch (e) {
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>
          {isEditing ? t.editProductTitle : t.uploadProductTitle}
        </Text>
        <View style={{ width: scale(32) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Product Images Selector */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t.productImages}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagesRow}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageThumbBox}>
                <Image source={{ uri: img }} style={styles.thumbImg} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => setImages(images.filter((_, i) => i !== idx))}
                  style={styles.removeImgBtn}
                >
                  <Feather name="x" size={moderateScale(12)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={handlePickImage}
              style={[styles.addImageBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={moderateScale(22)} color={colors.secondary} />
              <Text style={[styles.addImageText, { color: colors.secondary }]}>+ Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* General Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}>
          <InputField
            label={t.productTitle}
            placeholder="e.g. 2.5 RM FR Annealed Copper Wire 100m Coil"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <InputField
            label={t.brand}
            placeholder="e.g. BRB Cables, Super Star, Schneider"
            value={brand}
            onChangeText={setBrand}
          />

          {/* Category Picker Chips */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: verticalScale(6) }]}>
            {t.category}
          </Text>
          <View style={styles.chipsWrap}>
            {categories.map(cat => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? colors.accent : colors.text,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Unit Type Selection */}
          <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: verticalScale(14), marginBottom: verticalScale(6) }]}>
            {t.unitSelect}
          </Text>
          <View style={styles.chipsWrap}>
            {unitTypes.map(u => {
              const isSelected = unitType === u;
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnitType(u)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.secondary : colors.backgroundSecondary,
                      borderColor: isSelected ? colors.secondary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {u.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pricing & Bulk Order Controls */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}>
          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: scale(8) }}>
              <InputField
                label={t.pricePerUnitInput}
                placeholder="4850"
                keyboardType="numeric"
                value={mrpStr}
                onChangeText={setMrpStr}
                error={errors.mrp}
              />
            </View>

            <View style={{ flex: 1, marginLeft: scale(8) }}>
              <InputField
                label={t.wholesalePriceInput}
                placeholder="4150"
                keyboardType="numeric"
                value={wholesaleStr}
                onChangeText={setWholesaleStr}
                error={errors.wholesale}
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1, marginRight: scale(8) }}>
              <InputField
                label={t.moqInput}
                placeholder="10"
                keyboardType="numeric"
                value={moqStr}
                onChangeText={setMoqStr}
              />
            </View>

            <View style={{ flex: 1, marginLeft: scale(8) }}>
              <InputField
                label={t.stockInput}
                placeholder="500"
                keyboardType="numeric"
                value={stockStr}
                onChangeText={setStockStr}
              />
            </View>
          </View>

          <InputField
            label={t.warrantyInput}
            placeholder="e.g. 5 Years Replacement Guarantee"
            value={warranty}
            onChangeText={setWarranty}
          />
        </View>

        {/* Features & Description */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm]}>
          <InputField
            label={t.description}
            placeholder="Describe electrical specifications, testing certifications..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <InputField
            label={t.keyFeaturesInput}
            placeholder="100% Copper, Fire Retardant, BSTI Certified"
            value={featuresStr}
            onChangeText={setFeaturesStr}
          />

          <InputField
            label={t.tagsInput}
            placeholder="Wire, Cables, 2.5 RM, BSTI, Fireproof"
            value={tagsStr}
            onChangeText={setTagsStr}
          />
        </View>

        {/* Action Button */}
        <AnimatedButton
          title={isEditing ? t.updateProduct : t.publishProduct}
          onPress={handleSaveProduct}
          variant="accent"
          size="lg"
          loading={loading}
          style={{ marginTop: verticalScale(10) }}
          icon={<Feather name="upload-cloud" size={moderateScale(18)} color="#0B1B3A" />}
        />
      </ScrollView>
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
  backBtn: {
    padding: scale(6),
  },
  topBarTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(60),
  },
  sectionCard: {
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(14),
  },
  fieldLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  imagesRow: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
    gap: scale(10),
  },
  imageThumbBox: {
    position: 'relative',
    width: scale(80),
    height: scale(80),
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  removeImgBtn: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: scale(20),
    height: scale(20),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: scale(80),
    height: scale(80),
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    marginTop: verticalScale(4),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  chip: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    borderRadius: radius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: moderateScale(11),
  },
  rowTwoCols: {
    flexDirection: 'row',
  },
});

