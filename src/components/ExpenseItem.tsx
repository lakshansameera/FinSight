import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { Icon, type IconName } from './Icons';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { formatLKR } from '@/utils/currency';


export type ExpenseTag = 'recurring' | 'pending' | 'draft';

const TAGS: Record<ExpenseTag, { bg: string; fg: string; label: string; icon: IconName }> = {
  recurring: { bg: '#E4EDFA', fg: '#1F4F8A', label: 'Monthly', icon: 'repeat' },
  pending: { bg: '#FFF1D6', fg: '#8A5200', label: 'Not synced', icon: 'clock' },
  draft: { bg: '#FFF1D6', fg: '#8A5200', label: 'Check', icon: 'pencil' },
};

type Props = {
  merchant: string; // "Keells Super"
  meta: string; // "Food & dining · Today, 18:42"
  amount: number; // 4280 (always positive)
  cat: CategoryKey;
  direction: 'in' | 'out'; // money in (income) or out (spending)
  tag?: ExpenseTag;
  onPress?: () => void;
};

function ExpenseItemBase({ merchant, meta, amount, cat, direction, tag, onPress }: Props) {
  const t = tag ? TAGS[tag] : null;
  const isIncome = direction === 'in';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${merchant}, ${isIncome ? 'received' : 'spent'} ${formatLKR(amount)}, ${meta}`}
      style={({ pressed }) => [styles.row, tag === 'draft' && styles.draft, pressed && styles.pressed]}
    >
     
      <CategoryIcon cat={cat} />

            <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={styles.merchant} numberOfLines={1}>
            {merchant}
          </Text>
          {t && (
            <View style={[styles.tag, { backgroundColor: t.bg }]}>
              <Icon name={t.icon} size={11} color={t.fg} />
              <Text style={[styles.tagText, { color: t.fg }]}>{t.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {/* 4. Right: amount. Green with + for income, − for spending */}
      <Text style={[styles.amount, isIncome && styles.amountIn]}>
        {isIncome ? '+ ' : '− '}
        {formatLKR(amount)}
      </Text>
    </Pressable>
  );
}

// 5. memo: skip redrawing a row whose props didn't change (matters in long lists)
export const ExpenseItem = memo(ExpenseItemBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  draft: { borderStyle: 'dashed', borderColor: colors.warning },
  pressed: { backgroundColor: colors.bg },
  middle: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  merchant: { flexShrink: 1, fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  meta: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: { fontFamily: font.semibold, fontSize: 11 },
  amount: { fontFamily: font.bold, fontSize: 15, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountIn: { color: colors.success },
});