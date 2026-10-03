import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


const ICONS = {
  // navigation
  home: { set: 'ion', glyph: 'home-outline' },
  list: { set: 'ion', glyph: 'list-outline' },
  scan: { set: 'ion', glyph: 'scan-outline' },
  insights: { set: 'ion', glyph: 'trending-up-outline' },
  bank: { set: 'mci', glyph: 'bank-outline' },
  back: { set: 'ion', glyph: 'chevron-back' },
  bell: { set: 'ion', glyph: 'notifications-outline' },
  // actions
  check: { set: 'ion', glyph: 'checkmark' },
  plus: { set: 'ion', glyph: 'add' },
  pencil: { set: 'ion', glyph: 'create-outline' },
  // status
  clock: { set: 'ion', glyph: 'time-outline' },
  sync: { set: 'ion', glyph: 'sync-outline' },
  offline: { set: 'ion', glyph: 'cloud-offline-outline' },
  alert: { set: 'ion', glyph: 'warning-outline' },
  sparkle: { set: 'ion', glyph: 'sparkles-outline' },
  repeat: { set: 'ion', glyph: 'repeat-outline' },
  // spending categories
  food: { set: 'ion', glyph: 'restaurant-outline' },
  transport: { set: 'ion', glyph: 'bus-outline' },
  bills: { set: 'ion', glyph: 'flash-outline' },
  shopping: { set: 'ion', glyph: 'bag-handle-outline' },
  health: { set: 'ion', glyph: 'heart-outline' },
  other: { set: 'ion', glyph: 'grid-outline' },
  income: { set: 'ion', glyph: 'arrow-down-outline' },
  loans: { set: 'mci', glyph: 'hand-coin-outline' },
  family: { set: 'ion', glyph: 'people-outline' },
  // banners and cards
  close: { set: 'ion', glyph: 'close' },
  info: { set: 'ion', glyph: 'information-circle-outline' },
  chevron: { set: 'ion', glyph: 'chevron-forward' },
} as const;

export type IconName = keyof typeof ICONS;

type Props = { name: IconName; color: string; size?: number };

export function Icon({ name, color, size = 22 }: Props) {
  const icon = ICONS[name];
  if (icon.set === 'mci') {
    return <MaterialCommunityIcons name={icon.glyph} size={size} color={color} />;
  }
  return <Ionicons name={icon.glyph} size={size} color={color} />;
}