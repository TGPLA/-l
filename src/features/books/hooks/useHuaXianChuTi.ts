// @审计已完成
// 划线出题 Hook - AI出题、划线标记、马克笔、复制文字
// 划线渲染采用双轨制：SVG overlay（位置追踪+点击检测） + DOM span 包裹（CSS 样式）
// 支持两种标记类型：underline（下划线）/ marker（马克笔高亮）

import { useState, useCallback, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { Rendition } from 'epubjs';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export type HuaXianYanSe = 'yellow' | 'green' | 'blue' | 'pink';

export type BiaoJiLeiXing = 'underline' | 'marker';

export interface HuaXianXinXi {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: HuaXianYanSe;
  leiXing: BiaoJiLeiXing;
  beiZhu: string;
  createdAt: number;
}

interface HuaCiJiaoHuWenJian {
  setCurrentCfiRange: (cfiRange: string | null) => void;
  getCurrentCfiRange: () => string | null;
}

interface UseHuaXianChuTiProps {
  userId: string;
  bookId: string;
  chapterId: string;
  onClose: () => void;
  renditionRef?: React.RefObject<Rendition | undefined>;
  bookRef?: React.RefObject<any>;
  huaCiJiaoHuRef?: HuaCiJiaoHuWenJian;
}

const YAN_SE_PEI_ZHI: Record<HuaXianYanSe, string> = {
  yellow: '#F5C842',
  green: '#4ADE80',
  blue: '#5E94FF',
  pink: '#F472B6',
};

const HL_CLASS_MAP: Record<HuaXianYanSe, string> = {
  yellow: 'hl-underline-yellow',
  green: 'hl-underline-green',
  blue: 'hl-underline-blue',
  pink: 'hl-underline-pink',
};

const MK_CLASS_MAP: Record<HuaXianYanSe, string> = {
  yellow: 'mk-marker-yellow',
  green: 'mk-marker-green',
  blue: 'mk-marker-blue',
  pink: 'mk-marker-pink',
};

function baoGuaSpan(rendition: Rendition, cfiRange: string, className: string, id?: string) {
  try {
    const range = rendition.getRange(cfiRange);
    if (!range || range.collapsed) return;
    const doc = range.commonAncestorContainer.ownerDocument as Document;
    const span = doc.createElement('span');
    span.className = className;
    span.setAttribute('data-biaoji', 'true');
    span.setAttribute('data-cfi', cfiRange);
    if (id) span.setAttribute('data-huaxian-id', id);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      range.surroundContents(span);
      return;
    }
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  } catch (e) {
    console.warn('DOM 包裹失败（跨元素边界时正常）:', e);
  }
}

