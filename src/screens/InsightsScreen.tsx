import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DonutChart } from '@/components/DonutChart';
import { category as categoryColors, colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useAppSelector } from '@/store/hooks';
import { selectBudgets, selectMonthTotals, selectSync, selectTransactions } from '@/store/selectors';
import { buildInsights, categoryBreakdown, forecastMonthEnd, monthlyTotals, topMerchants } from '@/utils/insights';
import { formatLKR } from '@/utils/currency';

export default function InsightsScreen() {
  const navigation = useNavigation();
  const items = useAppSelector(selectTransactions);
  const budgets = useAppSelector(selectBudgets);
  const totals = useAppSelector(selectMonthTotals);
  const sync = useAppSelector(selectSync);

  const slices = useMemo(() => categoryBreakdown(items), [items]);
  const months = useMemo(() => monthlyTotals(items, 6), [items]);
  const merchants = useMemo(() => topMerchants(items), [items]);
  const insights = useMemo(() => buildInsights(items, budgets), [items, budgets]);
  const forecast = forecastMonthEnd(totals.spentCents);
  const maxMonth = Math.max(...months.map((m) => m.spentCents), 1);

  if (slices.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.pad}>
          <AppHeader title="Insights" syncState={sync.status} pendingCount={sync.pendingCount} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Not enough data yet</Text>
          <Text style={styles.emptyText}>Add a few expenses this month and your spending breakdown, trend and forecast will appear here.</Text>
          <Button title="Add transaction" icon="plus" onPress={() => navigation.navigate('TransactionForm')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Insights" subTitle="This month" syncState={sync.status} pendingCount={sync.pendingCount} />

        <View style={styles.card}>
          <DonutChart slices={slices} centerTop={formatLKR(totals.spentCents / 100)} centerBottom="spent" />
          <View style={styles.legend}>
            {slices.slice(0, 5).map((s) => (
              <View key={s.category} style={styles.legendRow}>
                <View style={[styles.swatch, { backgroundColor: categoryColors[s.category].solid }]} />
                <Text style={styles.legendName} numberOfLines={1}>{CATEGORY_LABELS[s.category]}</Text>
                <Text style={styles.legendPct}>{Math.round(s.share * 100)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {forecast ? (
          <View style={styles.forecast}>
            <Text style={styles.sectionLabel}>Forecast for month end</Text>
            <Text style={styles.forecastBig}>{formatLKR(forecast / 100)}</Text>
            <Text style={styles.caption}>Based on your pace so far this month. A straight-line estimate, not a promise.</Text>
          </View>
        ) : null}

        {insights.length > 0 ? (
          <>
            <Text style={styles.section}>What we noticed</Text>
            {insights.map((i) => (
              <Banner key={i.title} tone={i.tone} title={i.title} message={i.message} />
            ))}
          </>
        ) : null}

        <Text style={styles.section}>Last 6 months</Text>
        <View style={styles.card2}>
          <View style={styles.columns}>
            {months.map((m, idx) => (
              <View key={m.key} style={styles.col} accessible accessibilityLabel={`${m.label}: ${formatLKR(m.spentCents / 100)}`}>
                <View style={styles.colTrack}>
                  <View
                    style={[
                      styles.colFill,
                      { height: `${Math.max((m.spentCents / maxMonth) * 100, m.spentCents > 0 ? 4 : 0)}%` },
                      idx === months.length - 1 && styles.colNow,
                    ]}
                  />
                </View>
                <Text style={styles.colLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.caption}>Based on your last {items.length} saved transactions.</Text>
        </View>

        {merchants.length > 0 ? (
          <>
            <Text style={styles.section}>Top merchants</Text>
            <View style={styles.card2}>
              {merchants.map((m) => {
                const cat = items.find((t) => t.merchant.trim() === m.merchant)?.category ?? 'other';
                return (
                  <View key={m.merchant} style={styles.merchantRow}>
                    <CategoryIcon cat={cat} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.merchant} numberOfLines={1}>{m.merchant}</Text>
                      <Text style={styles.caption}>{m.count} purchase{m.count === 1 ? '' : 's'}</Text>
                    </View>
                    <Text style={styles.merchantAmt}>{formatLKR(m.cents / 100)}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16 },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20, backgroundColor: colors.surface },
  card2: { padding: 16, borderRadius: 20, backgroundColor: colors.surface, gap: 12 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontFamily: font.medium, fontSize: 13, color: colors.ink2 },
  legendPct: { fontFamily: font.bold, fontSize: 13, color: colors.ink },
  forecast: { padding: 16, borderRadius: 20, backgroundColor: colors.primarySoft, gap: 2 },
  sectionLabel: { fontFamily: font.semibold, fontSize: 12, color: colors.primaryPressed },
  forecastBig: { fontFamily: font.extrabold, fontSize: 24, color: colors.ink, fontVariant: ['tabular-nums'] },
  section: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginTop: 8 },
  caption: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
  columns: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, gap: 8 },
  col: { flex: 1, height: '100%', alignItems: 'center', gap: 6 },
  colTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: colors.bg, borderRadius: 8, overflow: 'hidden' },
  colFill: { width: '100%', backgroundColor: '#9CCBB6', borderRadius: 8 },
  colNow: { backgroundColor: colors.primary },
  colLabel: { fontFamily: font.medium, fontSize: 11, color: colors.caption },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  merchant: { fontFamily: font.semibold, fontSize: 14, color: colors.ink },
  merchantAmt: { fontFamily: font.bold, fontSize: 14, color: colors.ink, fontVariant: ['tabular-nums'] },
  empty: { flex: 1, paddingHorizontal: 24, gap: 12, justifyContent: 'center' },
  emptyTitle: { fontFamily: font.bold, fontSize: 18, color: colors.ink, textAlign: 'center' },
  emptyText: { fontFamily: font.medium, fontSize: 13, color: colors.caption, textAlign: 'center' },
});