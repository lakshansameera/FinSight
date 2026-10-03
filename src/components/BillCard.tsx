import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { Button } from './Button';
import { Icon, type IconName } from './Icons';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { formatLKR } from '@/utils/currency';

export type BillStatus = 'upcoming' | 'dueSoon' | 'overdue' | 'paid';


const STATUS: Record<BillStatus, { bg: string; fg: string; icon: IconName }> = {
    upcoming: { bg: colors.bg, fg: colors.ink2, icon: 'clock' },
    dueSoon: { bg: colors.warningSoft, fg: colors.warningText, icon: 'clock' },
    overdue: { bg: colors.dangerSoft, fg: '#9A2F2B', icon: 'alert' },
    paid: { bg: colors.primarySoft, fg: colors.primaryPressed, icon: 'check' },
};

type Props = Readonly<{
  name: string; 
  cat?: CategoryKey; 
  amount: number;
  dueText: string; 
  status: BillStatus;
  onPress?: () => void; 
  onMarkPaid?: () => void;
}>;

export function BillCard({ name, cat = 'bills', amount, dueText, status, onPress, onMarkPaid }: Props) {
  const s = STATUS[status];
  const isPaid = status === 'paid';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${formatLKR(amount)}, ${dueText}`}
      style={({ pressed }) => [styles.card, status === 'overdue' && styles.overdue, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <CategoryIcon cat={cat} />
        <View style={styles.middle}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={[styles.chip, { backgroundColor: s.bg }]}>
            <Icon name={s.icon} size={12} color={s.fg} />
            <Text style={[styles.chipText, { color: s.fg }]}>{dueText}</Text>
          </View>
        </View>
        <Text style={[styles.amount, isPaid && styles.amountPaid]}>{formatLKR(amount)}</Text>
      </View>


      {!isPaid && onMarkPaid ? (
        <View style={styles.footer}>
          <Button title="Mark paid" variant="tonal" size="sm" icon="check" onPress={onMarkPaid} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  overdue: { borderColor: colors.danger },
  pressed: { backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  middle: { flex: 1, gap: 6, alignItems: 'flex-start' },
  name: { fontFamily: font.semibold, fontSize: 15, color: colors.ink },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontFamily: font.semibold, fontSize: 11 },
  amount: { fontFamily: font.bold, fontSize: 15, color: colors.ink, fontVariant: ['tabular-nums'] },
  amountPaid: { color: colors.caption, textDecorationLine: 'line-through' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});