import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';

interface TabItem {
  key: string;
  label: string;
  iconName: string;
  iconType: 'feather' | 'material';
  badgeCount?: number;
}

export const AnimatedTabBar: React.FC = () => {
  const { role, activeTab, setActiveTab, colors, cart, unreadNotificationsCount, companyPendingOrdersCount, t } = useStore();

  const sellerTabs: TabItem[] = [
    { key: 'Home', label: 'Home', iconName: 'home', iconType: 'feather' },
    { key: 'Products', label: 'Catalog', iconName: 'grid', iconType: 'feather' },
    { key: 'Cart', label: 'Cart', iconName: 'shopping-bag', iconType: 'feather', badgeCount: cart.length },
    { key: 'Ledger', label: 'Khata (বাকি)', iconName: 'book-open', iconType: 'feather' },
    { key: 'Profile', label: 'Account', iconName: 'user', iconType: 'feather' },
  ];

  const companyTabs: TabItem[] = [
    { key: 'Dashboard', label: 'Overview', iconName: 'activity', iconType: 'feather' },
    { key: 'Products', label: 'Inventory', iconName: 'box', iconType: 'feather' },
    { key: 'Orders', label: 'Orders', iconName: 'truck', iconType: 'feather', badgeCount: companyPendingOrdersCount },
    { key: 'Ledger', label: 'Dues (বাকি)', iconName: 'file-text', iconType: 'feather' },
    { key: 'Profile', label: 'Settings', iconName: 'settings', iconType: 'feather' },
  ];

  const tabs = role === 'COMPANY' ? companyTabs : sellerTabs;

  const handleTabPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(key);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
        },
        shadows.lg,
      ]}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                isActive && {
                  backgroundColor: colors.accent,
                  borderRadius: radius.pill,
                  paddingHorizontal: scale(12),
                  paddingVertical: verticalScale(4),
                },
              ]}
            >
              <View>
                {tab.iconType === 'material' ? (
                  <MaterialCommunityIcons
                    name={tab.iconName as any}
                    size={moderateScale(21)}
                    color={isActive ? '#0B1B3A' : colors.textMuted}
                  />
                ) : (
                  <Feather
                    name={tab.iconName as any}
                    size={moderateScale(20)}
                    color={isActive ? '#0B1B3A' : colors.textMuted}
                  />
                )}

                {tab.badgeCount && tab.badgeCount > 0 ? (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.danger },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {tab.badgeCount > 9 ? '9+' : tab.badgeCount}
                    </Text>
                  </View>
                ) : null}
              </View>

              {isActive ? (
                <Text
                  style={[
                    styles.activeLabel,
                    { color: '#0B1B3A' },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              ) : null}
            </Animated.View>

            {!isActive ? (
              <Text
                style={[
                  styles.inactiveLabel,
                  { color: colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: verticalScale(64),
    borderTopWidth: 1,
    paddingHorizontal: scale(10),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeLabel: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    marginLeft: scale(6),
  },
  inactiveLabel: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    marginTop: verticalScale(3),
  },
  badge: {
    position: 'absolute',
    top: -verticalScale(5),
    right: -scale(9),
    minWidth: scale(16),
    height: scale(16),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(2),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(9),
    fontWeight: '800',
  },
});

