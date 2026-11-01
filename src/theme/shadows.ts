import { Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

export const shadows = {
  sm: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1B3A',
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowOpacity: 0.06,
        shadowRadius: moderateScale(4),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  md: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1B3A',
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.1,
        shadowRadius: moderateScale(8),
      },
      android: {
        elevation: 4,
      },
    }),
  },
  lg: {
    ...Platform.select({
      ios: {
        shadowColor: '#0B1B3A',
        shadowOffset: { width: 0, height: moderateScale(8) },
        shadowOpacity: 0.14,
        shadowRadius: moderateScale(16),
      },
      android: {
        elevation: 8,
      },
    }),
  },
  goldGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#FFB703',
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.35,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 6,
      },
    }),
  },
  blueGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: moderateScale(12),
      },
      android: {
        elevation: 6,
      },
    }),
  },
};

