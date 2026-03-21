// @审计已完成
// 题目列表组件 - 展示段落下的所有题目
import type { Question } from '@infrastructure/types';

interface TiMuLieBiaoProps {
  questions: Question[];
  onSelect: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

export function TiMuLieBiao({ questions, onSelect, onDelete }: TiMuLieBiaoProps) {
  if (questions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <p style={{ color: '#6b7280' }}>暂无题目</p>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    '名词解释': '#dbeafe',
    '意图理解': '#fef3c7',
    '生活应用': '#d1fae5',
  };

  const typeTextColors: Record<string, string> = {
    '名词解释': '#2563eb',
    '意图理解': '#d97706',
    '生活应用': '#059669',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {questions.map((q, index) => (
        <div
          key={q.id}
          style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onClick={() => onSelect(q)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>
              第 {index + 1} 题
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: typeColors[q.questionType] || '#f3f4f6',
                  color: typeTextColors[q.questionType] || '#374151',
                  borderRadius: '0.25rem',
                }}
              >
                {q.questionType}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(q.id);
                }}
                style={{
                  padding: '0.25rem',
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>
            {q.question}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            答案：{q.answer.substring(0, 50)}...
          </p>
        </div>
      ))}
    </div>
  );
}
