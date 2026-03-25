export const Colors = {
  // Core backgrounds — rich near-blacks for depth
  bg: '#0C0C0F',
  bgCard: '#141418',
  bgCardHover: '#1A1A22',
  bgElevated: '#1E1E26',
  bgInput: '#16161E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8A8A96',
  textMuted: '#6B6B78',
  textInverse: '#0C0C0F',

  // Primary accent — red/crimson
  primary: '#DC2626',
  primaryDim: '#B91C1C',
  primaryBg: 'rgba(220, 38, 38, 0.12)',
  primaryBorder: 'rgba(220, 38, 38, 0.25)',

  // Secondary — muted (no bright purple; use subtle white-based accents)
  secondary: '#8A8A96',
  secondaryDim: '#6B6B78',
  secondaryBg: 'rgba(138, 138, 150, 0.12)',
  secondaryBorder: 'rgba(138, 138, 150, 0.25)',

  // Accent — kept minimal (no amber; use subtle warm gray if needed)
  amber: '#8A8A96',
  amberDim: '#6B6B78',
  amberBg: 'rgba(138, 138, 150, 0.08)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#1E1E28',
  borderLight: '#1A1A22',

  // Gradients — red-based system
  gradientPrimary: ['#DC2626', '#B91C1C'] as const,
  gradientGreen: ['#DC2626', '#B91C1C'] as const, // alias for backward compat
  gradientPurple: ['#DC2626', '#991B1B'] as const, // alias for backward compat
  gradientGold: ['#DC2626', '#B91C1C'] as const, // alias for backward compat
  gradientDark: ['#141418', '#0C0C0F'] as const,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};
