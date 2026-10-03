import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icons';
import { colors, font } from '@/constants/theme';

type Props = Readonly<{
  bank: string; 
  bankColor?: string; 
  title: string; 
  detail: string; 
  matched?: boolean; 
  matchText?: string; 
  onPress?: () => void;
}>;


function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function OfferCard({ bank, bankColor = colors.info, title, detail, matched, matchText, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${bank}. ${detail}.${matched ? ' Matches your spending.' : ''}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <View style={[styles.logo, { backgroundColor: bankColor }]}>
          <Text style={styles.logoText}>{initials(bank)}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={styles.bank}>{bank}</Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
        <Icon name="chevron" size={18} color={colors.caption} />
      </View>

      {matched ? (
        <View style={styles.match}>
          <Icon name="sparkle" size={14} color={colors.primaryPressed} />
          <Text style={styles.matchText}>{matchText ?? 'Matches your spending'}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 12 },
  pressed: { backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: font.extrabold, fontSize: 15, color: '#FFFFFF' },
  middle: { flex: 1, gap: 2 },
  bank: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  title: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  detail: { fontFamily: font.medium, fontSize: 12, color: colors.ink2 },
  match: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  matchText: { flex: 1, fontFamily: font.semibold, fontSize: 12, color: colors.primaryPressed },
});