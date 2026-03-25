// @审计已完成
// 划词创建段落相关逻辑

import { useState, useEffect, useCallback, useRef } from 'react';
import { paragraphService } from '@shared/services/paragraphService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import type { Paragraph } from '@infrastructure/types';

export function useHuaCiChuangJian(chapterId: string, onParagraphCreated: (paragraph: Paragraph) => void) {
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionBar, setShowSelectionBar] = useState(false);
  const [creating, setCreating] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const targetRef = useRef<HTMLElement | null>(null);

  const setTargetElement = useCallback((element: HTMLElement | null) => {
    targetRef.current = element;
  }, []);

  useEffect(() => {
    if (!enabled) {
      setShowSelectionBar(false);
      setSelectedText('');
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        setShowSelectionBar(false);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();

      if (targetRef.current && targetRef.current.contains(selection.anchorNode as Node)) {
        setSelectedText(text);
        setShowSelectionBar(true);
      } else {
        setShowSelectionBar(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enabled]);

  const handleCreateParagraph = useCallback(async () => {
    if (!selectedText.trim()) return;

    setCreating(true);
    try {
      const { paragraph, error: createError } = await paragraphService.createParagraph({
        chapterId,
        content: selectedText.trim(),
      });

      if (createError || !paragraph) {
        showError(createError?.message || '创建段落失败');
        return;
      }

      showSuccess('段落创建成功');
      onParagraphCreated(paragraph);
      setSelectedText('');
      setShowSelectionBar(false);
      window.getSelection()?.removeAllRanges();
    } finally {
      setCreating(false);
    }
  }, [selectedText, chapterId, onParagraphCreated]);

  return {
    selectedText,
    showSelectionBar,
    creating,
    enabled,
    setEnabled,
    setTargetElement,
    setShowSelectionBar,
    setSelectedText,
    handleCreateParagraph,
  };
}
