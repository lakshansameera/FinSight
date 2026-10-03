import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { ExpenseItem } from '@/components/ExpenseItem';
import { Icon } from '@/components/Icons';
import { colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import type { Transaction } from '@/db/transactionsRepo';
import { useAppSelector } from '@/store/hooks';
import { selectSync, selectTransactions } from '@/store/selectors';
import { formatLKR } from '@/utils/currency';
import { dayKey, dayLabel, timeLabel } from '@/utils/dates';

type Filter = 'all' | 'out' | 'in';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'out', label: 'Spent' },
  { key: 'in', label: 'Received' },
];

type Section = { title: string; key: string; netCents: number; data: Transaction[] };


function groupByDay(items: Transaction[]): Section[] {
  const sections: Section[] = [];
  for (const t of items) {
    const key = dayKey(t.occurredAt);
    let last = sections[sections.length - 1];
    if (!last || last.key !== key) {
      last = { title: dayLabel(t.occurredAt), key, netCents: 0, data: [] };
      sections.push(last);
    }
    last.data.push(t);
    last.netCents += t.direction === 'in' ? t.amountCents : -t.amountCents;
  }
  return sections;
}

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const all = useAppSelector(selectTransactions);
  const sync = useAppSelector(selectSync);
  const status = useAppSelector((s) => s.transactions.status);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');


  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter((t) => {
      if (filter !== 'all' && t.direction !== filter) return false;
      if (!q) return true;
      return (
        t.merchant.toLowerCase().includes(q) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q)
      );
    });
    return groupByDay(filtered);
  }, [all, query, filter]);

  const openForm = (id?: string) => navigation.navigate('TransactionForm', id ? { transactionId: id } : undefined);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.top}>
        <AppHeader title="Activity" syncState={sync.status} pendingCount={sync.pendingCount} />

        {/* Search box */}
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.caption} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search merchant, category or note"
            placeholderTextColor={colors.caption}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search transactions"
          />
        </View>

        {/* Filter chips */}
        <View style={styles.chips} accessibilityRole="radiogroup">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={[styles.sectionNet, section.netCents > 0 && styles.net_in]}>
              {section.netCents > 0 ? '+ ' : section.netCents < 0 ? '− ' : ''}
              {formatLKR(section.netCents / 100)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <ExpenseItem
              merchant={item.merchant}
              meta={`${CATEGORY_LABELS[item.category]} · ${timeLabel(item.occurredAt)}`}
              amount={item.amountCents / 100}
              cat={item.category}
              direction={item.direction}
              tag={item.syncStatus === 'pending' ? 'pending' : undefined}
              onPress={() => openForm(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {status === 'loading' ? 'Loading…' : query || filter !== 'all' ? 'No matches' : 'No transactions yet'}
            </Text>
            <Text style={styles.emptyText}>
              {query || filter !== 'all' ? 'Try another search or filter.' : 'Tap + to add your first one.'}
            </Text>
          </View>
        }
      />

      {/* Floating add button */}
      <Pressable
        onPress={() => openForm()}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Icon name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, fontFamily: font.medium, fontSize: 15, color: colors.ink },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontFamily: font.semibold, fontSize: 13, color: colors.ink2 },
  chipTextActive: { color: colors.primaryPressed },
  list: { paddingBottom: 120 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: colors.bg, 
  },
  sectionTitle: { fontFamily: font.bold, fontSize: 13, color: colors.ink2 },
  sectionNet: { fontFamily: font.semibold, fontSize: 13, color: colors.caption, fontVariant: ['tabular-nums'] },
  net_in: { color: colors.success },
  rowWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 6 },
  emptyTitle: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  emptyText: { fontFamily: font.medium, fontSize: 13, color: colors.caption },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPressed: { backgroundColor: colors.primaryPressed },
});