import { moderateScale } from 'react-native-size-matters';

export const typography = {
  // Font Sizes scaled with moderateScale
  xs: moderateScale(11),
  sm: moderateScale(13),
  md: moderateScale(15),
  lg: moderateScale(17),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(28),
  display: moderateScale(34),

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeights: {
    xs: moderateScale(15),
    sm: moderateScale(18),
    md: moderateScale(22),
    lg: moderateScale(24),
    xl: moderateScale(28),
    xxl: moderateScale(32),
    xxxl: moderateScale(38),
    display: moderateScale(44),
  },
};

