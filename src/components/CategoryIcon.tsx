import { View } from 'react-native';
import { Icon } from './Icons';
import { category, type CategoryKey } from '@/constants/theme';

type Props = {
  cat: CategoryKey; // 'food' | 'transport' | 'bills' | ...
  size?: number; // tile size in px, default 40
};

// A rounded square in the category's soft colour, with its icon inside
export function CategoryIcon({ cat, size = 40 }: Props) {
  const c = category[cat];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3, // 12 px corners at the default size
        backgroundColor: c.soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* The category key doubles as the icon name: 'food' → restaurant icon */}
      <Icon name={cat} size={size / 2} color={c.fg} />
    </View>
  );
}