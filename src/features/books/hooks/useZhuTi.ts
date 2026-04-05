// @审计已完成
// 主题 Hook - 管理阅读主题配色（浅色/深色）

import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';

export type ZhuTiLeiXing = 'light' | 'dark';

interface ZhuTiSheZhi {
  backgroundColor: string;
  textColor: string;
  titleColor: string;
}

const ZHU_TI_PEIZHI: Record<ZhuTiLeiXing, ZhuTiSheZhi> = {
  light: { backgroundColor: '#F2F2F4', textColor: '#1A1A2E', titleColor: '#A04030' },
  dark: { backgroundColor: '#222228', textColor: '#BBBBc4', titleColor: '#D4707E' },
};

interface UseZhuTiProps {
  userId: string;
  bookId: string;
}

export function useZhuTi({ userId, bookId }: UseZhuTiProps) {
  const storageKey = `zhuti_${userId}_${bookId}`;
  const [zhuTi, setZhuTi] = useLocalStorageState<ZhuTiLeiXing>(storageKey, { defaultValue: 'light' });

  const qieHuanZhuTi = () => {
    setZhuTi(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const yingYongZhuTi = (rendition: Rendition, theme: ZhuTiLeiXing) => {
    const peizhi = ZHU_TI_PEIZHI[theme];
    const themes = rendition.themes;
    themes.override('color', peizhi.textColor);
    themes.override('background', peizhi.backgroundColor);
    themes.default({
      body: {
        'background-color': `${peizhi.backgroundColor} !important`,
        'color': `${peizhi.textColor} !important`,
      },
      '*': {
        'background-color': `${peizhi.backgroundColor} !important`,
        'color': `${peizhi.textColor} !important`,
        'max-width': 'none !important',
      },
      '.epubjs-hl': { 'fill-opacity': '0.1' },
      '.hl-underline-blue': { 'fill-opacity': '0.08', 'background': 'linear-gradient(to right, #5E94FF 0%, #5E94FF 100%) no-repeat', 'background-size': '100% 2px', 'background-position': '0 100%', 'padding-bottom': '4px', 'border': 'none', 'display': 'inline' },
      '.hl-underline-yellow': { 'fill-opacity': '0.08', 'background': 'linear-gradient(to right, #F5C842 0%, #F5C842 100%) no-repeat', 'background-size': '100% 2px', 'background-position': '0 100%', 'padding-bottom': '4px', 'border': 'none', 'display': 'inline' },
      '.hl-underline-green': { 'fill-opacity': '0.08', 'background': 'linear-gradient(to right, #4ADE80 0%, #4ADE80 100%) no-repeat', 'background-size': '100% 2px', 'background-position': '0 100%', 'padding-bottom': '4px', 'border': 'none', 'display': 'inline' },
      '.hl-underline-pink': { 'fill-opacity': '0.08', 'background': 'linear-gradient(to right, #F472B6 0%, #F472B6 100%) no-repeat', 'background-size': '100% 2px', 'background-position': '0 100%', 'padding-bottom': '4px', 'border': 'none', 'display': 'inline' },
      '.mk-marker-yellow': { 'fill-opacity': '0.25', 'background-color': 'rgba(245,200,66,0.3)', 'padding': '0 2px', 'border-radius': '2px', 'display': 'inline' },
      '.mk-marker-green': { 'fill-opacity': '0.25', 'background-color': 'rgba(74,222,128,0.3)', 'padding': '0 2px', 'border-radius': '2px', 'display': 'inline' },
      '.mk-marker-blue': { 'fill-opacity': '0.25', 'background-color': 'rgba(94,148,255,0.25)', 'padding': '0 2px', 'border-radius': '2px', 'display': 'inline' },
      '.mk-marker-pink': { 'fill-opacity': '0.25', 'background-color': 'rgba(244,114,182,0.3)', 'padding': '0 2px', 'border-radius': '2px', 'display': 'inline' },
    });
  };

  return { zhuTi, setZhuTi, qieHuanZhuTi, yingYongZhuTi, ZHU_TI_PEIZHI };
}