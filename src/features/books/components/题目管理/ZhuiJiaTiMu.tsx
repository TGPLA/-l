// @审计已完成
// 追加题目组件 - 同段落同题型追加题目
import { useState } from 'react';
import type { QuestionType } from '@infrastructure/types';
import { aiService } from '@shared/services/aiService';

interface ZhuiJiaTiMuProps {
  paragraphId: string;
  questionType: QuestionType;
  onClose: () => void;
  onSuccess: () => void;
}

export function ZhuiJiaTiMu({ paragraphId, questionType, onClose, onSuccess }: ZhuiJiaTiMuProps) {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const { error } = await aiService.generateQuestionsForParagraph(paragraphId, questionType, count);
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    onSuccess();
    onClose();
  };

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
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '24rem',
        width: '100%',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
          追加题目
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
            题型
          </label>
          <input
            type="text"
            value={questionType}
            disabled
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: '#f9fafb',
              color: '#6b7280',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            将使用与之前相同的题型生成新题目
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
            生成数量
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              style={{
                width: '2rem',
                height: '2rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <span style={{ width: '2rem', textAlign: 'center', fontWeight: 500 }}>{count}</span>
            <button
              onClick={() => setCount(Math.min(5, count + 1))}
              style={{
                width: '2rem',
                height: '2rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </div>
      </div>
    </div>
  );
}
