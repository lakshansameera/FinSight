import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, type } from '@/constants/theme';

type Props = {
    title : string;
    note? : string;
}

export function PlaceHolderScreen({ title, note} : Props) {
    const navigation = useNavigation();

    return (
        <SafeAreaView style ={styles.screen}>
            <View style = {styles.header}>
                <Pressable 
                    onPress = {()=> navigation.goBack()}
                    accessibilityRole = "button"
                    accessibilityLabel = "Back"
                    style ={styles.back}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </Pressable>
                <Text style={type.headline}>{title}</Text>
            </View>
            {note ? <Text style={type.caption}>{note}</Text> : null}    
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, gap: 8 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 56 },
    back: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
    backIcon: { color: colors.ink, fontSize: 32, lineHeight: 36 },
});