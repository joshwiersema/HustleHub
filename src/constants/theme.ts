export const Colors = {
  // Core backgrounds
  bg: '#0A0A0F',
  bgCard: '#141419',
  bgCardHover: '#1A1A22',
  bgElevated: '#1E1E28',
  bgInput: '#16161E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E9A',
  textMuted: '#5A5A66',
  textInverse: '#0A0A0F',

  // Primary accent - vibrant green (money/growth)
  primary: '#00E676',
  primaryDim: '#00C853',
  primaryBg: 'rgba(0, 230, 118, 0.12)',
  primaryBorder: 'rgba(0, 230, 118, 0.25)',

  // Secondary accent - purple (premium/XP)
  secondary: '#B388FF',
  secondaryDim: '#7C4DFF',
  secondaryBg: 'rgba(179, 136, 255, 0.12)',
  secondaryBorder: 'rgba(179, 136, 255, 0.25)',

  // Accent - amber (coins/currency)
  amber: '#FFD740',
  amberDim: '#FFC400',
  amberBg: 'rgba(255, 215, 64, 0.12)',

  // Status
  success: '#00E676',
  warning: '#FFD740',
  error: '#FF5252',
  info: '#40C4FF',

  // Borders
  border: '#2A2A35',
  borderLight: '#1E1E28',

  // Gradients
  gradientGreen: ['#00E676', '#00C853'] as const,
  gradientPurple: ['#B388FF', '#7C4DFF'] as const,
  gradientGold: ['#FFD740', '#FFC400'] as const,
  gradientDark: ['#141419', '#0A0A0F'] as const,
  gradientHero: ['#00E676', '#7C4DFF'] as const,
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
