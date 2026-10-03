import { Pressable, StyleSheet, Text } from 'react-native';
import { Icon, type IconName } from './Icons';
import { font } from '@/constants/theme';

// The four states from section 4 of the project document
export type SyncState = 'synced' | 'pending' | 'syncing' | 'offline';

// What each state looks like
const STATES: Record<SyncState, { bg: string; fg: string; icon: IconName }> = {
  synced: { bg: '#DDF2E8', fg: '#0B5238', icon: 'check' },
  pending: { bg: '#FFF1D6', fg: '#8A5200', icon: 'clock' },
  syncing: { bg: '#E4EDFA', fg: '#1F4F8A', icon: 'sync' },
  offline: { bg: '#FBE5E3', fg: '#9A2F2B', icon: 'offline' },
};

type Props = {
  state: SyncState;
  pendingCount?: number; // only used when state is 'pending'
  onPress?: () => void;
};

// Builds the text for a state, e.g. "3 pending"
function labelFor(state: SyncState, pendingCount: number) {
  switch (state) {
    case 'synced':
      return 'Synced';
    case 'pending':
      return `${pendingCount} pending`;
    case 'syncing':
      return 'Syncing…';
    case 'offline':
      return 'Offline';
  }
}

export function SyncBadge({ state, pendingCount = 0, onPress }: Readonly<Props>) {
  const s = STATES[state];
  const label = labelFor(state, pendingCount);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${label}`}
      style={[styles.badge, { backgroundColor: s.bg }]}
    >
      <Icon name={s.icon} size={14} color={s.fg} />
      <Text style={[styles.text, { color: s.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // shrink to fit the text, don't stretch full width
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  text: { fontFamily: font.semibold, fontSize: 12 },
});