// @审计已完成
// EPUB 阅读器事件处理 Hook

import { useCallback, useEffect } from 'react';
import type { Rendition, Contents } from 'epubjs';
import { useEPUBReaderFanYeHeYeMa } from './useEPUBReaderFanYeHeYeMa';

interface UseEPUBReaderShiJianProps {
  yingYongZhuTi: (rendition: Rendition, zhuTi: string) => void;
  zhuTi: string;
  ziTiDaXiao: number;
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  chuLiSouSuoJieGuo: (jieGuo: any[], rendition?: Rendition) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  huaCiKaiQi: boolean;
  setSelectedText: (text: string) => void;
  setShowMenu: (show: boolean) => void;
  setSelectionRect: (rect: DOMRect | null) => void;
}

export function useEPUBReaderShiJian({
  yingYongZhuTi, zhuTi, ziTiDaXiao, setYeMaXinXi, setLocation,
  chuLiSouSuoJieGuo, tiaoDaoShangYiGe, tiaoDaoXiaYiGe, huaCiKaiQi,
  setSelectedText, setShowMenu, setSelectionRect,
}: UseEPUBReaderShiJianProps) {
  const fanYeHeYeMa = useEPUBReaderFanYeHeYeMa({
    setYeMaXinXi, setLocation, tiaoDaoShangYiGe, tiaoDaoXiaYiGe,
  });

  const handleTextSelected = useCallback((cfiRange: string, contents: Contents) => {
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition || !huaCiKaiQi) return;
    try {
      const text = rendition.getRange(cfiRange).toString().trim();
      if (text) {
        setSelectedText(text);
        setShowMenu(true);
        const range = rendition.getRange(cfiRange);
        const rect = range.getBoundingClientRect();
        setSelectionRect(rect);
      }
      contents.window.getSelection()?.removeAllRanges();
    } catch (error) { console.error('处理选中文本时出错:', error); }
  }, [huaCiKaiQi, setSelectedText, setShowMenu, setSelectionRect]);

  const handleRendition = useCallback((rendition: Rendition) => {
    fanYeHeYeMa.renditionRef.current = rendition;
    rendition.on('selected', handleTextSelected);
    rendition.on('rendered', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    rendition.on('relocated', () => {
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
    yingYongZhuTi(rendition, zhuTi);
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
    rendition.book.loaded.navigation.then((nav) => {
      fanYeHeYeMa.tocRef.current = nav.toc || [];
      fanYeHeYeMa.gengXinYeMaXinXi();
    });
  }, [handleTextSelected, yingYongZhuTi, zhuTi, ziTiDaXiao, fanYeHeYeMa]);

  useEffect(() => {
    const rendition = fanYeHeYeMa.renditionRef.current;
    if (!rendition) return;
    yingYongZhuTi(rendition, zhuTi);
    rendition.themes.fontSize(`${ziTiDaXiao}%`);
  }, [zhuTi, ziTiDaXiao, yingYongZhuTi, fanYeHeYeMa.renditionRef]);

  useEffect(() => {
    return () => {
      const rendition = fanYeHeYeMa.renditionRef.current;
      if (rendition) {
        rendition.off('selected', handleTextSelected);
      }
    };
  }, [handleTextSelected, fanYeHeYeMa.renditionRef]);

  const handleSouSuoJieGuo = useCallback((jieGuo: any[]) => {
    chuLiSouSuoJieGuo(jieGuo, fanYeHeYeMa.renditionRef.current);
  }, [chuLiSouSuoJieGuo, fanYeHeYeMa.renditionRef]);

  const handleLocationChanged = useCallback((epubcfi: string) => {
    fanYeHeYeMa.handleLocationChanged(epubcfi);
  }, [fanYeHeYeMa]);

  return {
    renditionRef: fanYeHeYeMa.renditionRef, handleRendition,
    handleNextPage: fanYeHeYeMa.handleNextPage, handlePrevPage: fanYeHeYeMa.handlePrevPage,
    handleShangYiGeSouSuoJieGuo: fanYeHeYeMa.handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo: fanYeHeYeMa.handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged, handleSouSuoJieGuo,
  };
}
