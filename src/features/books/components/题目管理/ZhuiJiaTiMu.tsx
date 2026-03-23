// @审计已完成
// 追加题目组件 - 批量追加题目
import { useState, useEffect } from 'react';
import type { Question } from '@infrastructure/types';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

interface ZhuiJiaTiMuProps {
  visible: boolean;
  questions: Question[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ZhuiJiaItem {
  questionId: string;
  paragraphId: string;
  questionType: string;
  count: number;
  selected: boolean;
}

export function ZhuiJiaTiMu({ visible, questions, onClose, onSuccess }: ZhuiJiaTiMuProps) {
  const [items, setItems] = useState<ZhuiJiaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      initItems();
    }
  }, [visible, questions]);

  const initItems = () => {
    const newItems: ZhuiJiaItem[] = questions
      .filter(q => q.paragraphId)
      .map(q => ({
        questionId: q.id,
        paragraphId: q.paragraphId!,
        questionType: q.questionType,
        count: 1,
        selected: false,
      }));
    setItems(newItems);
  };

  const handleToggleSelect = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleCountChange = (index: number, delta: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, count: Math.max(1, Math.min(5, item.count + delta)) } : item
    ));
  };

  const handleGenerate = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      showError('请至少选择一道题目');
      return;
    }

    setLoading(true);
    try {
      for (const item of selectedItems) {
        const { error } = await aiService.generateQuestionsForParagraph(
          item.paragraphId,
          item.questionType,
          item.count
        );
        if (error) {
          showError(error.message);
          return;
        }
      }
      showSuccess('追加题目成功');
      onSuccess();
      onClose();
    } catch (error) {
      showError('追加题目失败');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }} onClick={() => onClose()}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '32rem',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
            批量追加题目
          </h3>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              暂无可追加的题目
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, index) => {
                const question = questions.find(q => q.id === item.questionId);
                return (
                  <div
                    key={item.questionId}
                    style={{
                      padding: '1rem',
                      backgroundColor: item.selected ? '#eff6ff' : '#f9fafb',
                      border: item.selected ? '2px solid #3b82f6' : '2px solid transparent',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleSelect(index)}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827', flex: 1 }}>
                        第 {index + 1} 题
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '0.25rem',
                        color: '#374151',
                      }}>
                        {item.questionType}
                      </span>
                    </div>
                    {question && (
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginLeft: '2rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {question.question}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '2rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>追加数量：</span>
                      <button
                        onClick={() => handleCountChange(index, -1)}
                        style={{
                          width: '1.75rem',
                          height: '1.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        -
                      </button>
                      <span style={{ width: '2rem', textAlign: 'center', fontWeight: 500, fontSize: '0.875rem' }}>
                        {item.count}
                      </span>
                      <button
                        onClick={() => handleCountChange(index, 1)}
                        style={{
                          width: '1.75rem',
                          height: '1.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || items.filter(i => i.selected).length === 0}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: (loading || items.filter(i => i.selected).length === 0) ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: (loading || items.filter(i => i.selected).length === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '生成中...' : '确认追加'}
          </button>
        </div>
      </div>
    </div>
  );
}
