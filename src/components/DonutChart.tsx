import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { category as categoryColors, colors, font, type CategoryKey } from '@/constants/theme';

type Props = Readonly<{
  slices: { category: CategoryKey; share: number }[];
  centerTop: string;
  centerBottom: string;
  size?: number;
  stroke?: number;
}>;

export function DonutChart({ slices, centerTop, centerBottom, size = 160, stroke = 22 }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`Spending by category. ${centerBottom}: ${centerTop}`}
    >
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
          {slices.map((s) => {
            const len = Math.max(s.share * c - 2, 0); // 2px gap between slices
            const el = (
              <Circle
                key={s.category}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={categoryColors[s.category].solid}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += s.share * c;
            return el;
          })}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.top}>{centerTop}</Text>
        <Text style={styles.bottom}>{centerBottom}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  top: { fontFamily: font.extrabold, fontSize: 18, color: colors.ink, fontVariant: ['tabular-nums'] },
  bottom: { fontFamily: font.medium, fontSize: 12, color: colors.caption },
});