// @审计已完成
// 选中状态管理 Hook - 集中管理选中文本、菜单显示、位置坐标

import { useState, useCallback, useRef } from 'react';

export interface XuanZhongZhuangTai {
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  currentCfiRange: string | null;
}

interface UseXuanZhongZhuangTaiProps {
  delayMs?: number;
  minTextLength?: number;
}

export function useXuanZhongZhuangTai({ delayMs = 100, minTextLength = 2 }: UseXuanZhongZhuangTaiProps = {}) {
  const [selectedText, setSelectedText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [currentCfiRange, setCurrentCfiRange] = useState<string | null>(null);
  
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfiRangeRef = useRef<string | null>(null);

  const clearSelection = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    setCurrentCfiRange(null);
    cfiRangeRef.current = null;
  }, []);

  const submitSelection = useCallback((text: string, cfiRange: string, rect: DOMRect) => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    if (text.length < minTextLength) {
      clearSelection();
      return;
    }
    cfiRangeRef.current = cfiRange;
    setSelectedText(text);
    setCurrentCfiRange(cfiRange);
    setSelectionRect(rect);
    delayTimerRef.current = setTimeout(() => {
      setShowMenu(true);
      delayTimerRef.current = null;
    }, delayMs);
  }, [minTextLength, delayMs, clearSelection]);

  const calculateMenuPosition = useCallback((rect: DOMRect) => {
    const position = {
      top: rect.top,
      left: rect.left + rect.width / 2,
    };
    const popupHeight = 200;
    if (position.top < popupHeight) {
      position.top = rect.bottom + 8;
    }
    if (position.left < 100) position.left = 100;
    if (position.left > window.innerWidth - 100) position.left = window.innerWidth - 100;
    return position;
  }, []);

  const getCurrentCfiRange = useCallback(() => cfiRangeRef.current, []);

  return {
    selectedText, setSelectedText,
    showMenu, setShowMenu,
    selectionRect, setSelectionRect,
    currentCfiRange, setCurrentCfiRange,
    clearSelection,
    submitSelection,
    calculateMenuPosition,
    getCurrentCfiRange,
  };
}