// @审计已完成
// 复述学习组件 - 选中文字 → 复述 → AI 评价

import { useState } from 'react';
import { aiService } from '@shared/services/aiService';
import { paraphraseService } from '@shared/services/paraphraseService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface IntentionResult {
  correct: string;
  incorrect: string;
  incomplete: string;
}

interface FuShuState {
  userAnswer: string;
  conceptEvaluation: string | null;
  intentionEvaluation: IntentionResult | null;
}

interface FuShuXueXiProps {
  bookId: string;
  chapterId?: string;
  paragraphId?: string;
  content: string;
  explanation?: string;
  isConcept?: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export function FuShuXueXi({ bookId, content, explanation, isConcept = false, onComplete, onBack }: FuShuXueXiProps) {
  const [state, setState] = useState<FuShuState>({ 
    userAnswer: '', 
    conceptEvaluation: null,
    intentionEvaluation: null
  });
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!state.userAnswer.trim()) return;
    setEvaluating(true);
    setError(null);
    
    if (isConcept && explanation) {
      const { data, error: apiError } = await aiService.evaluateConcept(content, explanation, state.userAnswer);
      
      if (apiError || !data) {
        setError(apiError || '评价失败');
        showError(apiError || '评价失败');
        setEvaluating(false);
        return;
      }
      setState(prev => ({ ...prev, conceptEvaluation: data.evaluation }));
    } else {
      const { data, error: apiError } = await aiService.evaluateIntention(content, state.userAnswer);
      
      if (apiError || !data) {
        setError(apiError || '评价失败');
        showError(apiError || '评价失败');
        setEvaluating(false);
        return;
      }
      setState(prev => ({ ...prev, intentionEvaluation: data }));
    }
    
    setEvaluating(false);
    showSuccess('评价完成');
  };

  const getAIEvaluationText = () => {
    if (state.conceptEvaluation) {
      return state.conceptEvaluation;
    }
    if (state.intentionEvaluation) {
      let text = '';
      if (state.intentionEvaluation.correct) {
        text += `✓ 说得对的地方：\n${state.intentionEvaluation.correct}\n\n`;
      }
      if (state.intentionEvaluation.incorrect) {
        text += `✗ 说得不对的地方：\n${state.intentionEvaluation.incorrect}\n\n`;
      }
      if (state.intentionEvaluation.incomplete) {
        text += `⚠ 说得不够的地方：\n${state.intentionEvaluation.incomplete}`;
      }
      return text.trim();
    }
    return '';
  };

  const handleSaveAndComplete = async () => {
    if (!state.userAnswer.trim()) return;
    
    setSaving(true);
    try {
      // 确定类型
      const type = isConcept ? 'concept' : 'understanding';
      const conceptName = isConcept ? content : undefined;
      
      // 获取 AI 评价文本
      const aiEvaluation = getAIEvaluationText();
      
      // 保存复述记录
      await paraphraseService.createParaphrase({
        book_id: bookId,
        chapter_id: undefined,
        type,
        concept_name: conceptName,
        original_text: content,
        paraphrased_text: state.userAnswer,
        ai_evaluation: aiEvaluation,
      });
      
      showSuccess('保存成功！');
      onComplete();
    } catch (e) {
      console.error('保存复述记录失败:', e);
      showError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '32rem', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回阅读
          </button>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ color: '#374151', lineHeight: 1.6, fontSize: '0.9375rem' }}>{content}</p>
        </div>
        {evaluating ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '2rem' }}>
            <JiaZaiZhuangTai wenAn="AI 正在评价中..." chiCun="medium" />
          </div>
        ) : !state.conceptEvaluation && !state.intentionEvaluation ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>用自己的话复述</p>
            <textarea
              value={state.userAnswer}
              onChange={(e) => setState(prev => ({ ...prev, userAnswer: e.target.value }))}
              placeholder="读完之后，用你自己的话怎么说？"
              disabled={evaluating}
              style={{ width: '100%', minHeight: '8rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.9375rem', resize: 'vertical', backgroundColor: evaluating ? '#f3f4f6' : '#ffffff', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
            {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.75rem' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={handleEvaluate} disabled={!state.userAnswer.trim() || evaluating} style={{ padding: '0.75rem 2rem', backgroundColor: !state.userAnswer.trim() || evaluating ? '#9ca3af' : '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !state.userAnswer.trim() || evaluating ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9375rem' }}>
                提交复述
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>你的回答</p>
            <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ color: '#374151', lineHeight: 1.6 }}>{state.userAnswer}</p>
            </div>
            
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>AI 点评</p>
            
            {state.conceptEvaluation ? (
              // 概念评价结果
              <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem' }}>
                <p style={{ color: '#7c3aed', lineHeight: 1.6 }}>{state.conceptEvaluation}</p>
              </div>
            ) : state.intentionEvaluation ? (
              // 意图理解评价结果
              <div>
                <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                  <p style={{ color: '#166534', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>✓ 说得对的地方</p>
                  <p style={{ color: '#166534', lineHeight: 1.6 }}>{state.intentionEvaluation.correct}</p>
                </div>
                
                {state.intentionEvaluation.incorrect && (
                  <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                    <p style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>✗ 说得不对的地方</p>
                    <p style={{ color: '#991b1b', lineHeight: 1.6 }}>{state.intentionEvaluation.incorrect}</p>
                  </div>
                )}
                
                {state.intentionEvaluation.incomplete && (
                  <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#92400e', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>⚠ 说得不够的地方</p>
                    <p style={{ color: '#92400e', lineHeight: 1.6 }}>{state.intentionEvaluation.incomplete}</p>
                  </div>
                )}
              </div>
            ) : null}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button 
                onClick={() => setState({ 
                  userAnswer: '', 
                  conceptEvaluation: null, 
                  intentionEvaluation: null 
                })} 
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500 }}
              >
                再次练习
              </button>
              <button 
                onClick={handleSaveAndComplete} 
                disabled={saving}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: saving ? '#9ca3af' : '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {saving ? '保存中...' : '完成学习'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
