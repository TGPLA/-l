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
}

export function ZhangJieHuaXianJiLu({ bookId, chapterId, chapterTitle, darkMode }: ZhangJieHuaXianJiLuProps) {
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>加载中...</div>;
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280', backgroundColor: darkMode ? '#1f2937' : '#f9fafb', borderRadius: '0.5rem' }}>
        <p>暂无划线出题记录</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>在阅读器中划线文字即可出题</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {questions.map(q => (
        <div key={q.id} style={{
          padding: '1rem',
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          borderRadius: '0.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: darkMode ? '#374151' : '#eff6ff',
              color: '#3b82f6',
            }}>
              {q.questionType}
            </span>
            <span style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {q.masteryLevel}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '0.5rem' }}>
            {q.question}
          </p>
          <details style={{ fontSize: '0.8125rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.25rem' }}>查看答案</summary>
            <p style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb', padding: '0.5rem', borderRadius: '0.25rem' }}>
              {q.answer}
            </p>
          </details>
        </div>
      ))}
    </div>
  );
}
