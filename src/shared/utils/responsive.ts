export interface ResponsiveStyles {
  mobile: React.CSSProperties;
  tablet: React.CSSProperties;
  desktop: React.CSSProperties;
}

export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export function getResponsiveValue<T>(values: { mobile?: T; tablet?: T; desktop?: T; wide?: T }): T {
  if (typeof window === 'undefined') return values.desktop || values.tablet || values.mobile as T;
  
  const width = window.innerWidth;
  
  if (width >= breakpoints.wide && values.wide !== undefined) return values.wide;
  if (width >= breakpoints.desktop && values.desktop !== undefined) return values.desktop;
  if (width >= breakpoints.tablet && values.tablet !== undefined) return values.tablet;
  return values.mobile || values.tablet || values.desktop as T;
}

export function createResponsiveContainer(baseStyle: React.CSSProperties = {}): React.CSSProperties {
  return {
    width: '100%',
    maxWidth: '72rem',
    margin: '0 auto',
    padding: getResponsiveValue({
      mobile: '1rem',
      tablet: '1.25rem',
      desktop: '1.5rem',
    }),
    ...baseStyle,
  };
}

export function createResponsiveGrid({
  minCardWidth = 180,
  gap = 1.5,
}: {
  minCardWidth?: number;
  gap?: number;
} = {}): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: getResponsiveValue({
      mobile: 'repeat(auto-fill, minmax(140px, 1fr))',
      tablet: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
    }),
    gap: `${gap}rem`,
  };
}

export function createResponsiveFlex({
  direction = 'row',
  wrap = 'wrap',
  gap = 1,
  align = 'flex-start',
}: {
  direction?: 'row' | 'column';
  wrap?: 'wrap' | 'nowrap';
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end';
} = {}): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: getResponsiveValue({
      mobile: direction === 'row' ? 'column' : 'column',
      tablet: direction,
    }),
    flexWrap: wrap,
    gap: getResponsiveValue({
      mobile: `${gap * 0.75}rem`,
      tablet: `${gap}rem`,
    }),
    alignItems: align,
  };
}

export function createResponsiveText({
  size = 'base',
  weight = 'normal',
}: {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
} = {}): React.CSSProperties {
  const sizes = {
    xs: { fontSize: '0.75rem', lineHeight: '1rem' },
    sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
    base: { fontSize: '1rem', lineHeight: '1.5rem' },
    lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },
    xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },
    '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  };

  const weights = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };

  return {
    ...sizes[size],
    fontWeight: weights[weight],
  };
}

export function createResponsiveButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
} = {}): React.CSSProperties {
  const variants = {
    primary: { backgroundColor: '#3b82f6', color: '#ffffff' },
    secondary: { backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db' },
    danger: { backgroundColor: '#ef4444', color: '#ffffff' },
    success: { backgroundColor: '#22c55e', color: '#ffffff' },
  };

  const sizes = {
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
  };

  return {
    ...variants[variant],
    ...sizes[size],
    borderRadius: '0.5rem',
    border: variant === 'secondary' ? '1px solid #d1d5db' : 'none',
    cursor: 'pointer',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  };
}

export function createResponsiveCard({
  padding = 'md',
}: {
  padding?: 'sm' | 'md' | 'lg';
} = {}): React.CSSProperties {
  const paddings = {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
  };

  return {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: paddings[padding],
  };
}

export function createResponsiveModal(): React.CSSProperties {
  return {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: getResponsiveValue({
      mobile: '1rem',
      tablet: '1.5rem',
    }),
  };
}

export function createResponsiveModalContent({
  maxWidth = '28rem',
}: {
  maxWidth?: string;
} = {}): React.CSSProperties {
  return {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: getResponsiveValue({
      mobile: '100%',
      tablet: maxWidth,
    }),
    width: '100%',
    padding: getResponsiveValue({
      mobile: '1rem',
      tablet: '1.5rem',
    }),
  };
}
