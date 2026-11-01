import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { NotificationItem } from '../../types';

interface NotificationsScreenProps {
  onBack: () => void;
  onSelectNotification?: (notif: NotificationItem) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onSelectNotification,
}) => {
  const { notifications, markAllNotificationsRead, colors, t } = useStore();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ORDER':
        return { name: 'truck-delivery', color: colors.secondary, bg: 'rgba(37, 99, 235, 0.12)' };
      case 'DUE':
        return { name: 'clock-alert-outline', color: colors.danger, bg: 'rgba(239, 68, 68, 0.12)' };
      case 'PAYMENT':
        return { name: 'cash-check', color: colors.success, bg: 'rgba(16, 185, 129, 0.12)' };
      case 'PROMO':
        return { name: 'lightning-bolt', color: colors.accent, bg: 'rgba(255, 183, 3, 0.2)' };
      default:
        return { name: 'bell-outline', color: colors.textSecondary, bg: colors.backgroundSecondary };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>{t.notificationsTitle}</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            markAllNotificationsRead();
          }}
          style={styles.markReadBtn}
        >
          <Text style={[styles.markReadText, { color: colors.secondary }]}>
            {t.markAllRead}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['ALL', 'ORDER', 'DUE', 'PAYMENT', 'PROMO'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setFilterType(tab);
            }}
            style={[
              styles.tabPill,
              {
                backgroundColor: filterType === tab ? colors.primary : colors.card,
                borderColor: filterType === tab ? colors.primary : colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: filterType === tab ? colors.accent : colors.textSecondary },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="bell-off" size={moderateScale(48)} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t.noNotifications}
            </Text>
          </View>
        ) : (
          filtered.map((item, idx) => {
            const iconConfig = getIcon(item.type);
            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(idx * 50).duration(350)}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: item.read ? colors.cardBorder : colors.secondary,
                    borderLeftWidth: item.read ? 1 : 4,
                  },
                  shadows.sm,
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg }]}>
                  <MaterialCommunityIcons name={iconConfig.name as any} size={moderateScale(22)} color={iconConfig.color} />
                </View>

                <View style={styles.contentCol}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.timeAgo, { color: colors.textMuted }]}>
                      {item.timestamp}
                    </Text>
                  </View>

                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
                    {item.message}
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
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
  markReadBtn: {
    padding: scale(4),
  },
  markReadText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  tabPill: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  scrollBody: {
    padding: scale(16),
    paddingBottom: verticalScale(40),
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(80),
  },
  emptyText: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(10),
  },
  notifCard: {
    flexDirection: 'row',
    padding: scale(14),
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: verticalScale(10),
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  contentCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(3),
  },
  notifTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    flex: 1,
    marginRight: scale(6),
  },
  timeAgo: {
    fontSize: moderateScale(10),
  },
  notifMessage: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  },
});

