import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryIcon } from './CategoryIcon';
import { category as categoryColors, colors, font, type CategoryKey } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';

type Props = Readonly<{
  options: CategoryKey[];
  value: CategoryKey | null;
  onChange: (cat: CategoryKey) => void;
}>;


export function CategoryPicker({ options, value, onChange }: Props) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {options.map((cat) => {
        const selected = cat === value;
        return (
          <Pressable
            key={cat}
            onPress={() => onChange(cat)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={CATEGORY_LABELS[cat]}
            style={[
              styles.tile,
              selected && { borderColor: categoryColors[cat].solid, backgroundColor: categoryColors[cat].soft },
            ]}
          >
            <CategoryIcon cat={cat} size={36} />
            <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
              {CATEGORY_LABELS[cat].split(' ')[0]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '23%', // 4 per row
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
  },
  text: { fontFamily: font.medium, fontSize: 12, color: colors.ink2 },
  textSelected: { fontFamily: font.bold, color: colors.ink },
});