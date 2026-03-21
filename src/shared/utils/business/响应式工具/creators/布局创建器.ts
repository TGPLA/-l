// @审计已完成
/**
 * 响应式工具 - 布局创建器
 * 
 * 创建容器、网格、弹性布局等响应式样式
 */

import { getResponsiveValue } from '../utils/核心工具';

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
