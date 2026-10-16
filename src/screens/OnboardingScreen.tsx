import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icons';
import { colors, font } from '@/constants/theme';
import { useAppDispatch } from '@/store/hooks';
import { finishOnboarding } from '@/store/authSlice';

const SLIDES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'scan',
    title: 'Capture spending in seconds',
    body: 'Add expenses by hand, photograph a receipt, or paste a bank SMS. You always confirm before anything is saved.',
  },
  {
    icon: 'clock',
    title: 'Works without internet',
    body: 'Everything is saved on your phone first, then backed up when you are online. Bill reminders work offline too.',
  },
  {
    icon: 'insights',
    title: 'See where your money goes',
    body: 'Budgets warn you at 80%, insights explain your month in plain words, and offers match what you actually spend on.',
  },
];

export default function OnboardingScreen() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const last = step === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Icon name={slide.icon} size={44} color={colors.primary} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{slide.title}</Text>
        <Text style={styles.text}>{slide.body}</Text>

        <View style={styles.dots} accessibilityLabel={`Step ${step + 1} of ${SLIDES.length}`}>
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === step && styles.dotOn]} />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={last ? 'Get started' : 'Next'}
          onPress={() => (last ? dispatch(finishOnboarding()) : setStep(step + 1))}
        />
        {!last ? <Button title="Skip" variant="outline" onPress={() => dispatch(finishOnboarding())} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  badge: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.extrabold, fontSize: 26, color: colors.ink, textAlign: 'center' },
  text: { fontFamily: font.medium, fontSize: 15, color: colors.ink2, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { width: 24, backgroundColor: colors.primary },
  footer: { gap: 10 },
});