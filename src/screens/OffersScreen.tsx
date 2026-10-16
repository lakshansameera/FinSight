import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { OfferCard } from '@/components/OfferCard';
import { colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { OFFERS } from '@/constants/offers';
import { useAppSelector } from '@/store/hooks';
import { selectSync, selectTransactions } from '@/store/selectors';
import { categoryBreakdown } from '@/utils/insights';

export default function OffersScreen() {
  const navigation = useNavigation();
  const sync = useAppSelector(selectSync);
  const items = useAppSelector(selectTransactions);

  // Rank offers by how much you spent in their category this month; matching ones go first
  const ranked = useMemo(() => {
    const spend = new Map(categoryBreakdown(items).map((s) => [s.category, s.cents]));
    return OFFERS.map((o) => ({ offer: o, spentCents: spend.get(o.category) ?? 0 })).sort(
      (a, b) => b.spentCents - a.spentCents,
    );
  }, [items]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.pad}>
        <AppHeader title="Offers" subTitle="Picked for your spending" syncState={sync.status} pendingCount={sync.pendingCount} />
      </View>
      <FlatList
        data={ranked}
        keyExtractor={(r) => r.offer.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Banner tone="info" title="Sample offers" message="These are demo offers to show how matching works. A live version would load them from partner banks." />}
        renderItem={({ item }) => (
          <OfferCard
            bank={item.offer.bank}
            bankColor={item.offer.bankColor}
            title={item.offer.title}
            detail={item.offer.detail}
            matched={item.spentCents > 0}
            matchText={`You spent on ${CATEGORY_LABELS[item.offer.category].toLowerCase()} this month`}
            onPress={() => navigation.navigate('OfferDetail', { offerId: item.offer.id })}
          />
        )}
        ListFooterComponent={<Text style={styles.foot}>Matches use only the transactions stored on this phone.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: 16 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  foot: { fontFamily: font.medium, fontSize: 12, color: colors.caption, textAlign: 'center', marginTop: 6 },
});