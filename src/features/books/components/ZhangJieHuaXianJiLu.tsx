// @审计已完成
// 章节划线记录组件 - 查看章节的划线内容和相关题目

import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@infrastructure/types';
import { questionService } from '@shared/services/questionService';

interface ZhangJieHuaXianJiLuProps {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  darkMode: boolean;
  onGuanBi: () => void;
}

const CHU_TI_YANG_SHI: React.CSSProperties = {
  width: '360px', height: '100%', backgroundColor: '#252525', borderLeft: '1px solid #333',
  display: 'flex', flexDirection: 'column', position: 'fixed', right: 0, top: 0, zIndex: 10000,
  animation: 'slideInRight 0.25s ease-out',
};

export function ZhangJieHuaXianJiLu({ bookId, chapterId, chapterTitle, darkMode, onGuanBi }: ZhangJieHuaXianJiLuProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const { questions: loaded } = await questionService.getQuestionsByChapter(chapterId);
    setQuestions(loaded);
    setLoading(false);
  }, [chapterId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return (
    <div style={CHU_TI_YANG_SHI}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
          划线出题记录 ({questions.length})
        </h3>
        <button onClick={onGuanBi} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.25rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>加载中...</div>
        ) : questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: '#2d2d2d', borderRadius: '0.5rem' }}>
            <p>暂无划线出题记录</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>在阅读器中划线文字即可出题</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions.map(q => (
              <div key={q.id} style={{
                padding: '1rem', backgroundColor: '#2d2d2d', borderRadius: '8px', border: '1px solid transparent',
                cursor: 'pointer', transition: 'border-color 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3f3f46'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#374151', color: '#3b82f6' }}>
                    {q.questionType}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{q.masteryLevel}</span>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>{q.question}</p>
                <details style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '0.25rem' }}>查看答案</summary>
                  <p style={{ backgroundColor: '#1f1f1f', padding: '0.5rem', borderRadius: '0.25rem' }}>{q.answer}</p>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
