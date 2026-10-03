import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { SyncBadge } from '@/components/SyncBadge';
import { colors, font, type } from '@/constants/theme';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ExpenseItem } from '@/components/ExpenseItem';
import { BudgetBar } from '@/components/BudgetBar';
import { BudgetRing } from '@/components/BudgetRing';
import { AppHeader } from '@/components/AppHeader';
import { BillCard } from '@/components/BillCard';
import { OfferCard } from '@/components/OfferCard';
import { Banner } from '@/components/Banner';

export default function GalleryScreen() {
    const navigation = useNavigation();
    const noop = () => { };

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={type.headline}>Component gallery</Text>

                <Text style={styles.section}>BUTTON · VARIANTS</Text>
                <Button title="Save transaction" onPress={noop} />
                <Button title="Create an account" variant="tonal" onPress={noop} />
                <Button title="Use password instead" variant="outline" onPress={noop} />
                <Button title="Discard draft" variant="danger" onPress={noop} />

                <Text style={styles.section}>BUTTON · STATES AND SIZES</Text>
                <Button title="Saving" loading onPress={noop} />
                <Button title="Save transaction" disabled onPress={noop} />
                <View style={styles.row}>
                    <Button title="Add budget" icon="plus" size="md" onPress={noop} />
                    <Button title="Mark paid" variant="tonal" size="sm" onPress={noop} />
                </View>

                <Text style={styles.section}>SYNC BADGE</Text>
                <View style={styles.row}>
                    <SyncBadge state="synced" />
                    <SyncBadge state="pending" pendingCount={3} />
                </View>
                <View style={styles.row}>
                    <SyncBadge state="syncing" />
                    <SyncBadge state="offline" />
                </View>

                <Text style={styles.section}>CATEGORY ICON</Text>
                <View style={styles.row}>
                    <CategoryIcon cat="food" />
                    <CategoryIcon cat="transport" />
                    <CategoryIcon cat="bills" />
                    <CategoryIcon cat="shopping" />
                    <CategoryIcon cat="health" />
                    <CategoryIcon cat="other" />
                    <CategoryIcon cat="income" />
                    <CategoryIcon cat="loans" />
                    <CategoryIcon cat="family" />
                </View>

                <Text style={styles.section}>EXPENSE ITEM</Text>
                <ExpenseItem merchant="Keells Super" meta="Food & dining · Today, 18:42" amount={4280} cat="food" direction="out" />
                <ExpenseItem merchant="Salary · ABC Pvt Ltd" meta="Income · 25 Sep" amount={185000} cat="income" direction="in" />
                <ExpenseItem merchant="Dialog Axiata" meta="Bills · Today, 09:10" amount={2990} cat="bills" direction="out" tag="recurring" />
                <ExpenseItem merchant="PickMe" meta="Transport · Today, 08:05" amount={640} cat="transport" direction="out" tag="pending" />
                <ExpenseItem merchant="Osu Sala" meta="From receipt · confirm category" amount={1850} cat="health" direction="out" tag="draft" />

                <Text style={styles.section}>BUDGET BAR · OK / WARNING / OVER</Text>
                <BudgetBar label="Food & dining" cat="food" spent={12400} limit={25000} />
                <BudgetBar label="Transport" cat="transport" spent={8600} limit={10000} />
                <BudgetBar label="Shopping" cat="shopping" spent={16300} limit={15000} />

                <Text style={styles.section}>BUDGET RING</Text>
                <View style={styles.row}>
                    <BudgetRing spent={68200} limit={100000} size={150} />
                    <BudgetRing spent={91000} limit={100000} size={150} />
                </View>
                <BudgetRing spent={104500} limit={100000} size={150} />


                <Text style={styles.section}>APP HEADER · HOME / SCREEN</Text>
                <AppHeader subTitle="Good evening" title="Sameera" syncState="pending" pendingCount={14} unreadCount={17} onBellPress={noop} />
                <AppHeader title="Budgets" onBack={noop} syncState="synced" />
                <AppHeader title="Bill details" onBack={noop} unreadCount={0} onBellPress={noop} />

                <Text style={styles.section}>BILL CARD · 4 STATES</Text>
                <BillCard name="Dialog Fibre" amount={4990} dueText="Due 12 Oct" status="upcoming" onPress={noop} onMarkPaid={noop} />
                <BillCard name="CEB electricity" amount={6240} dueText="Due in 2 days" status="dueSoon" onPress={noop} onMarkPaid={noop} />
                <BillCard name="Water board" amount={1820} dueText="3 days overdue" status="overdue" onPress={noop} onMarkPaid={noop} />
                <BillCard name="House rent" cat="family" amount={45000} dueText="Paid 1 Oct" status="paid" onPress={noop} />

                <Text style={styles.section}>OFFER CARD</Text>
                <OfferCard bank="Commercial Bank" bankColor="#1F4F8A" title="15% off at Keells Super" detail="Credit cards · until 31 Oct" matched matchText="You spent LKR 18,400 on groceries this month" onPress={noop} />
                <OfferCard bank="Sampath Bank" bankColor="#C26A3A" title="0% instalments on electronics" detail="Up to 24 months · until 15 Nov" onPress={noop} />

                <Text style={styles.section}>BANNER · 4 TONES</Text>
                <Banner tone="info" title="You're offline" message="Changes are saved on this phone and will sync later." />
                <Banner tone="success" title="All caught up" message="12 transactions synced to the cloud." onDismiss={noop} />
                <Banner tone="warning" title="Transport budget at 86%" message="LKR 1,400 left for the next 9 days." actionLabel="View budget" onAction={noop} />
                <Banner tone="danger" title="Sync failed" message="We'll retry automatically." actionLabel="Retry now" onAction={noop} onDismiss={noop} />

                <Text style={styles.section}>NAVIGATION</Text>
                <Button title="Back" variant="outline" icon="back" onPress={() => navigation.goBack()} />


            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, gap: 12, paddingBottom: 40 },
    section: { ...type.caption, fontFamily: font.bold, letterSpacing: 0.6, marginTop: 12 },
    row: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});