// @审计已完成
// 首次引导组件 - 选择页面
import { useState } from 'react';
import type { QuestionTypeEnum, PromptTemplate } from '@infrastructure/types';
import { TiShiCiMoBan } from './TiShiCiMoBan';

interface YinDaoXuanZeProps {
  questionType: QuestionTypeEnum;
  onBack: () => void;
  onComplete: (template: PromptTemplate | null) => void;
}

export function YinDaoXuanZe({ questionType, onBack, onComplete }: YinDaoXuanZeProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

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
        maxWidth: '36rem',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>选择提示词模板</h2>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <TiShiCiMoBan
            questionType={questionType}
            onSelect={setSelectedTemplate}
            onCreateCustom={() => {
              if (selectedTemplate) {
                onComplete(selectedTemplate);
              }
            }}
          />
        </div>

        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#ffffff', color: '#6b7280', cursor: 'pointer' }}>
            返回
          </button>
          <button
            onClick={() => onComplete(selectedTemplate)}
            disabled={!selectedTemplate}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !selectedTemplate ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: !selectedTemplate ? 'not-allowed' : 'pointer',
            }}
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
}
