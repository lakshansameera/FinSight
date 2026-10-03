import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, font } from '@/constants/theme';
import { formatLKR } from '@/utils/currency';
import { budgetStatus, STATUS_COLORS } from '@/utils/budget';


type Props = Readonly<{
  spent: number;
  limit: number;
  size?: number; // outer diameter in px
  stroke?: number; // ring thickness
}>;

export function BudgetRing({ spent, limit, size = 168, stroke = 14 }: Props) {
  const status = budgetStatus(spent, limit);
  const c = STATUS_COLORS[status];


  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;


  const pct = limit > 0 ? spent / limit : 0;
  const progress = Math.min(Math.max(pct, 0), 1);


  const dashOffset = circumference * (1 - progress);

  const left = limit - spent;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`Monthly budget. ${formatLKR(spent)} of ${formatLKR(limit)} spent, ${Math.round(pct * 100)} percent.`}
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
       <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.fill}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>


      <View style={[styles.center, { paddingHorizontal: stroke + 8 }]} pointerEvents="none">
        <Text style={styles.big}>{Math.round(pct * 100)}%</Text>
        <Text style={[styles.small, { color: c.text }]}>
          {left >= 0 ? `${formatLKR(left)} left` : `Over by ${formatLKR(-left)}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 2 },
  big: { fontFamily: font.extrabold, fontSize: 30, color: colors.ink, fontVariant: ['tabular-nums'] },
  small: { fontFamily: font.semibold, fontSize: 12, textAlign: 'center' },
});