import { Text } from 'react-native';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { colors, type } from '@/constants/theme';

export default function HomeScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 16}}>
            <Text style={type.headline}>Home</Text>
        </SafeAreaView> 
    );
}