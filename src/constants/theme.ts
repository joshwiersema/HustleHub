export const Colors = {
  // Core backgrounds — clean whites and light grays
  bg: '#FFFFFF',
  bgCard: '#F8F8FA',
  bgCardHover: '#F0F0F4',
  bgElevated: '#FFFFFF',
  bgInput: '#F4F4F6',

  // Text — dark for readability on white
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Primary accent — red/crimson
  primary: '#DC2626',
  primaryDim: '#B91C1C',
  primaryLight: '#FEE2E2',
  primaryBg: 'rgba(220, 38, 38, 0.08)',
  primaryBorder: 'rgba(220, 38, 38, 0.20)',

  // Secondary — neutral grays
  secondary: '#6B7280',
  secondaryDim: '#4B5563',
  secondaryBg: 'rgba(107, 114, 128, 0.08)',
  secondaryBorder: 'rgba(107, 114, 128, 0.15)',

  // Accent — kept minimal
  amber: '#6B7280',
  amberDim: '#4B5563',
  amberBg: 'rgba(107, 114, 128, 0.06)',

  // Status
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  // Borders — subtle light grays
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Gradients
  gradientPrimary: ['#DC2626', '#B91C1C'] as const,
  gradientGreen: ['#DC2626', '#B91C1C'] as const,
  gradientPurple: ['#DC2626', '#991B1B'] as const,
  gradientGold: ['#DC2626', '#B91C1C'] as const,
  gradientDark: ['#F8F8FA', '#FFFFFF'] as const,
  gradientHero: ['#DC2626', '#991B1B'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
  mega: 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
