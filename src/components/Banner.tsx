import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from './Icons';
import { colors, font } from '@/constants/theme';


export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<BannerTone, { bg: string; fg: string; icon: IconName }> = {
    info: { bg: colors.infoSoft, fg: '#1F4F8A', icon: 'info' },
    success: { bg: colors.primarySoft, fg: colors.primaryPressed, icon: 'check' },
    warning: { bg: colors.warningSoft, fg: colors.warningText, icon: 'alert' },
    danger: { bg: colors.dangerSoft, fg: '#9A2F2B', icon: 'alert' },
};

type Props = Readonly<{
    tone?: BannerTone;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    onDismiss?: () => void;
}>;

export function Banner({ tone = 'info', title, message, actionLabel, onAction, onDismiss }: Props) {
    const t = TONES[tone];

    return (
        <View
            style={[styles.box, { backgroundColor: t.bg }]}
            accessibilityRole={tone === 'danger' || tone === 'warning' ? 'alert' : 'summary'}
        >
            <Icon name={t.icon} size={20} color={t.fg} />

            <View style={styles.body}>
                <Text style={[styles.title, { color: t.fg }]}>{title}</Text>
                {message ? <Text style={styles.message}>{message}</Text> : null}
                {actionLabel && onAction ? (
                    <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8} style={styles.action}>
                        <Text style={[styles.actionText, { color: t.fg }]}>{actionLabel}</Text>
                    </Pressable>
                ) : null}
            </View>

            {onDismiss ? (
                <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={10}>
                    <Icon name="close" size={18} color={t.fg} />
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    box: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14 },
    body: { flex: 1, gap: 2 },
    title: { fontFamily: font.semibold, fontSize: 14 },
    message: { fontFamily: font.regular, fontSize: 13, color: colors.ink2, lineHeight: 18 },
    action: { alignSelf: 'flex-start', marginTop: 6 },
    actionText: { fontFamily: font.bold, fontSize: 13, textDecorationLine: 'underline' },
}
);
