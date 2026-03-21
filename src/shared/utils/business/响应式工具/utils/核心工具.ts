// @审计已完成
/**
 * 响应式工具 - 核心工具
 * 
 * 提供响应式值获取的核心功能
 */

import { breakpoints } from '../config/断点配置';
import type { ResponsiveValues } from '../types';

export function getResponsiveValue<T>(values: ResponsiveValues<T>): T {
  if (typeof window === 'undefined') return values.desktop || values.tablet || values.mobile as T;
  
  const width = window.innerWidth;
  
  if (width >= breakpoints.wide && values.wide !== undefined) return values.wide;
  if (width >= breakpoints.desktop && values.desktop !== undefined) return values.desktop;
  if (width >= breakpoints.tablet && values.tablet !== undefined) return values.tablet;
  return values.mobile || values.tablet || values.desktop as T;
}
