// @审计已完成
// 划线交互 Hook - 管理文本选择状态和虚线显示

import { useState, useEffect, useCallback } from 'react';

export interface HuaXianZhuangTai {
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  enabled: boolean;
}

export function useHuaCiJiaoHu(enabled: boolean) {
  const [selectedText, setSelectedText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) {
      setShowMenu(false);
      setSelectedText('');
      setSelectionRect(null);
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        setShowMenu(false);
        setSelectedText('');
        setSelectionRect(null);
        return;
      }

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0) {
        setSelectedText(text);
        setSelectionRect(rect);
        setShowMenu(true);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enabled]);

  const handleCancel = useCallback(() => {
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    selectedText,
    showMenu,
    selectionRect,
    setSelectedText,
    setShowMenu,
    handleCancel,
  };
}
