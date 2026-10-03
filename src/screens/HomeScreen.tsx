import { useNavigation } from '@react-navigation/native';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, type, font } from '@/constants/theme';
import { AppHeader } from '@/components/AppHeader';
import { useAppSelector } from '@/store/hooks';
import { selectMonthTotals, selectSync } from '@/store/selectors';
import { formatLKR } from '@/utils/currency';


export default function HomeScreen() {
    const navigation = useNavigation();
    const sync = useAppSelector(selectSync);
    const totals = useAppSelector(selectMonthTotals);

    return (

        <SafeAreaView style={styles.screen}>
            <AppHeader
                subTitle="Good evening"
                title="Sameera"
                syncState={sync.status}
                pendingCount={sync.pendingCount}
                unreadCount={0}
                onBellPress={() => navigation.navigate('Notifications')}
            />
            <Text style={type.title}>Spent this month: {formatLKR(totals.spentCents / 100)}</Text>
            <Text style={type.caption}>Temporary buttons to test the stack</Text>

                  <Pressable style={styles.button} onPress={() => navigation.navigate('TransactionForm')}>
        <Text style={styles.buttonText}>+ Add transaction</Text>
      </Pressable>
      
            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('Budgets')}
            >
                <Text style={styles.buttonText}>Go to Budgets</Text>
            </Pressable>

            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('Bills')}
            >
                <Text style={styles.buttonText}>Go to Bills</Text>
            </Pressable>

            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('BillDetail', { billId: 'ceb-sep' })}
            >
                <Text style={styles.buttonText}>Go to Bill Details</Text>
            </Pressable>

            <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('Settings')}
            >
                <Text style={styles.buttonText}>Go to Settings</Text>
            </Pressable>

            <Pressable style={styles.button}
                onPress={() => navigation.navigate('Gallery')}
            >
                <Text style={styles.buttonText}>Open component gallery</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => navigation.navigate('DbTest')}>
                <Text style={styles.buttonText}>Open database test</Text>
            </Pressable>

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 },
    button: {
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: { fontFamily: font.semibold, fontSize: 15, color: colors.primaryPressed },
});