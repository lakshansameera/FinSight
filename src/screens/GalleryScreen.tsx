import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { SyncBadge } from '@/components/SyncBadge';
import { colors, font, type } from '@/constants/theme';
import { CategoryIcon } from '@/components/CategoryIcon';
import { ExpenseItem } from '@/components/ExpenseItem';

// A developer-only screen that shows every component in every state.
// Compare it with the boards on the design canvas.
export default function GalleryScreen() {
    const navigation = useNavigation();
    const noop = () => { }; // a function that does nothing, for demo buttons

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