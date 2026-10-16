import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { BudgetBar } from '@/components/BudgetBar';
import { BudgetRing } from '@/components/BudgetRing';
import { Button } from '@/components/Button';
import { ExpenseItem } from '@/components/ExpenseItem';
import { colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    selectBudgetAlert,
    selectBudgetSummary,
    selectBudgets,
    selectMonthTotals,
    selectRecent,
    selectSync,
} from '@/store/selectors';
import { loadTransactions } from '@/store/transactionsSlice';
import { loadBudgets } from '@/store/budgetsSlice';
import { refreshPending } from '@/store/syncSlice';
import { formatLKR } from '@/utils/currency';
import { dayLabel, greeting, timeLabel } from '@/utils/dates';

function SectionTitle({ title, onSeeAll }: Readonly<{ title: string; onSeeAll?: () => void }>) {
    return (
        <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
                {title}
            </Text>
            {onSeeAll ? (
                <Pressable onPress={onSeeAll} hitSlop={10} accessibilityRole="link">
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    const sync = useAppSelector(selectSync);
    const totals = useAppSelector(selectMonthTotals);
    const summary = useAppSelector(selectBudgetSummary);
    const budgets = useAppSelector(selectBudgets);
    const alert = useAppSelector(selectBudgetAlert);
    const recent = useAppSelector(selectRecent);

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([dispatch(loadTransactions()), dispatch(loadBudgets()), dispatch(refreshPending())]);
        setRefreshing(false);
    }, [dispatch]);

    const goBudgets = () => navigation.navigate('Budgets');
    const goActivity = () => navigation.navigate('Tabs', { screen: 'Transactions' });
    const goAdd = () => navigation.navigate('TransactionForm');


    return (
        <SafeAreaView style={styles.screen} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                <AppHeader
                    subTitle={greeting()}
                    title="Sameera"
                    syncState={sync.status}
                    pendingCount={sync.pendingCount}
                    unreadCount={0}
                    onBellPress={() => navigation.navigate('Notifications')}
                />
                {alert ? (
                    <Banner
                        tone={alert.ratio >= 1 ? 'danger' : 'warning'}
                        title={`${CATEGORY_LABELS[alert.category]} budget at ${Math.round(alert.ratio * 100)}%`}
                        message={
                            alert.ratio >= 1
                                ? `Over by ${formatLKR((alert.spentCents - alert.limitCents) / 100)} this month.`
                                : `${formatLKR((alert.limitCents - alert.spentCents) / 100)} left this month.`
                        }
                        actionLabel="View budgets"
                        onAction={goBudgets}
                    />
                ) : null}

                <View style={styles.card}>
                    {summary.count > 0 ? (
                        <BudgetRing spent={summary.spentCents / 100} limit={summary.limitCents / 100} size={132} stroke={12} />
                    ) : null}

                    <View style={styles.stats}>
                        <Text style={styles.statLabel}>Spent this month</Text>
                        <Text style={styles.statBig}>{formatLKR(totals.spentCents / 100)}</Text>

                        <Text style={[styles.statLabel, styles.gapTop]}>Received</Text>
                        <Text style={styles.statIn}>+ {formatLKR(totals.incomeCents / 100)}</Text>

                        {summary.count === 0 ? (
                            <View style={styles.gapTop}>
                                <Button title="Set a budget" variant="tonal" size="sm" icon="plus" onPress={goBudgets} />
                            </View>
                        ) : (
                            <Text style={[styles.statSmall, styles.gapTop]}>Budget: {formatLKR(summary.limitCents / 100)}</Text>
                        )}
                    </View>
                </View>

                <Button title="Add transaction" icon="plus" onPress={goAdd} />

                {budgets.length > 0 ? (
                    <>
                        <SectionTitle title="Budgets" onSeeAll={goBudgets} />
                        {budgets.slice(0, 3).map((b) => (
                            <BudgetBar
                                key={b.id}
                                label={CATEGORY_LABELS[b.category]}
                                cat={b.category}
                                spent={b.spentCents / 100}
                                limit={b.limitCents / 100}
                            />
                        ))}
                    </>
                ) : null}

                <SectionTitle title="Recent" onSeeAll={recent.length > 0 ? goActivity : undefined} />
                {recent.length === 0 ? (
                    <Text style={styles.empty}>Nothing yet. Add your first transaction above.</Text>
                ) : (
                    recent.map((t) => (
                        <ExpenseItem
                            key={t.id}
                            merchant={t.merchant}
                            meta={`${CATEGORY_LABELS[t.category]} · ${dayLabel(t.occurredAt)}, ${timeLabel(t.occurredAt)}`}
                            amount={t.amountCents / 100}
                            cat={t.category}
                            direction={t.direction}
                            tag={t.syncStatus === 'pending' ? 'pending' : undefined}
                            onPress={() => navigation.navigate('TransactionForm', { transactionId: t.id })}
                        />
                    ))
                )}

                <SectionTitle title="Developer" />
                <View style={styles.devRow}>
                    <Button title="Gallery" variant="outline" size="sm" onPress={() => navigation.navigate('Gallery')} />
                    <Button title="Bills" variant="outline" size="sm" onPress={() => navigation.navigate('Bills')} />
                </View>
            </ScrollView>
        </SafeAreaView>

    );
}


const styles = StyleSheet.create({
    stats: { flex: 1 },
    statLabel: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
    statBig: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] },
    statIn: { fontFamily: font.bold, fontSize: 16, color: colors.success, fontVariant: ['tabular-nums'] },
    statSmall: { fontFamily: font.semibold, fontSize: 12, color: colors.ink2 },
    gapTop: { marginTop: 10 },
    screen: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 },
    button: {
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
        padding: 16,
        borderRadius: 20,
        backgroundColor: colors.surface,
    },
    buttonText: { fontFamily: font.semibold, fontSize: 15, color: colors.primaryPressed },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    sectionTitle: { fontFamily: font.bold, fontSize: 17, color: colors.ink },
    seeAll: { fontFamily: font.semibold, fontSize: 13, color: colors.primary },
    content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
    empty: { fontFamily: font.medium, fontSize: 13, color: colors.caption },
    devRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});