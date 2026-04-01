// @审计已完成
// 划线出题 Hook - AI出题、高亮标记、复制文字

import { useState, useCallback } from 'react';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export function useHuaXianChuTi(chapterId: string, onClose: () => void) {
  const [generating, setGenerating] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);

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

  const handleHighlight = useCallback((selectedText: string) => {
    setHighlights(prev => [...prev, selectedText]);
    showSuccess('已添加高亮标记');
    onClose();
  }, [onClose]);

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
    highlights,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  };
}
