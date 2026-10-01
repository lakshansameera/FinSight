export const colors = {
  primary: '#11694A',
  primaryPressed: '#0B5238',
  primarySoft: '#DDF2E8',
  bg: '#F3F5F4',
  surface: '#FFFFFF',
  ink: '#14201A',
  ink2: '#45524C',
  caption: '#5F6B66',
  line: '#E2E8E5',
  success: '#1A845E',
  warning: '#C98A12',
  warningText: '#8A5200',
  warningSoft: '#FFF1D6',
  danger: '#B23A36',
  dangerSoft: '#FBE5E3',
  info: '#2861A8',
  infoSoft: '#E4EDFA',
} as const;

export const category = {
  food:     { solid: '#11694A', soft: '#DDF2E8', fg: '#11694A' },
  transport:{ solid: '#2861A8', soft: '#E4EDFA', fg: '#2861A8' },
  bills:    { solid: '#D9921A', soft: '#FDF0D9', fg: '#8A5200' },
  shopping: { solid: '#8A55C0', soft: '#F1E8FA', fg: '#6E3FA0' },
  health:   { solid: '#C9557A', soft: '#FBE6EC', fg: '#A83A5E' },
  other:    { solid: '#9AA5A0', soft: '#ECEFED', fg: '#45524C' },
  income:   { solid: '#1A845E', soft: '#DDF2E8', fg: '#1A845E' },
  loans:    { solid: '#B5532A', soft: '#FBEAE0', fg: '#8A3B17' },
  family:   { solid: '#0E8C9B', soft: '#DDF3F5', fg: '#0A6670' },
} as const;

export type CategoryKey = keyof typeof category;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { chip: 8, input: 14, card: 20, pill: 999 } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const type = {
  display:  { fontFamily: font.extrabold, fontSize: 32, color: colors.ink },
  headline: { fontFamily: font.bold, fontSize: 22, color: colors.ink },
  title:    { fontFamily: font.semibold, fontSize: 16, color: colors.ink },
  body:     { fontFamily: font.regular, fontSize: 14, color: colors.ink },
  label:    { fontFamily: font.semibold, fontSize: 13, color: colors.ink },
  caption:  { fontFamily: font.medium, fontSize: 12, color: colors.caption },
} as const;