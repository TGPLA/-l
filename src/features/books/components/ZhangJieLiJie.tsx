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
  const [result, setResult] = useState<{ summary: string; keyPoints: string; paraphrase: string } | null>(null);

  useEffect(() => {
    huoQuZhangJieLiJie();
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
  };

  const handleWanCheng = async () => {
    if (result?.paraphrase) {
      try {
        await paraphraseService.createParaphrase({
          book_id: bookId,
          chapter_id: chapterId,
          type: 'understanding',
          original_text: chapterContent.substring(0, 2000),
          paraphrased_text: result.paraphrase,
        });
      } catch (e) {
        console.error('保存复述记录失败:', e);
      }
    }
    showSuccess('章节理解完成！');
    onClose();
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

              {/* 用自己话描述 */}
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
                    用自己话描述
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  margin: 0,
                  color: 'var(--zhu-yao-wen-zi)',
                }}>
                  {result.paraphrase}
                </p>
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
