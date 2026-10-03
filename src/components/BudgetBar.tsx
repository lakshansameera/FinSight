import { StyleSheet, View, Text } from 'react-native';
import { colors, font, type CategoryKey } from '@/constants/theme';
import { CategoryIcon } from './CategoryIcon';
import { formatLKR } from '@/utils/currency';
import { budgetStatus, STATUS_COLORS } from '@/utils/budget';

type props = Readonly<{
    label: string;
    cat: CategoryKey;
    spent: number;
    limit: number;
}>;

export function BudgetBar({ label, cat, spent, limit }: props) {
    const status = budgetStatus(spent, limit);
    const c = STATUS_COLORS[status];

    const pct = limit > 0 ? Math.min(spent / limit, 1) : 0;
    const fillWidth = Math.min(Math.max(pct, 0), 100);

    const note =
        status === 'over' ?
            `Over budget by ${formatLKR(spent - limit)}`
            : `${formatLKR(spent)} of ${formatLKR(limit)} spent`;

    return (
        <View
            style={styles.card}
            accessible
            accessibilityLabel={`${label} budget. ${formatLKR(spent)} of ${formatLKR(limit)} spent, ${pct} percent. ${note}.`}
        >
            <View style={styles.top}>
                <CategoryIcon cat={cat} size={36} />
                <View style={styles.titles}>
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                    <Text style={styles.amounts}>
                        {formatLKR(spent)} <Text style={styles.of}>of {formatLKR(limit)}</Text>
                    </Text>
                </View>
                <Text style={[styles.pct, { color: c.text }]}>{pct}%</Text>
            </View>

            <View style={styles.track}>
                <View style={[styles.fill, { width: `${fillWidth}%`, backgroundColor: c.fill }]} />
            </View>

            <Text style={[styles.note, { color: c.text }]}>{note}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10 },
    top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    titles: { flex: 1, gap: 2 },
    label: { fontFamily: font.semibold, fontSize: 15, color: colors.ink },
    amounts: { fontFamily: font.bold, fontSize: 13, color: colors.ink, fontVariant: ['tabular-nums'] },
    of: { fontFamily: font.medium, color: colors.caption },
    pct: { fontFamily: font.bold, fontSize: 15, fontVariant: ['tabular-nums'] },
    track: { height: 8, borderRadius: 999, backgroundColor: colors.line, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 999 },
    note: { fontFamily: font.medium, fontSize: 12 },
});