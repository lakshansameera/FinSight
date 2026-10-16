import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { colors, font } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { getOffer } from '@/constants/offers';
import type { RootStackParamList } from '@/navigation/types';
import { useAppSelector } from '@/store/hooks';
import { selectTransactions } from '@/store/selectors';
import { categoryBreakdown } from '@/utils/insights';
import { formatLKR } from '@/utils/currency';

export default function OfferDetailScreen() {
  const navigation = useNavigation();
  const { offerId } = useRoute<RouteProp<RootStackParamList, 'OfferDetail'>>().params;
  const items = useAppSelector(selectTransactions);
  const offer = getOffer(offerId);

  if (!offer) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <AppHeader title="Offer" onBack={() => navigation.goBack()} />
          <Banner tone="warning" title="This offer is no longer available" />
        </View>
      </SafeAreaView>
    );
  }

  const spentCents = categoryBreakdown(items).find((s) => s.category === offer.category)?.cents ?? 0;
  const until = new Date(offer.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title={offer.bank} onBack={() => navigation.goBack()} />

        <View style={styles.hero}>
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.detail}>{offer.detail}</Text>
          <Text style={styles.until}>Valid until {until}</Text>
        </View>

        {spentCents > 0 ? (
          <Banner
            tone="success"
            title="Matches your spending"
            message={`You spent ${formatLKR(spentCents / 100)} on ${CATEGORY_LABELS[offer.category].toLowerCase()} this month.`}
          />
        ) : null}

        <Text style={styles.section}>About this offer</Text>
        <Text style={styles.body}>{offer.description}</Text>

        <Text style={styles.section}>Terms</Text>
        {offer.terms.map((t) => (
          <View key={t} style={styles.termRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.term}>{t}</Text>
          </View>
        ))}

        <Banner tone="info" title="Sample offer" message="Demo data for the module. Check the bank's own channels for real promotions." />
        <Button title="Back to offers" variant="outline" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 14, paddingBottom: 48 },
  hero: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 6 },
  title: { fontFamily: font.extrabold, fontSize: 22, color: colors.ink },
  detail: { fontFamily: font.medium, fontSize: 14, color: colors.ink2 },
  until: { fontFamily: font.semibold, fontSize: 12, color: colors.caption, marginTop: 4 },
  section: { fontFamily: font.bold, fontSize: 17, color: colors.ink, marginTop: 4 },
  body: { fontFamily: font.regular, fontSize: 14, color: colors.ink2, lineHeight: 21 },
  termRow: { flexDirection: 'row', gap: 8 },
  bullet: { fontFamily: font.bold, fontSize: 14, color: colors.primary },
  term: { flex: 1, fontFamily: font.regular, fontSize: 14, color: colors.ink2, lineHeight: 20 },
});