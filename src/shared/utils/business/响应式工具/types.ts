// @审计已完成
/**
 * 响应式工具 - 类型定义
 * 
 * 定义响应式工具相关的所有类型
 */

export interface ResponsiveStyles {
  mobile: React.CSSProperties;
  tablet: React.CSSProperties;
  desktop: React.CSSProperties;
}

export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveValues<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}
