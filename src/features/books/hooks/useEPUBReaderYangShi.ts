// @审计已完成
// EPUB 阅读器样式常量

export const HuaXianYanSe: Record<string, string> = {
  yellow: 'hl-yellow',
  green: 'hl-green',
  blue: 'hl-blue',
  pink: 'hl-pink',
};

export const HuaXianYangShi: Record<string, { fill: string; 'fill-opacity': string; stroke: string; 'stroke-width': string; 'stroke-dasharray': string }> = {
  yellow: { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
  green: { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
  blue: { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
  pink: { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' },
};

export const ZanShiHuaXianYanSe = 'temp-hl';

export const ZanShiHuaXianYangShi = { fill: 'transparent', 'fill-opacity': '0', stroke: '#000000', 'stroke-width': '1px', 'stroke-dasharray': '3,2' };

export function huoQuZhuTiYingWen(yanSe: string): string {
  return HuaXianYanSe[yanSe] || HuaXianYanSe.yellow;
}

export function huoQuZhuTiYangShi(yanSe: string) {
  return HuaXianYangShi[yanSe] || HuaXianYangShi.yellow;
}