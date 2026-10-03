import { useNavigation } from '@react-navigation/native';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { colors, type , font } from '@/constants/theme';


export default function HomeScreen() {
    const navigation = useNavigation(); 

    return (

        <SafeAreaView style={styles.screen}>
            <Text style={type.headline}>Home</Text>
            <Text style={type.caption}>This is the home screen of the app. You can navigate to different screens using the buttons below.</Text>

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