import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { shadows } from '../../theme/shadows';
import { useStore } from '../../store/useStore';
import { ChatMessage } from '../../types';

interface ChatScreenProps {
  onBack: () => void;
  companyName?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  companyName = 'Super Star Group (SSG)',
}) => {
  const { user, colors, t } = useStore();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'comp_superstar',
      senderRole: 'COMPANY',
      receiverId: 'seller_bismillah',
      text: 'Assalamu Alaikum! Welcome to Super Star Group B2B wholesale desk. How can we assist your shop inventory today?',
      timestamp: '10:30 AM',
      read: true,
    },
    {
      id: 'm2',
      senderId: 'seller_bismillah',
      senderRole: 'SELLER',
      receiverId: 'comp_superstar',
      text: 'Wa Alaikum Assalam. What is your best wholesale rate for 50 boxes of Royal Gold 8-Gang Piano switches?',
      timestamp: '10:32 AM',
      read: true,
    },
    {
      id: 'm3',
      senderId: 'comp_superstar',
      senderRole: 'COMPANY',
      receiverId: 'seller_bismillah',
      text: 'For 50 boxes, we offer direct factory rate of ৳450/box (Regular wholesale ৳470) plus free transport to Nawabpur market!',
      timestamp: '10:35 AM',
      read: true,
    },
  ]);

  const quickChips = [
    'Can you dispatch by tomorrow?',
    'Need BSTI test certificate',
    '30-day credit term inquiry',
    'Request bulk invoice copy',
  ];

  const handleSend = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'seller_bismillah',
      senderRole: user?.role || 'SELLER',
      receiverId: 'comp_superstar',
      text: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulated automated response after 1.5 seconds
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg_rep_${Date.now()}`,
        senderId: 'comp_superstar',
        senderRole: 'COMPANY',
        receiverId: user?.id || 'seller_bismillah',
        text: 'Thank you for your message. Our wholesale key account manager has received your inquiry and will confirm order dispatch shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }, shadows.sm]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.companyInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
              {companyName}
            </Text>
            <MaterialCommunityIcons name="check-decagram" size={moderateScale(14)} color={colors.success} />
          </View>
          <Text style={[styles.onlineStatus, { color: colors.success }]}>Online • Manufacturer Verified</Text>
        </View>

        <TouchableOpacity style={styles.callBtn}>
          <Feather name="phone" size={moderateScale(18)} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Messages Feed */}
      <ScrollView
        contentContainerStyle={styles.messagesScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => {
          const isMe = msg.senderRole === user?.role;
          return (
            <Animated.View
              key={msg.id}
              entering={FadeInDown.duration(300)}
              style={[
                styles.messageRow,
                isMe ? styles.myMessageRow : styles.otherMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMe
                    ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: colors.card, borderBottomLeftRadius: 4, borderColor: colors.cardBorder, borderWidth: 1 },
                  shadows.sm,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isMe ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    { color: isMe ? '#94A3B8' : colors.textMuted },
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Quick Suggestion Chips */}
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {quickChips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSend(chip)}
              style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickChipText, { color: colors.textSecondary }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
        <TextInput
          style={[styles.inputField, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
          placeholder={t.typeMessage}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          style={[styles.sendBtn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Feather name="send" size={moderateScale(18)} color="#0B1B3A" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  backBtn: {
    padding: scale(6),
  },
  companyInfo: {
    flex: 1,
    marginLeft: scale(10),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginRight: scale(4),
  },
  onlineStatus: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginTop: verticalScale(1),
  },
  callBtn: {
    padding: scale(8),
  },
  messagesScroll: {
    padding: scale(16),
    paddingBottom: verticalScale(20),
  },
  messageRow: {
    marginBottom: verticalScale(12),
    flexDirection: 'row',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: scale(12),
    borderRadius: radius.xl,
  },
  messageText: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  timeText: {
    fontSize: moderateScale(9),
    alignSelf: 'flex-end',
    marginTop: verticalScale(4),
  },
  chipsBar: {
    paddingVertical: verticalScale(6),
  },
  chipsScroll: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  quickChip: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    borderRadius: radius.xl,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(13),
    maxHeight: verticalScale(80),
  },
  sendBtn: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
});