export function useHuaXianChuTi({
  userId,
  bookId,
  chapterId,
  onClose,
  renditionRef,
  bookRef,
  huaCiJiaoHuRef,
}: UseHuaXianChuTiProps) {
  const [generating, setGenerating] = useState(false);
  const storageKey = `huaxian_${userId}_${bookId}_${chapterId}`;
  const [huaXianList, setHuaXianList] = useLocalStorageState<HuaXianXinXi[]>(storageKey, { defaultValue: [] });

  useEffect(() => {
    if (huaXianList.length === 0) return;
    const cleaned = huaXianList.filter((h, i, self) => i === self.findIndex(x => x.cfiRange === h.cfiRange && x.leiXing === h.leiXing));
    if (cleaned.length < huaXianList.length) setHuaXianList(cleaned);
  }, []);

  const yingYongBiaoJi = useCallback(async (cfiRange: string, qingChuJiu: boolean = false, yanSe: HuaXianYanSe = 'blue', leiXing: BiaoJiLeiXing = 'underline', id?: string) => {
    const rendition = renditionRef?.current;
    if (!rendition) {
      console.error('应用标记失败: rendition 不存在');
      return;
    }
    if (qingChuJiu) {
      rendition.annotations.remove('highlight');
    }
    const se = YAN_SE_PEI_ZHI[yanSe];
    const cls = leiXing === 'marker' ? MK_CLASS_MAP[yanSe] : HL_CLASS_MAP[yanSe];
    const svgStyle = { fill: se, 'fill-opacity': leiXing === 'marker' ? '0.25' : '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
    rendition.annotations.add('highlight', cfiRange, {}, () => {}, cls, svgStyle);
    baoGuaSpan(rendition, cfiRange, cls, id);
  }, [renditionRef]);

  useEffect(() => {
    let rendition = renditionRef?.current;
    if (!rendition) {
      const checkRendition = setInterval(() => {
        rendition = renditionRef?.current;
        if (rendition) {
          clearInterval(checkRendition);
          setupRenditionListener(rendition);
        }
      }, 100);
      return () => clearInterval(checkRendition);
    }
    setupRenditionListener(rendition);

    function setupRenditionListener(r: typeof rendition) {
      const applyBiaoJi = () => {
        const currentRendition = renditionRef?.current;
        if (!currentRendition) return;
        currentRendition.annotations.remove('highlight');
        const currentData = JSON.parse(localStorage.getItem(`huaxian_${userId}_${bookId}_${chapterId}`) || '[]');
        if (currentData.length === 0) return;
        const quChong = currentData.filter((h: HuaXianXinXi, index: number, self: HuaXianXinXi[]) =>
          index === self.findIndex(item => item.cfiRange === h.cfiRange && item.leiXing === h.leiXing)
        );
        quChong.forEach((h: HuaXianXinXi) => {
          if (!h.cfiRange) return;
          const se = YAN_SE_PEI_ZHI[h.yanSe] || YAN_SE_PEI_ZHI.blue;
          const lx = h.leiXing || 'underline';
          const cls = lx === 'marker' ? (MK_CLASS_MAP[h.yanSe] || MK_CLASS_MAP.yellow) : (HL_CLASS_MAP[h.yanSe] || HL_CLASS_MAP.blue);
          const svgStyle = { fill: se, 'fill-opacity': lx === 'marker' ? '0.25' : '0', stroke: se, 'stroke-width': '0', 'stroke-dasharray': 'none' };
          try {
            currentRendition.annotations.add('highlight', h.cfiRange, {}, () => {}, cls, svgStyle);
          } catch (e) { console.warn('annotations.add 失败:', e); }
          try {
            baoGuaSpan(currentRendition, h.cfiRange, cls, h.id);
          } catch (e) {}
        });
      };
      r.on('rendered', applyBiaoJi);
      requestAnimationFrame(() => applyBiaoJi());
      return () => r.off('rendered', applyBiaoJi);
    }
  }, [userId, bookId, chapterId]);

  const handleGenerateQuestion = useCallback(async (selectedText: string, questionType: ChuTiLeiXing) => {
    if (!selectedText.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await aiService.generateFromSelection(chapterId, selectedText, questionType, 1);
      if (error) {
        showError('AI 出题失败：' + error);
        return;
      }
      showSuccess(`已生成 1 道${questionType}题目`);
      onClose();
    } finally {
      setGenerating(false);
    }
  }, [chapterId, onClose]);

  const handleHuaXian = useCallback((selectedText: string, yanSe: HuaXianYanSe = 'blue', beiZhu: string = '') => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    const existingUnderline = huaXianList.find(h => h.cfiRange === cfiRange && h.leiXing === 'underline');
    if (existingUnderline) {
      showError('该文本已有划线，请先删除后再重新操作');
      onClose();
      return;
    }
    const xinXi: HuaXianXinXi = { id: Date.now().toString(), text: selectedText, cfiRange: cfiRange || '', yanSe, leiXing: 'underline', beiZhu, createdAt: Date.now() };
    setHuaXianList(prev => [...prev, xinXi]);
    if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'underline', xinXi.id);
    huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
    showSuccess('已添加划线');
    onClose();
  }, [onClose, yingYongBiaoJi, huaCiJiaoHuRef, huaXianList]);

  const handleMaKeBi = useCallback((selectedText: string, yanSe: HuaXianYanSe = 'yellow', beiZhu: string = '') => {
    const cfiRange = huaCiJiaoHuRef?.getCurrentCfiRange?.() || '';
    const existingMarker = huaXianList.find(h => h.cfiRange === cfiRange && h.leiXing === 'marker');
    if (existingMarker) {
      showError('该文本已有高亮，请先删除后再重新操作');
      onClose();
      return;
    }
    const xinXi: HuaXianXinXi = { id: Date.now().toString(), text: selectedText, cfiRange: cfiRange || '', yanSe, leiXing: 'marker', beiZhu, createdAt: Date.now() };
    setHuaXianList(prev => [...prev, xinXi]);
    if (cfiRange) yingYongBiaoJi(cfiRange, false, yanSe, 'marker', xinXi.id);
    huaCiJiaoHuRef?.setCurrentCfiRange?.(null);
    showSuccess('已添加马克笔');
    onClose();
  }, [onClose, yingYongBiaoJi, huaCiJiaoHuRef, huaXianList]);

  const handleDeleteHuaXian = useCallback((id: string) => {
    const deleted = huaXianList.find(h => h.id === id);
    const rendition = renditionRef?.current;
    if (rendition && deleted?.cfiRange) {
      try {
        rendition.annotations.remove(deleted.cfiRange, 'highlight');
      } catch (error) {
        console.warn('清除标记失败:', error);
      }
      try {
        const contents = rendition.getContents();
        if (contents && contents[0]) {
          const doc = contents[0].window?.document;
          if (doc) {
            const span = doc.querySelector(`[data-huaxian-id="${id}"]`);
            if (span && span.parentNode) {
              const parent = span.parentNode;
              while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
              }
              parent.removeChild(span);
            }
          }
        }
      } catch (error) {
        console.warn('移除 DOM 标记失败:', error);
      }
    }
    setHuaXianList(prev => prev.filter(h => h.id !== id));
    showSuccess('已删除标记');
  }, [huaXianList, renditionRef]);

  const handleChangeYanSe = useCallback((id: string, yanSe: HuaXianYanSe) => {
    const target = huaXianList.find(h => h.id === id);
    if (!target) return;
    const rendition = renditionRef?.current;
    if (rendition && target.cfiRange) {
      const se = YAN_SE_PEI_ZHI[yanSe];
      const cls = target.leiXing === 'marker' ? MK_CLASS_MAP[yanSe] : HL_CLASS_MAP[yanSe];
      const span = rendition.getContents()?.[0]?.window?.document?.querySelector(`[data-huaxian-id="${id}"]`);
      if (span) {
        span.className = cls;
        span.setAttribute('data-biaoji', 'true');
      }
    }
    setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, yanSe } : h));
  }, [huaXianList, renditionRef]);

  const handleChangeLeiXing = useCallback((id: string, leiXing: 'underline' | 'marker') => {
    const target = huaXianList.find(h => h.id === id);
    if (!target) return;
    const rendition = renditionRef?.current;
    if (rendition && target.cfiRange) {
      const se = YAN_SE_PEI_ZHI[target.yanSe];
      const cls = leiXing === 'marker' ? MK_CLASS_MAP[target.yanSe] : HL_CLASS_MAP[target.yanSe];
      const span = rendition.getContents()?.[0]?.window?.document?.querySelector(`[data-huaxian-id="${id}"]`);
      if (span) {
        span.className = cls;
        span.setAttribute('data-biaoji', 'true');
      }
    }
    setHuaXianList(prev => prev.map(h => h.id === id ? { ...h, leiXing } : h));
  }, [huaXianList, renditionRef]);

  const handleCopy = useCallback(async (selectedText: string) => {
    try {
      await navigator.clipboard.writeText(selectedText);
      showSuccess('已复制到剪贴板');
      onClose();
    } catch {
      showError('复制失败');
    }
  }, [onClose]);

  return {
    generating,
    huaXianList,
    handleGenerateQuestion,
    handleHuaXian,
    handleMaKeBi,
    handleDeleteHuaXian,
    handleChangeYanSe,
    handleChangeLeiXing,
    handleCopy,
  };
}