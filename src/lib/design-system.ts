/**
 * Represent Yourself - Design System
 * Notion-inspired design tokens and utilities
 */

// Color Palette - Warm, approachable, professional
export const colors = {
  // Primary - Deep blue for trust and professionalism
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Neutral - Warm grays for a friendly feel
  neutral: {
    0: '#FFFFFF',
    25: '#FCFCFC',
    50: '#FAFAFA',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Semantic colors
  success: {
    light: '#ECFDF5',
    main: '#10B981',
    dark: '#047857',
  },
  warning: {
    light: '#FFFBEB',
    main: '#F59E0B',
    dark: '#B45309',
  },
  error: {
    light: '#FEF2F2',
    main: '#EF4444',
    dark: '#B91C1C',
  },
  info: {
    light: '#EFF6FF',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.8125rem',   // 13px
    base: '0.875rem',  // 14px
    md: '0.9375rem',   // 15px
    lg: '1rem',        // 16px
    xl: '1.125rem',    // 18px
    '2xl': '1.25rem',  // 20px
    '3xl': '1.5rem',   // 24px
    '4xl': '1.875rem', // 30px
    '5xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// Spacing Scale (4px base)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
};

// Border Radius
export const radius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows - Notion-style subtle shadows
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.03)',
  // Colored shadows for depth
  primarySm: '0 1px 3px 0 rgb(99 102 241 / 0.1), 0 1px 2px -1px rgb(99 102 241 / 0.1)',
  primaryMd: '0 4px 6px -1px rgb(99 102 241 / 0.1), 0 2px 4px -2px rgb(99 102 241 / 0.1)',
};

// Transitions
export const transitions = {
  duration: {
    fastest: '50ms',
    fast: '100ms',
    normal: '150ms',
    slow: '200ms',
    slower: '300ms',
    slowest: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom easings for polish
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation variants for Framer Motion
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  },
};

// Common component styles
export const componentStyles = {
  // Focus ring for accessibility
  focusRing: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',

  // Interactive element base
  interactive: 'transition-colors duration-150 ease-out cursor-pointer select-none',

  // Card styles
  card: 'bg-white rounded-xl border border-neutral-200 shadow-sm',
  cardHover: 'hover:shadow-md hover:border-neutral-300 transition-all duration-200',

  // Input styles
  input: 'w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150',

  // Button base
  buttonBase: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
};

// Legal document types for the app
export const documentTypes = {
  affidavit: { label: 'Affidavit', icon: 'FileText', color: 'primary' },
  submission: { label: 'Written Submission', icon: 'FileCheck', color: 'success' },
  letter: { label: 'Letter to Court', icon: 'Mail', color: 'info' },
  skeleton: { label: 'Skeleton Argument', icon: 'FileStack', color: 'warning' },
  notice: { label: 'Notice of Motion', icon: 'Bell', color: 'error' },
  response: { label: 'Response', icon: 'MessageSquare', color: 'primary' },
  evidence: { label: 'Evidence Bundle', icon: 'Folder', color: 'neutral' },
};

// Case status types
export const caseStatuses = {
  active: { label: 'Active', color: 'success', description: 'Case is ongoing' },
  pending: { label: 'Pending', color: 'warning', description: 'Awaiting response or action' },
  urgent: { label: 'Urgent', color: 'error', description: 'Immediate attention required' },
  closed: { label: 'Closed', color: 'neutral', description: 'Case has concluded' },
  appeal: { label: 'On Appeal', color: 'info', description: 'Appeal in progress' },
};

// Keyboard shortcuts
export const shortcuts = {
  global: {
    commandPalette: { keys: ['⌘', 'K'], description: 'Open command palette' },
    newDocument: { keys: ['⌘', 'N'], description: 'New document' },
    search: { keys: ['⌘', 'F'], description: 'Search' },
    settings: { keys: ['⌘', ','], description: 'Open settings' },
  },
  navigation: {
    cases: { keys: ['⌘', '1'], description: 'Go to cases' },
    documents: { keys: ['⌘', '2'], description: 'Go to documents' },
    timeline: { keys: ['⌘', '3'], description: 'Go to timeline' },
    inbox: { keys: ['⌘', '4'], description: 'Go to inbox' },
  },
  editor: {
    save: { keys: ['⌘', 'S'], description: 'Save document' },
    undo: { keys: ['⌘', 'Z'], description: 'Undo' },
    redo: { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
    bold: { keys: ['⌘', 'B'], description: 'Bold text' },
    italic: { keys: ['⌘', 'I'], description: 'Italic text' },
  },
};
