// @审计已完成
// 练习界面 - 简洁的练习体验，管理功能藏起来

import { useState } from 'react';
import { getResponsiveValue } from '@shared/utils/responsive';
import type { Book, Question } from '@infrastructure/types';

interface LianXiMianBanProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  questions: Question[];
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string, questionText: string, skipConfirm?: boolean) => void;
  onBatchDelete?: (questionIds: string[]) => void;
}

export function LianXiMianBan({ 
  isOpen, 
  onClose, 
  book, 
  questions, 
  onUpdate, 
  onDelete,
  onBatchDelete
}: LianXiMianBanProps) {
  const [isGuanLiMoShi, setIsGuanLiMoShi] = useState(false);
  const [xuanZhongTiMuIds, setXuanZhongTiMuIds] = useState<Set<string>>(new Set());

  const shanChuTiMu = (questionId: string, questionText: string) => {
    onDelete(questionId, questionText);
  };

  const piLiangShanChu = () => {
    if (xuanZhongTiMuIds.size === 0) return;
    
    if (onBatchDelete) {
      onBatchDelete(Array.from(xuanZhongTiMuIds));
    } else {
      xuanZhongTiMuIds.forEach(id => {
        const tiMu = questions.find(q => q.id === id);
        if (tiMu) {
          onDelete(id, tiMu.question, true);
        }
      });
    }
    setXuanZhongTiMuIds(new Set());
    setIsGuanLiMoShi(false);
  };

  const qieHuanXuanZhong = (questionId: string) => {
    setXuanZhongTiMuIds(prev => {
      const xinSet = new Set(prev);
      if (xinSet.has(questionId)) {
        xinSet.delete(questionId);
      } else {
        xinSet.add(questionId);
      }
      return xinSet;
    });
  };

  const qieHuanQuanXuan = () => {
    if (xuanZhongTiMuIds.size === questions.length) {
      setXuanZhongTiMuIds(new Set());
    } else {
      setXuanZhongTiMuIds(new Set(questions.map(q => q.id)));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: getResponsiveValue({ mobile: '1rem', tablet: '2rem' }),
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ 
          padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 700, color: '#111827', margin: 0 }}>
              练习
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              《{book.title}》 · {questions.length} 道题目
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (isGuanLiMoShi) {
                  setIsGuanLiMoShi(false);
                  setXuanZhongTiMuIds(new Set());
                } else {
                  setIsGuanLiMoShi(true);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isGuanLiMoShi ? '#f3f4f6' : 'transparent',
                color: isGuanLiMoShi ? '#374151' : '#6b7280',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
              }}
            >
              {isGuanLiMoShi ? '完成管理' : '管理'}
            </button>
            <button
              onClick={onClose}
              style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {isGuanLiMoShi && (
          <div style={{ 
            padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={qieHuanQuanXuan}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {xuanZhongTiMuIds.size === questions.length ? '取消全选' : '全选'}
              </button>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                已选择 {xuanZhongTiMuIds.size} 项
              </span>
            </div>
            <button
              onClick={piLiangShanChu}
              disabled={xuanZhongTiMuIds.size === 0}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: xuanZhongTiMuIds.size === 0 ? '#fca5a5' : '#ef4444',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: xuanZhongTiMuIds.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
              }}
            >
              删除选中 ({xuanZhongTiMuIds.size})
            </button>
          </div>
        )}

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }),
          backgroundColor: '#f9fafb',
        }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>
                还没有题目
              </h3>
              <p style={{ color: '#6b7280', margin: '0' }}>
                在阅读时选择文字，点击「AI 出题」来生成题目
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {questions.map(tiMu => (
                <TiMuKaPian
                  key={tiMu.id}
                  tiMu={tiMu}
                  isGuanLiMoShi={isGuanLiMoShi}
                  isXuanZhong={xuanZhongTiMuIds.has(tiMu.id)}
                  onQieHuanXuanZhong={() => qieHuanXuanZhong(tiMu.id)}
                  onUpdate={(gengXin) => onUpdate(tiMu.id, gengXin)}
                  onDelete={() => shanChuTiMu(tiMu.id, tiMu.question)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TiMuKaPian({ 
  tiMu, 
  isGuanLiMoShi, 
  isXuanZhong, 
  onQieHuanXuanZhong, 
  onUpdate, 
  onDelete 
}: { 
  tiMu: Question;
  isGuanLiMoShi: boolean;
  isXuanZhong: boolean;
  onQieHuanXuanZhong: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const [zhanKai, setZhanKai] = useState(false);
  const [xianShiCaiDan, setXianShiCaiDan] = useState(false);

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '0.5rem', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div 
        style={{ 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '0.75rem',
          cursor: isGuanLiMoShi ? 'pointer' : 'default',
        }}
        onClick={isGuanLiMoShi ? onQieHuanXuanZhong : () => setZhanKai(!zhanKai)}
      >
        {isGuanLiMoShi && (
          <div style={{ 
            width: '1.25rem', 
            height: '1.25rem', 
            borderRadius: '0.25rem', 
            border: '2px solid', 
            borderColor: isXuanZhong ? '#3b82f6' : '#d1d5db',
            backgroundColor: isXuanZhong ? '#3b82f6' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '0.125rem',
          }}>
            {isXuanZhong && (
              <svg style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <p style={{ 
              fontSize: '0.9375rem', 
              fontWeight: 500, 
              color: '#111827', 
              margin: 0,
              lineHeight: 1.5,
            }}>
              {tiMu.question}
            </p>
          </div>
          
          {tiMu.annotation && (
            <div style={{ 
              marginBottom: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '0.5rem',
              border: '1px solid #bae6fd'
            }}>
              <p style={{ 
                fontSize: '0.75rem', 
                fontWeight: 500, 
                color: '#0369a1', 
                margin: '0 0 0.25rem 0' 
              }}>
                📍 划线原文
              </p>
              <p style={{ 
                fontSize: '0.8125rem', 
                color: '#0c4a6e', 
                margin: 0,
                lineHeight: 1.6,
              }}>
                {tiMu.annotation.text}
              </p>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '9999px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              flexShrink: 0,
            }}>
              {tiMu.questionType}
            </span>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '9999px',
              backgroundColor: tiMu.masteryLevel === '已掌握' ? '#dcfce7' : tiMu.masteryLevel === '学习中' ? '#fefce8' : '#fee2e2',
              color: tiMu.masteryLevel === '已掌握' ? '#16a34a' : tiMu.masteryLevel === '学习中' ? '#ca8a04' : '#dc2626',
              flexShrink: 0,
            }}>
              {tiMu.masteryLevel}
            </span>
            {tiMu.knowledgePoint && (
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                flexShrink: 0,
              }}>
                📚 {tiMu.knowledgePoint}
              </span>
            )}
          </div>
        </div>
        
        {!isGuanLiMoShi && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setXianShiCaiDan(!xianShiCaiDan);
              }}
              style={{
                padding: '0.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                borderRadius: '0.25rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {xianShiCaiDan && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 1 }} 
                  onClick={() => setXianShiCaiDan(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.25rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '0.25rem',
                  minWidth: '120px',
                  zIndex: 2,
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setXianShiCaiDan(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    删除题目
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {!isGuanLiMoShi && !xianShiCaiDan && (
          <svg 
            style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: '#9ca3af', 
              transform: zhanKai ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              flexShrink: 0,
              marginTop: '0.125rem',
            }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      
      {zhanKai && !isGuanLiMoShi && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>答案</p>
            <p style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{tiMu.answer}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>掌握程度：</span>
              <select
                value={tiMu.masteryLevel}
                onChange={(e) => onUpdate({ masteryLevel: e.target.value as Question['masteryLevel'] })}
                style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#ffffff' }}
              >
                <option value="未掌握">未掌握</option>
                <option value="学习中">学习中</option>
                <option value="已掌握">已掌握</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
