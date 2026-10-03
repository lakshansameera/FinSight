import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, font } from '@/constants/theme';


type Props = Readonly<
  TextInputProps & {
    label: string;
    error?: string | null; 
    prefix?: string; 
  }
>;

export function TextField({ label, error, prefix, style, onFocus, onBlur, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.line;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, { borderColor }]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          placeholderTextColor={colors.caption}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    gap: 8,
  },
  prefix: { fontFamily: font.semibold, fontSize: 15, color: colors.caption },
  input: { flex: 1, fontFamily: font.medium, fontSize: 16, color: colors.ink, paddingVertical: 12 },
  error: { fontFamily: font.medium, fontSize: 12, color: colors.danger },
});