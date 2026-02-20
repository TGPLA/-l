import { useState, useEffect } from 'react';
import { useApp } from '../hooks';
import type { Book, Question, QuestionType, Difficulty, Settings } from '../types';
import { generateQuestions } from '../api/zhipu';
import { getResponsiveValue } from '../utils/responsive';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onStartPractice: (mode: 'standard' | 'concept' | 'wrong') => void;
}

export function BookDetail({ book, onBack, onStartPractice }: BookDetailProps) {
  const { getQuestionsByBook, addQuestion, updateQuestion, updateBook, deleteQuestion, settings } = useApp();
  const questions = getQuestionsByBook(book.id);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'concept' | 'stats' | 'info'>('standard');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);

  const standardQuestions = questions.filter(q => q.category === 'standard');
  const conceptQuestions = questions.filter(q => q.category === 'concept');
  const currentQuestions = activeTab === 'standard' ? standardQuestions : conceptQuestions;

  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    const confirmed = await confirm(`确定要删除这个问题吗？\n"${questionText.substring(0, 50)}..."`);
    if (confirmed) {
      deleteQuestion(questionId);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedQuestionIds.size === 0) return;
    
    const confirmed = await confirm(`确定要删除选中的 ${selectedQuestionIds.size} 个题目吗？`);
    if (confirmed) {
      selectedQuestionIds.forEach(id => deleteQuestion(id));
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

  const progress = book.questionCount > 0 
    ? Math.round((book.masteredCount / book.questionCount) * 100) 
    : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回书架
          </button>
          
          <div style={{ display: 'flex', gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }) }}>
            <div style={{
              width: getResponsiveValue({ mobile: '100%', tablet: '8rem' }),
              height: getResponsiveValue({ mobile: 'auto', tablet: '11rem' }),
              aspectRatio: getResponsiveValue({ mobile: '3/4', tablet: 'auto' }),
              background: 'linear-gradient(to bottom right, #dbeafe, #f3e8ff)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              margin: getResponsiveValue({ mobile: '0 auto', tablet: '0' }),
              maxWidth: getResponsiveValue({ mobile: '200px', tablet: 'none' }),
            }}>
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg style={{ width: getResponsiveValue({ mobile: '2.5rem', tablet: '3rem' }), height: getResponsiveValue({ mobile: '2.5rem', tablet: '3rem' }), color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#111827' }}>{book.title}</h1>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{book.author}</p>
              
              <div style={{ marginTop: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), display: 'flex', gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), flexDirection: getResponsiveValue({ mobile: 'row', tablet: 'row' }), flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>题目总数</p>
                  <p style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#111827' }}>{book.questionCount}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>已掌握</p>
                  <p style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#22c55e' }}>{book.masteredCount}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>掌握率</p>
                  <p style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#3b82f6' }}>{progress}%</p>
                </div>
              </div>
              
              <div style={{ marginTop: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (standardQuestions.length === 0) {
                      setActiveTab('standard');
                    } else {
                      onStartPractice('standard');
                    }
                  }}
                  style={{
                    padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                    backgroundColor: standardQuestions.length === 0 ? '#93c5fd' : '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                  }}
                >
                  标准刷题 ({standardQuestions.length})
                </button>
                <button
                  onClick={() => {
                    if (conceptQuestions.length === 0) {
                      setActiveTab('concept');
                    } else {
                      onStartPractice('concept');
                    }
                  }}
                  style={{
                    padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                    backgroundColor: conceptQuestions.length === 0 ? '#c4b5fd' : '#8b5cf6',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                  }}
                >
                  概念考察 ({conceptQuestions.length})
                </button>
                <button
                  onClick={() => onStartPractice('wrong')}
                  disabled={questions.filter(q => q.masteryLevel === '未掌握').length === 0}
                  style={{
                    padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                    backgroundColor: questions.filter(q => q.masteryLevel === '未掌握').length === 0 ? '#9ca3af' : '#ef4444',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: questions.filter(q => q.masteryLevel === '未掌握').length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                  }}
                >
                  错题集 ({questions.filter(q => q.masteryLevel === '未掌握').length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowAddModal(true)}
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
            <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            手动添加问题
          </button>
          <button
            onClick={() => setShowAIGenerateModal(true)}
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
            <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 生成问题
          </button>
        </div>

        <div style={{ display: 'flex', gap: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }), borderBottom: '1px solid #e5e7eb', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), flexWrap: 'wrap' }}>
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
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              paddingBottom: '0.5rem',
              fontWeight: 500,
              color: activeTab === 'stats' ? '#3b82f6' : '#6b7280',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === 'stats' ? '2px solid #3b82f6' : 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            统计分析
          </button>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              paddingBottom: '0.5rem',
              fontWeight: 500,
              color: activeTab === 'info' ? '#3b82f6' : '#6b7280',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === 'info' ? '2px solid #3b82f6' : 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            书籍信息
          </button>
        </div>

        {(activeTab === 'standard' || activeTab === 'concept') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isBatchMode ? (
                  <>
                    <button
                      onClick={() => {
                        setIsBatchMode(false);
                        setSelectedQuestionIds(new Set());
                      }}
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
                      取消
                    </button>
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
                  </>
                ) : (
                  <button
                    onClick={() => setIsBatchMode(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    批量管理
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#ffffff', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                <p style={{ color: '#6b7280' }}>
                  {activeTab === 'standard' ? '还没有标准刷题题目' : '还没有概念考察题目'}
                </p>
              </div>
            ) : (
              currentQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isBatchMode={isBatchMode}
                  isSelected={selectedQuestionIds.has(question.id)}
                  onToggleSelection={() => toggleQuestionSelection(question.id)}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                  onDelete={() => handleDeleteQuestion(question.id, question.question)}
                />
              ))
            )}
          </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <StatsView questions={questions} />
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <BookInfoForm book={book} onUpdate={(updates) => updateBook(book.id, updates)} />
          </div>
        )}
      </div>

      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        bookId={book.id}
        category={activeTab === 'standard' ? 'standard' : 'concept'}
        onAdd={addQuestion}
      />
      
      <AIGenerateModal
        isOpen={showAIGenerateModal}
        onClose={() => setShowAIGenerateModal(false)}
        book={book}
        settings={settings}
        category={activeTab === 'standard' ? 'standard' : 'concept'}
        onAdd={addQuestion}
      />
    </div>
  );
}

