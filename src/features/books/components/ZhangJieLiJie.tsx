// @审计已完成
// 章节理解组件 - 对当前章节进行AI分析

import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { aiService } from '@shared/services/aiService';
import { paraphraseService } from '@shared/services/paraphraseService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface ZhangJieLiJieProps {
  chapterContent: string;
  bookId: string;
  chapterId?: string;
  onClose: () => void;
}

export function ZhangJieLiJie({ chapterContent, bookId, chapterId, onClose }: ZhangJieLiJieProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; keyPoints: string } | null>(null);
  const [userParaphrase, setUserParaphrase] = useState('');
  const [evaluation, setEvaluation] = useState<{ correct: string; incorrect: string; incomplete: string } | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    huoQuZhangJieLiJie();
    setUserParaphrase('');
    setEvaluation(null);
  }, [chapterContent]);

  const huoQuZhangJieLiJie = async () => {
    if (!chapterContent || chapterContent.trim() === '') {
      showError('章节内容为空');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await aiService.understandChapter(chapterContent);
      if (error) {
        showError('章节理解失败：' + error);
        return;
      }
      if (data) {
        setResult(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChongXin = () => {
    huoQuZhangJieLiJie();
    setUserParaphrase('');
    setEvaluation(null);
  };

  const handleEvaluate = async () => {
    if (!userParaphrase.trim()) return;
    setEvaluating(true);
    try {
      const { data, error } = await aiService.evaluateIntention(result!.summary, userParaphrase);
      if (error) {
        showError('评价失败：' + error);
        return;
      }
      if (data) {
        setEvaluation(data);
        showSuccess('评价完成');
      }
    } finally {
      setEvaluating(false);
    }
  };

  const handleWanCheng = async () => {
    if (!userParaphrase.trim()) {
      showError('请先复述');
      return;
    }
    if (!evaluation) {
      showError('请先提交评价');
      return;
    }
    try {
      const aiEvaluation = `✓ 说得对的地方：\n${evaluation.correct}${evaluation.incorrect ? '\n\n✗ 说得不对的地方：\n' + evaluation.incorrect : ''}${evaluation.incomplete ? '\n\n⚠ 说得不够的地方：\n' + evaluation.incomplete : ''}`;
      await paraphraseService.createParaphrase({
        book_id: bookId,
        chapter_id: chapterId,
        type: 'understanding',
        original_text: chapterContent.substring(0, 2000),
        paraphrased_text: userParaphrase,
        ai_evaluation: aiEvaluation,
      });
      showSuccess('章节理解完成！');
      onClose();
    } catch (e) {
      console.error('保存复述记录失败:', e);
      showError('保存失败');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--zhi-zhen-bei-jing)',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--bian-kuang)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--zhu-yao-wen-zi)' }}>
                章节理解
              </h2>
              <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'var(--ci-yao-wen-zi)' }}>
                AI 为您分析当前章节的内容
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--ci-yao-wen-zi)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <JiaZaiZhuangTai wenAn="正在分析章节内容..." chiCun="medium" anSeZhuTi={true} />
            </div>
          ) : result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 章节总结 */}
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BookOpen size={18} style={{ color: '#3b82f6' }} />
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    color: 'var(--zhu-yao-wen-zi)',
                  }}>
                    章节总结
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  margin: 0,
                  color: 'var(--zhu-yao-wen-zi)',
                }}>
                  {result.summary}
                </p>
              </div>

              {/* 重点提炼 */}
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Lightbulb size={18} style={{ color: '#f59e0b' }} />
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    color: 'var(--zhu-yao-wen-zi)',
                  }}>
                    重点提炼
                  </h3>
                </div>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: 'var(--zhu-yao-wen-zi)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {result.keyPoints}
                </div>
              </div>

              {/* 用户复述 */}
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: 0,
                    color: 'var(--zhu-yao-wen-zi)',
                  }}>
                    考考我
                  </h3>
                </div>
                {!evaluation ? (
                  <>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--ci-yao-wen-zi)',
                      marginBottom: '12px',
                    }}>
                      看完了吗？试着用自己的话复述一下
                    </p>
                    <textarea
                      value={userParaphrase}
                      onChange={(e) => setUserParaphrase(e.target.value)}
                      placeholder="读完这一章，你学到了什么？"
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--bian-kuang)',
                        backgroundColor: 'var(--bei-jing)',
                        color: 'var(--zhu-yao-wen-zi)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={handleEvaluate}
                      disabled={!userParaphrase.trim() || evaluating || loading}
                      style={{
                        marginTop: '12px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: !userParaphrase.trim() || evaluating ? '#9ca3af' : '#8b5cf6',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: !userParaphrase.trim() || evaluating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {evaluating ? 'AI评价中...' : '提交复述'}
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{
                      backgroundColor: 'var(--bei-jing)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'var(--ci-yao-wen-zi)',
                      }}>
                        你的回答
                      </p>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: '1.7',
                        color: 'var(--zhu-yao-wen-zi)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {userParaphrase}
                      </p>
                    </div>
                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        color: 'var(--ci-yao-wen-zi)',
                      }}>
                        AI评价
                      </p>
                      {evaluation.correct && (
                        <div style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                        }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#22c55e', marginBottom: '4px' }}>✓ 说得对的地方</p>
                          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--zhu-yao-wen-zi)' }}>{evaluation.correct}</p>
                        </div>
                      )}
                      {evaluation.incorrect && (
                        <div style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          padding: '12px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                        }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>✗ 说得不对的地方</p>
                          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--zhu-yao-wen-zi)' }}>{evaluation.incorrect}</p>
                        </div>
                      )}
                      {evaluation.incomplete && (
                        <div style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          padding: '12px',
                          borderRadius: '8px',
                        }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>⚠ 说得不够的地方</p>
                          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--zhu-yao-wen-zi)' }}>{evaluation.incomplete}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUserParaphrase('');
                        setEvaluation(null);
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid var(--bian-kuang)',
                        backgroundColor: 'transparent',
                        color: 'var(--zhu-yao-wen-zi)',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      重新复述
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{
          padding: '16px 24px 24px 24px',
          borderTop: '1px solid var(--bian-kuang)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleChongXin}
            style={{
              padding: '10px 20px',
              border: '1px solid var(--bian-kuang)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--zhu-yao-wen-zi)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            disabled={loading}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <RefreshCw size={16} />
            重新生成
          </button>
          <button
            onClick={handleWanCheng}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            disabled={loading}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            <CheckCircle2 size={16} />
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
