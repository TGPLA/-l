// @审计已完成
// 划线交互 Hook - 管理文本选择状态和虚线显示

import { useState } from 'react';

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

  const handleCancel = () => {
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  };

  return {
    selectedText,
    showMenu,
    selectionRect,
    setSelectedText,
    setShowMenu,
    setSelectionRect,
    handleCancel,
  };
}
