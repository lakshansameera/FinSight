import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './Icons';
import { colors, font } from '@/constants/theme';


//icons and labels for the bottom tab bar
const TABS: Record<string, { label: string; icon: IconName }> = {
    Home: { label: 'Home', icon: 'home' },
    Transactions: { label: 'Activity', icon: 'list' },
    Scan: { label: 'Scan', icon: 'scan' },
    Insights: { label: 'Insights', icon: 'insights' },
    Offers: { label: 'Offers', icon: 'bank' },
};

export function NavBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const tab = TABS[route.name];

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                if (route.name === 'Scan') {
                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            style={styles.item}
                            accessibilityRole="button"
                            accessibilityLabel="Scan receipt"
                        >
                            <View style={styles.scanButton}>
                                <Icon name="scan" size={26} color="#FFFFFF" />
                            </View>
                            <Text style={[styles.label, isFocused && styles.labelActive]}>Scan</Text>

                        </Pressable>
                    );
                }

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        style={styles.item}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isFocused }}
                        accessibilityLabel={tab.label}
                    >
                        <View style={[styles.pill, isFocused && styles.pillActive]}>
                            <Icon name={tab.icon} color={isFocused ? colors.primaryPressed : colors.caption} />
                        </View>
                        <Text style={[styles.label, isFocused && styles.labelActive]}>{tab.label}</Text>
                    </Pressable>
                );
            })}

        </View>
    );
}


const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row', justifyContent: 'space-around',
        backgroundColor: colors.surface, borderTopWidth: 1,
        borderTopColor: colors.line, padding: 8,
    },
    item: { width: 68, alignItems: 'center', gap: 4 },
    scanButton: {
        width: 60, height: 60, marginTop: -28, borderRadius: 20, backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.surface,
        elevation: 6,
    },
    pill: {
        width: 56,
        height: 32,
        borderRadius: 999, // fully rounded ends
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillActive: {
        backgroundColor: colors.primarySoft,
    },
    label: {
        fontFamily: font.medium,
        fontSize: 12,
        color: colors.caption,
    },
    labelActive: {
        fontFamily: font.bold,
        color: colors.primaryPressed,
    },
});