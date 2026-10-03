import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icons';
import { SyncBadge, type SyncState } from './SyncBadge';
import { colors, font } from '@/constants/theme';

type Props = Readonly<{
    title: string;
    subTitle?: string;
    onBack?: () => void;
    syncState?: SyncState;
    pendingCount?: number;
    unreadCount?: number;
    onBellPress?: () => void;
}>

export function AppHeader({ title, subTitle, onBack, syncState, pendingCount = 0, unreadCount = 0, onBellPress }: Props) {
    const showBell = unreadCount !== undefined;
    const hasUnread = (unreadCount ?? 0) > 0;

    return (
        <View style={styles.bar}>
            {onBack ? (
                <Pressable
                    onPress={onBack}
                    accessibilityRole="button"
                    accessibilityLabel='Back'
                    hitSlop={8}
                    style={({ pressed }) => [styles.iconBtn, styles.bellBtn, pressed && styles.pressed]}
                >
                    <Icon name="back" size={24} color={colors.ink} />
                </Pressable>
            ) : null}

            <View style={styles.titles}>
                {subTitle ? <Text style={styles.subtitle}>{subTitle}</Text> : null}
                <Text style={subTitle ? styles.titleLarge : styles.title} numberOfLines={1} accessibilityRole="header">
                    {title}
                </Text>
            </View>

            {syncState ? <SyncBadge state={syncState} pendingCount={pendingCount} /> : null}

            {showBell ? (
                <Pressable
                    onPress={onBellPress}
                    accessibilityRole="button"
                    accessibilityLabel={hasUnread ? `Notifications, ${unreadCount} unreadCount` : `Notifications`}
                    hitSlop={8}
                    style={({ pressed }) => [styles.iconBtn, styles.bellBtn, pressed && styles.pressed]}
                >
                    <Icon name="bell" size={22} color={colors.ink} />
                    {hasUnread ? (
                        <View style={styles.dot}>
                            <Text style={styles.dotText}>{(unreadCount ?? 0) > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    ) : null}

                </Pressable>
            ) : null}

        </View>
    );
}

const styles = StyleSheet.create({
    bar: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 6 },
    iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    backBtn: { marginLeft: -10 },
    bellBtn: { backgroundColor: colors.surface },
    pressed: { opacity: 0.6 },
    subtitle: { fontFamily: font.medium, fontSize: 13, color: colors.caption },
    title: { fontFamily: font.bold, fontSize: 20, color: colors.ink },
    titles: { flex: 1 },
    titleLarge: { fontFamily: font.extrabold, fontSize: 24, color: colors.ink },
    dot: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        borderRadius: 9,
        backgroundColor: colors.danger,
        borderWidth: 2,
        borderColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotText: { fontFamily: font.bold, fontSize: 10, color: '#FFFFFF', lineHeight: 12 },

});