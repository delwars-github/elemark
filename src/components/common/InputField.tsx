import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale, radius, spacing } from '../../theme/responsive';
import { useStore } from '../../store/useStore';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const { colors } = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: isFocused ? colors.secondary : colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.secondary
              : colors.cardBorder,
          },
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: moderateScale(15),
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(14),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: verticalScale(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: scale(14),
    minHeight: verticalScale(46),
  },
  leftIconContainer: {
    marginRight: scale(10),
  },
  input: {
    flex: 1,
    paddingVertical: verticalScale(8),
  },
  eyeIcon: {
    padding: scale(6),
  },
  errorText: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    fontWeight: '500',
  },
});

