import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, font } from '@/constants/theme';
import { Icon, type IconName } from './Icons';

const VARIANTS = {
    primary : { bg: colors.primary, pressed : colors.primaryPressed, fg: '#FFFFFF', border: undefined },
    tonal   : { bg: colors.primarySoft, pressed : '#C6E8D8', fg: colors.primaryPressed, border: undefined },
    outline: { bg: colors.surface, pressed: colors.bg, fg: colors.ink, border: '#C9D2CE' },
    danger: { bg: colors.dangerSoft, pressed: '#F4CFCB', fg: '#9A2F2B', border: undefined },
}

const HEIGHTS = { lg: 52, md: 44, sm: 36 } as const;

type Props = {
  title: string;
  onPress: () => void;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof HEIGHTS;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ 
    title, 
    onPress, 
    variant = 'primary', 
    size = 'lg', 
    icon, 
    loading = false,
    disabled = false
 }: Props) {
    const v = VARIANTS[variant];
    const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}

      style={({ pressed }) => [
        styles.base,
        { height: HEIGHTS[size] },
        { backgroundColor: disabled ? '#DDE3E0' : pressed ? v.pressed : v.bg },
        v.border ? { borderWidth: 1.5, borderColor: v.border } : null,
      ]}
    >

      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : icon ? (
        <Icon name={icon} size={18} color={disabled ? '#7D8883' : v.fg} />
      ) : null}

      <Text style={[styles.text, { color: disabled ? '#7D8883' : v.fg, fontSize: size === 'sm' ? 13 : 15 }]}>
        {title}
      </Text>
    </Pressable>
  );
 }



const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  text: { fontFamily: font.semibold },
});
