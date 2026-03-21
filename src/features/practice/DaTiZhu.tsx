// @审计已完成
// 答题主组件 - 显示段落+问题+作答

import { useState } from 'react';
import type { Paragraph, Question, ConceptEvaluation } from '@infrastructure/types';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface DaTiZhuProps {
  paragraph: Paragraph;
  questions: Question[];
  onComplete: () => void;
}

export function DaTiZhu({ paragraph, questions, onComplete }: DaTiZhuProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<ConceptEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await aiService.evaluateAnswer(currentQuestion.id, userAnswer);
      if (apiError || !data) {
        setError(apiError || 'AI 评价失败');
        showError(apiError || 'AI 评价失败');
        return;
      }
      setEvaluation(data);
      setShowEvaluation(true);
      showSuccess('答案提交成功');
      await aiService.recordPractice(currentQuestion.id, userAnswer, JSON.stringify(data));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '提交失败';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowEvaluation(false);
      setEvaluation(null);
      setError(null);
    } else {
      showSuccess('恭喜完成所有题目！');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setShowEvaluation(false);
      setEvaluation(null);
      setError(null);
    }
  };

  if (!currentQuestion) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>暂无题目</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <DaTiTouBu currentIndex={currentIndex} totalQuestions={questions.length} />
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem' }}>
        <DuanLuoXianShi paragraph={paragraph} />
        <WenTiXianShi question={currentQuestion} />
        {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}><p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p></div>}
        {!showEvaluation ? (
          <DaAnShuRu userAnswer={userAnswer} setUserAnswer={setUserAnswer} loading={loading} onSubmit={handleSubmit} />
        ) : (
          <PingJiaJieGuo evaluation={evaluation!} referenceAnswer={currentQuestion.answer} onNext={handleNext} onPrev={handlePrev} isFirst={currentIndex === 0} isLast={currentIndex === questions.length - 1} />
        )}
      </div>
    </div>
  );
}

function DaTiTouBu({ currentIndex, totalQuestions }: { currentIndex: number; totalQuestions: number }) {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>答题练习</h1>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{currentIndex + 1} / {totalQuestions}</span>
        </div>
        <div style={{ marginTop: '0.5rem', height: '0.25rem', backgroundColor: '#e5e7eb', borderRadius: '0.125rem' }}>
          <div style={{ height: '100%', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, backgroundColor: '#3b82f6', borderRadius: '0.125rem', transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}

function DuanLuoXianShi({ paragraph }: { paragraph: Paragraph }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>段落内容</h2>
      <p style={{ color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{paragraph.content}</p>
    </div>
  );
}

function WenTiXianShi({ question }: { question: Question }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>问题</h2>
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '0.25rem' }}>{question.questionType}</span>
      </div>
      <p style={{ fontSize: '1.125rem', color: '#111827', fontWeight: 500 }}>{question.question}</p>
    </div>
  );
}

function DaAnShuRu({ userAnswer, setUserAnswer, loading, onSubmit }: { userAnswer: string; setUserAnswer: (a: string) => void; loading: boolean; onSubmit: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.75rem' }}>你的回答</h2>
      <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="请用自己的话描述你的理解..." disabled={loading} style={{ width: '100%', minHeight: '8rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', backgroundColor: loading ? '#f3f4f6' : '#ffffff' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={onSubmit} disabled={!userAnswer.trim() || loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: !userAnswer.trim() || loading ? '#9ca3af' : '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !userAnswer.trim() || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? <><JiaZaiZhuangTai chiCun="small" /><span>评价中...</span></> : '提交答案'}
        </button>
      </div>
    </div>
  );
}

function PingJiaJieGuo({ evaluation, referenceAnswer, onNext, onPrev, isFirst, isLast }: { evaluation: ConceptEvaluation; referenceAnswer: string; onNext: () => void; onPrev: () => void; isFirst: boolean; isLast: boolean }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#8b5cf6' }}>AI 评价：</p><p style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.evaluation}</p></div>
      {evaluation.supplement && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#16a34a' }}>补充说明：</p><p style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.supplement}</p></div>}
      {evaluation.translation && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#f59e0b' }}>翻译：</p><p style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.translation}</p></div>}
      {evaluation.scenario && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#f97316' }}>场景应用：</p><p style={{ backgroundColor: '#ffedd5', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.scenario}</p></div>}
      {evaluation.vocabularyCards && evaluation.vocabularyCards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#6366f1' }}>词汇卡片：</p><div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{evaluation.vocabularyCards.map((card, i) => (<div key={i} style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '0.375rem' }}><p style={{ fontWeight: 500 }}>{card.term}</p><p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{card.definition}</p><p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>例句：{card.context}</p></div>))}</div></div>
      )}
      <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}><p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>参考答案</p><p style={{ color: '#374151' }}>{referenceAnswer}</p></div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}><button onClick={onPrev} disabled={isFirst} style={{ padding: '0.5rem 1rem', backgroundColor: isFirst ? '#e5e7eb' : '#3b82f6', color: isFirst ? '#9ca3af' : '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer' }}>上一题</button><button onClick={onNext} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>{isLast ? '完成' : '下一题'}</button></div>
    </div>
  );
}
