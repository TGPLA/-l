// @审计已完成
// AI 评价组件 - 显示评价结果和导航

import type { ConceptEvaluation } from '@infrastructure/types';

interface AIPingJiaProps {
  evaluation: ConceptEvaluation;
  questionType: string;
  referenceAnswer: string;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function AIPingJia({ evaluation, referenceAnswer, onNext, onPrev, isFirst, isLast }: AIPingJiaProps) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#8b5cf6' }}>AI 评价：</p>
        <p style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.evaluation}</p>
      </div>
      {evaluation.supplement && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#16a34a' }}>补充说明：</p><p style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.supplement}</p></div>}
      {evaluation.translation && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#f59e0b' }}>翻译：</p><p style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.translation}</p></div>}
      {evaluation.scenario && <div style={{ marginBottom: '1rem' }}><p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#f97316' }}>场景应用：</p><p style={{ backgroundColor: '#ffedd5', padding: '0.75rem', borderRadius: '0.375rem' }}>{evaluation.scenario}</p></div>}
      {evaluation.vocabularyCards && evaluation.vocabularyCards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#6366f1' }}>词汇卡片：</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {evaluation.vocabularyCards.map((card, i) => (
              <div key={i} style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '0.375rem' }}>
                <p style={{ fontWeight: 500 }}>{card.term}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{card.definition}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>例句：{card.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>参考答案</p>
        <p style={{ color: '#374151' }}>{referenceAnswer}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button onClick={onPrev} disabled={isFirst} style={{ padding: '0.5rem 1rem', backgroundColor: isFirst ? '#e5e7eb' : '#3b82f6', color: isFirst ? '#9ca3af' : '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer' }}>上一题</button>
        <button onClick={onNext} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>{isLast ? '完成' : '下一题'}</button>
      </div>
    </div>
  );
}
