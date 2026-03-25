// @审计已完成
// 意图理解组件 - 流程：看段落→自由讲述→AI评价对错不到位

import { useState } from 'react';
import type { Paragraph } from '@infrastructure/types';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface IntentionEvaluation {
  correct: string;
  incorrect: string;
  incomplete: string;
}

interface YiTuLiJieProps {
  paragraph: Paragraph;
  onComplete: () => void;
  onBack: () => void;
}

export function YiTuLiJie({ paragraph, onComplete, onBack }: YiTuLiJieProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<IntentionEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);
    setError(null);
    const { data, error: apiError } = await aiService.evaluateIntention(paragraph.content, userAnswer);
    if (apiError || !data) {
      setError(apiError || '评价失败');
      showError(apiError || '评价失败');
      setEvaluating(false);
      return;
    }
    setEvaluation(data);
    setEvaluating(false);
    showSuccess('评价完成');
  };

  const handleComplete = () => {
    showSuccess('已完成意图理解练习');
    onComplete();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TouBu onBack={onBack} />
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem' }}>
        <DuanLuoXianShi paragraph={paragraph} />
        {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}><p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p></div>}
        {!evaluation ? (
          <ZiYouJiangShu userAnswer={userAnswer} setUserAnswer={setUserAnswer} loading={evaluating} onSubmit={handleEvaluate} />
        ) : (
          <PingJiaJieGuo evaluation={evaluation} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}

function TouBu({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>意图理解</h1>
      </div>
    </div>
  );
}

function DuanLuoXianShi({ paragraph }: { paragraph: Paragraph }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>原文段落</h2>
      <p style={{ color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{paragraph.content}</p>
    </div>
  );
}

function ZiYouJiangShu({ userAnswer, setUserAnswer, loading, onSubmit }: { userAnswer: string; setUserAnswer: (a: string) => void; loading: boolean; onSubmit: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>作者想告诉我们什么？</h2>
      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>请用自己的话，自由讲述作者想表达的核心思想</p>
      <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="用自己的话讲述作者想告诉我们什么..." disabled={loading} style={{ width: '100%', minHeight: '8rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', backgroundColor: loading ? '#f3f4f6' : '#ffffff' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={onSubmit} disabled={!userAnswer.trim() || loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: !userAnswer.trim() || loading ? '#9ca3af' : '#f59e0b', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !userAnswer.trim() || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? <><JiaZaiZhuangTai chiCun="small" /><span>评价中...</span></> : '提交回答'}
        </button>
      </div>
    </div>
  );
}

function PingJiaJieGuo({ evaluation, onComplete }: { evaluation: IntentionEvaluation; onComplete: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '1rem' }}>AI 评价</h2>

      {evaluation.correct && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#16a34a' }}>✓ 说得对的地方</p>
          <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.375rem' }}>
            <p style={{ color: '#15803d', lineHeight: 1.6 }}>{evaluation.correct}</p>
          </div>
        </div>
      )}

      {evaluation.incorrect && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#dc2626' }}>✗ 说得不对的地方</p>
          <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.375rem' }}>
            <p style={{ color: '#b91c1c', lineHeight: 1.6 }}>{evaluation.incorrect}</p>
          </div>
        </div>
      )}

      {evaluation.incomplete && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#f59e0b' }}>○ 说得不到位的地方</p>
          <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '0.375rem' }}>
            <p style={{ color: '#b45309', lineHeight: 1.6 }}>{evaluation.incomplete}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button onClick={onComplete} style={{ padding: '0.75rem 2rem', backgroundColor: '#f59e0b', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
          完成练习
        </button>
      </div>
    </div>
  );
}
