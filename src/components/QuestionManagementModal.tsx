import { useState } from 'react';
import { getResponsiveValue } from '../utils/responsive';
import type { Book, Question } from '../types';

interface QuestionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  questions: Question[];
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string, questionText: string) => void;
  onAddQuestion: () => void;
  onAIGenerate: () => void;
}

export function QuestionManagementModal({ 
  isOpen, 
  onClose, 
  book, 
  questions, 
  onUpdate, 
  onDelete,
  onAddQuestion,
  onAIGenerate 
}: QuestionManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'standard' | 'concept'>('standard');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  const standardQuestions = questions.filter(q => q.category === 'standard');
  const conceptQuestions = questions.filter(q => q.category === 'concept');
  const currentQuestions = activeTab === 'standard' ? standardQuestions : conceptQuestions;

  const handleDeleteQuestion = (questionId: string, questionText: string) => {
    const confirmed = confirm(`确定要删除这个问题吗？\n"${questionText.substring(0, 50)}..."`);
    if (confirmed) {
      onDelete(questionId, questionText);
    }
  };

  const handleBatchDelete = () => {
    if (selectedQuestionIds.size === 0) return;
    
    const confirmed = confirm(`确定要删除选中的 ${selectedQuestionIds.size} 个题目吗？`);
    if (confirmed) {
      selectedQuestionIds.forEach(id => {
        const question = questions.find(q => q.id === id);
        if (question) {
          onDelete(id, question.question);
        }
      });
      setSelectedQuestionIds(new Set());
      setIsBatchMode(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.size === currentQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(currentQuestions.map(q => q.id)));
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
        maxWidth: '72rem',
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
              题目管理
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              管理《{book.title}》的所有题目
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ 
          padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }),
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setActiveTab('standard')}
            style={{
              paddingBottom: '0.5rem',
              fontWeight: 500,
              color: activeTab === 'standard' ? '#3b82f6' : '#6b7280',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === 'standard' ? '2px solid #3b82f6' : 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            标准刷题 ({standardQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('concept')}
            style={{
              paddingBottom: '0.5rem',
              fontWeight: 500,
              color: activeTab === 'concept' ? '#8b5cf6' : '#6b7280',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === 'concept' ? '2px solid #8b5cf6' : 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            概念考察 ({conceptQuestions.length})
          </button>
        </div>

        <div style={{ 
          padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onAddQuestion}
              style={{
                padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                backgroundColor: '#22c55e',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
              }}
            >
              <svg style={{ width: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }), height: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                手动添加
              </button>
              <button
                onClick={onAIGenerate}
                style={{
                  padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                }}
              >
                <svg style={{ width: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }), height: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 生成
              </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isBatchMode && (
              <>
                <button
                  onClick={toggleSelectAll}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {selectedQuestionIds.size === currentQuestions.length ? '取消全选' : '全选'}
                </button>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  已选择 {selectedQuestionIds.size} 项
                </span>
              </>
            )}
            <button
              onClick={() => {
                if (isBatchMode) {
                  setIsBatchMode(false);
                  setSelectedQuestionIds(new Set());
                } else {
                  setIsBatchMode(true);
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isBatchMode ? '#f3f4f6' : '#3b82f6',
                color: isBatchMode ? '#374151' : '#ffffff',
                borderRadius: '0.5rem',
                border: isBatchMode ? '1px solid #d1d5db' : 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              {isBatchMode ? '退出批量模式' : '批量管理'}
            </button>
            {isBatchMode && (
              <button
                onClick={handleBatchDelete}
                disabled={selectedQuestionIds.size === 0}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedQuestionIds.size === 0 ? '#fca5a5' : '#ef4444',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: selectedQuestionIds.size === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                删除选中 ({selectedQuestionIds.size})
              </button>
            )}
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }),
          backgroundColor: '#f9fafb',
        }}>
          {currentQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>
                {activeTab === 'standard' ? '还没有标准刷题题目' : '还没有概念考察题目'}
              </h3>
              <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                {activeTab === 'standard' ? '标准刷题题目帮助你检验对书籍内容的理解' : '概念考察题目帮助你深入理解核心概念'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isBatchMode={isBatchMode}
                  isSelected={selectedQuestionIds.has(question.id)}
                  onToggleSelection={() => toggleQuestionSelection(question.id)}
                  onUpdate={(updates) => onUpdate(question.id, updates)}
                  onDelete={() => handleDeleteQuestion(question.id, question.question)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ 
  question, 
  isBatchMode, 
  isSelected, 
  onToggleSelection, 
  onUpdate, 
  onDelete 
}: { 
  question: Question;
  isBatchMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '0.5rem', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    }}>
      <div 
        style={{ 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          cursor: isBatchMode ? 'pointer' : 'default',
        }}
        onClick={isBatchMode ? onToggleSelection : () => setExpanded(!expanded)}
      >
        {isBatchMode && (
          <div style={{ 
            width: '1.25rem', 
            height: '1.25rem', 
            borderRadius: '0.25rem', 
            border: '2px solid', 
            borderColor: isSelected ? '#3b82f6' : '#d1d5db',
            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isSelected && (
              <svg style={{ width: '0.75rem', height: '0.75rem', color: '#ffffff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: '#111827', 
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {question.question}
            </p>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '9999px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              flexShrink: 0,
            }}>
              {question.questionType}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.125rem 0.5rem', 
              borderRadius: '9999px',
              backgroundColor: question.masteryLevel === '已掌握' ? '#dcfce7' : question.masteryLevel === '学习中' ? '#fefce8' : '#fee2e2',
              color: question.masteryLevel === '已掌握' ? '#16a34a' : question.masteryLevel === '学习中' ? '#ca8a04' : '#dc2626',
            }}>
              {question.masteryLevel}
            </span>
            {question.knowledgePoint && (
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
              }}>
                📚 {question.knowledgePoint}
              </span>
            )}
          </div>
        </div>
        
        {!isBatchMode && (
          <svg 
            style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              color: '#9ca3af', 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      
      {expanded && !isBatchMode && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
          {question.questionType === '选择题' && question.options && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.5rem' }}>选项</p>
              {question.options.map((opt, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '0.5rem', 
                    marginBottom: '0.25rem', 
                    borderRadius: '0.375rem',
                    backgroundColor: i === question.correctIndex ? '#dcfce7' : '#f9fafb',
                    border: i === question.correctIndex ? '1px solid #22c55e' : '1px solid #e5e7eb',
                  }}
                >
                  <span style={{ fontWeight: i === question.correctIndex ? 600 : 400, color: i === question.correctIndex ? '#16a34a' : '#374151' }}>
                    {String.fromCharCode(65 + i)}. {opt}
                    {i === question.correctIndex && ' ✓'}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>答案</p>
            <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{question.answer}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={question.masteryLevel}
                onChange={(e) => onUpdate({ masteryLevel: e.target.value as Question['masteryLevel'] })}
                style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              >
                <option value="未掌握">未掌握</option>
                <option value="学习中">学习中</option>
                <option value="已掌握">已掌握</option>
              </select>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