interface BookInfoFormProps {
  book: Book;
  onUpdate: (updates: Partial<Book>) => void;
}

function BookInfoForm({ book, onUpdate }: BookInfoFormProps) {
  const [summary, setSummary] = useState(book.summary || '');
  const [contents, setContents] = useState(book.contents || '');
  const [keyPoints, setKeyPoints] = useState(book.keyPoints?.join('\n') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const keyPointsArray = keyPoints.split('\n').filter(p => p.trim());
    onUpdate({
      summary,
      contents,
      keyPoints: keyPointsArray.length > 0 ? keyPointsArray : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
        书籍信息
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        填写书籍的详细信息，帮助 AI 生成更准确的问题
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>
            书籍简介
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="简要描述这本书的主要内容、核心观点和特色..."
            style={{
              width: '100%',
              minHeight: '8rem',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>
            目录结构
          </label>
          <textarea
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            placeholder="列出书籍的章节目录，例如：&#10;第一章：原子习惯的微小力量&#10;第二章：身份认同的改变&#10;第三章：环境设计的艺术..."
            style={{
              width: '100%',
              minHeight: '8rem',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}>
            核心知识点
          </label>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder="每行一个核心知识点，例如：&#10;原子习惯的四个定律&#10;环境设计的重要性&#10;身份认同与习惯养成&#10;习惯堆叠法..."
            style={{
              width: '100%',
              minHeight: '6rem',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {saved ? '✓ 已保存' : '保存信息'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  isBatchMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

function QuestionCard({ question, isBatchMode, isSelected, onToggleSelection, onUpdate, onDelete }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const masteryColors: Record<string, string> = {
    '未掌握': '#fef2f2',
    '学习中': '#fefce8',
    '已掌握': '#f0fdf4',
  };

  const masteryTextColors: Record<string, string> = {
    '未掌握': '#dc2626',
    '学习中': '#ca8a04',
    '已掌握': '#16a34a',
  };

  const difficultyColors: Record<string, string> = {
    '基础': '#f3f4f6',
    '中等': '#dbeafe',
    '进阶': '#f3e8ff',
    '挑战': '#fef2f2',
  };

  const difficultyTextColors: Record<string, string> = {
    '基础': '#374151',
    '中等': '#2563eb',
    '进阶': '#7c3aed',
    '挑战': '#dc2626',
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
      <div 
        style={{ padding: '1rem', cursor: isBatchMode ? 'default' : 'pointer' }}
        onClick={() => !isBatchMode && setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          {isBatchMode && (
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                }}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ color: '#111827', fontWeight: 500 }}>{question.question}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                backgroundColor: masteryColors[question.masteryLevel],
                color: masteryTextColors[question.masteryLevel],
              }}>
                {question.masteryLevel}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                backgroundColor: difficultyColors[question.difficulty],
                color: difficultyTextColors[question.difficulty],
              }}>
                {question.difficulty}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
              }}>
                {question.questionType}
              </span>
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

interface StatsViewProps {
  questions: Question[];
}

function StatsView({ questions }: StatsViewProps) {
  const standardQuestions = questions.filter(q => q.category === 'standard');
  const conceptQuestions = questions.filter(q => q.category === 'concept');

  const byType = questions.reduce((acc, q) => {
    acc[q.questionType] = (acc[q.questionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byDifficulty = questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byMastery = questions.reduce((acc, q) => {
    acc[q.masteryLevel] = (acc[q.masteryLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const standardByMastery = standardQuestions.reduce((acc, q) => {
    acc[q.masteryLevel] = (acc[q.masteryLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conceptByMastery = conceptQuestions.reduce((acc, q) => {
    acc[q.masteryLevel] = (acc[q.masteryLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.5rem', fontSize: '1.125rem' }}>总体统计</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h4 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem' }}>按问题类型</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>{type}</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem' }}>按难度</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(byDifficulty).map(([difficulty, count]) => (
              <div key={difficulty} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>{difficulty}</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.75rem', fontSize: '0.875rem' }}>按掌握程度</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(byMastery).map(([mastery, count]) => (
              <div key={mastery} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280' }}>{mastery}</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '1.5rem', fontSize: '1.125rem' }}>按板块统计</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#eff6ff', borderRadius: '0.5rem', padding: '1rem' }}>
          <h4 style={{ fontWeight: 600, color: '#1e40af', marginBottom: '1rem', fontSize: '1rem' }}>📚 标准刷题</h4>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>题目总数：</span>
            <span style={{ fontWeight: 500, color: '#1e40af' }}>{standardQuestions.length}</span>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>掌握情况：</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
            {Object.entries(standardByMastery).map(([mastery, count]) => (
              <div key={mastery} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{mastery}</span>
                <span style={{ fontWeight: 500, color: '#1e40af' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#f5f3ff', borderRadius: '0.5rem', padding: '1rem' }}>
          <h4 style={{ fontWeight: 600, color: '#5b21b6', marginBottom: '1rem', fontSize: '1rem' }}>💡 概念考察</h4>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>题目总数：</span>
            <span style={{ fontWeight: 500, color: '#5b21b6' }}>{conceptQuestions.length}</span>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>掌握情况：</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
            {Object.entries(conceptByMastery).map(([mastery, count]) => (
              <div key={mastery} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{mastery}</span>
                <span style={{ fontWeight: 500, color: '#5b21b6' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  category: 'standard' | 'concept';
  onAdd: (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => Question;
}

function AddQuestionModal({ isOpen, onClose, bookId, category, onAdd }: AddQuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(category === 'standard' ? '选择题' : '简答题');
  const [difficulty, setDifficulty] = useState<Difficulty>('中等');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  useEffect(() => {
    setQuestionType(category === 'standard' ? '选择题' : '简答题');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    if (questionType === '选择题') {
      const filledOptions = options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        alert('选择题至少需要2个选项');
        return;
      }
      onAdd({
        bookId,
        question: question.trim(),
        answer: answer.trim(),
        questionType,
        difficulty,
        options: options.map(o => o.trim()),
        correctIndex,
        category,
      });
    } else {
      onAdd({
        bookId,
        question: question.trim(),
        answer: answer.trim(),
        questionType,
        difficulty,
        category,
      });
    }

    setQuestion('');
    setAnswer('');
    setQuestionType(category === 'standard' ? '选择题' : '简答题');
    setDifficulty('中等');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    onClose();
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '32rem',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>添加问题</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>问题 *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              rows={2}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>问题类型</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              >
                <option value="简答题">简答题</option>
                <option value="选择题">选择题</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>难度</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              >
                <option value="基础">基础</option>
                <option value="中等">中等</option>
                <option value="进阶">进阶</option>
                <option value="挑战">挑战</option>
              </select>
            </div>
          </div>

          {questionType === '选择题' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>选项（选择正确答案）</label>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontWeight: 500, color: '#374151' }}>{String.fromCharCode(65 + i)}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
              {questionType === '选择题' ? '答案解析 *' : '答案 *'}
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              rows={3}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'transparent',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  settings: Settings;
  category: 'standard' | 'concept';
  onAdd: (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => Question;
}

function AIGenerateModal({ isOpen, onClose, book, settings, category, onAdd }: AIGenerateModalProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(category === 'standard' ? '选择题' : '简答题');
  const [difficulty, setDifficulty] = useState<Difficulty>('中等');
  const [scope, setScope] = useState('');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{question: string; answer?: string; options?: string[]; correctIndex?: number}>>([]);

  useEffect(() => {
    setQuestionType(category === 'standard' ? '选择题' : '简答题');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const result = await generateQuestions(
        settings,
        book.title,
        book.author,
        questionType,
        difficulty,
        scope.trim(),
        count,
        book.summary,
        book.contents,
        book.keyPoints
      );
      
      if (result.questions && result.questions.length > 0) {
        setGeneratedQuestions(result.questions);
      } else {
        setError('未能生成问题，请检查 API 配置');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = () => {
    generatedQuestions.forEach(q => {
      onAdd({
        bookId: book.id,
        question: q.question,
        answer: q.answer || '',
        questionType,
        difficulty,
        options: q.options,
        correctIndex: q.correctIndex,
        knowledgePoint: (q as any).knowledgePoint,
        category,
      });
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '42rem',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>AI 生成问题</h2>
          <button
            onClick={onClose}
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>难度</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
            >
              <option value="基础">基础</option>
              <option value="中等">中等</option>
              <option value="进阶">进阶</option>
              <option value="挑战">挑战</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>出题范围（可选）</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                placeholder="例如：第3章 / 土地财政 / 全书"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>题目数量</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n} 道</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '生成中...' : '生成问题'}
          </button>

          {generatedQuestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontWeight: 600, color: '#111827' }}>生成的问题</h3>
              {generatedQuestions.map((q, i) => (
                <div key={i} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 500, color: '#111827' }}>{i + 1}. {q.question}</p>
                    {(q as any).knowledgePoint && (
                      <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                        📚 {(q as any).knowledgePoint}
                      </span>
                    )}
                  </div>
                  {q.options && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      {q.options.map((opt, j) => (
                        <p key={j} style={{ fontSize: '0.875rem', color: j === (q as any).correctIndex ? '#16a34a' : '#6b7280', fontWeight: j === (q as any).correctIndex ? 600 : 400 }}>
                          {String.fromCharCode(65 + j)}. {opt} {j === (q as any).correctIndex && '✓'}
                        </p>
                      ))}
                    </div>
                  )}
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{q.answer}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAll}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  保存全部 ({generatedQuestions.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
