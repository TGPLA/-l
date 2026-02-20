import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../hooks';
import type { Book, Question, MasteryLevel, ConceptEvaluation } from '../types';
import { evaluateAnswer } from '../api/zhipu';
import { getResponsiveValue } from '../utils/responsive';

interface PracticeModeProps {
  book: Book;
  mode: 'standard' | 'concept' | 'wrong';
  onBack: () => void;
}

export function PracticeMode({ book, mode, onBack }: PracticeModeProps) {
  const { getQuestionsByBook, updateQuestion, deleteQuestion, settings } = useApp();
  const allQuestions = useMemo(() => getQuestionsByBook(book.id), [book.id]);
  const questionsCount = allQuestions.length;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<ConceptEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState<'uploading' | 'thinking' | 'returning' | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showNavPanel, setShowNavPanel] = useState(false);

  useEffect(() => {
    let filteredQuestions = [...allQuestions];
    
    if (mode === 'wrong') {
      filteredQuestions = allQuestions.filter(q => q.masteryLevel === '未掌握');
    } else if (mode === 'standard') {
      filteredQuestions = allQuestions.filter(q => q.category === 'standard');
    } else if (mode === 'concept') {
      filteredQuestions = allQuestions.filter(q => q.category === 'concept');
    }
    
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
    setEvaluation(null);
    setSelectedChoice(null);
    setEvaluationProgress(null);
    setCompleted(false);
  }, [questionsCount, mode]);

  const currentQuestion = questions[currentIndex];

  const handleMarkMastery = (level: MasteryLevel) => {
    if (!currentQuestion) return;
    
    updateQuestion(currentQuestion.id, {
      masteryLevel: level,
      lastPracticedAt: Date.now(),
      practiceCount: currentQuestion.practiceCount + 1,
    });
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setUserAnswer('');
      setEvaluation(null);
      setSelectedChoice(null);
      setEvaluationProgress(null);
    } else {
      setCompleted(true);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setUserAnswer('');
      setEvaluation(null);
      setSelectedChoice(null);
      setEvaluationProgress(null);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
    setUserAnswer('');
    setEvaluation(null);
    setSelectedChoice(null);
    setEvaluationProgress(null);
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;

    setEvaluating(true);
    setEvaluationProgress('uploading');
    
    try {
      setEvaluationProgress('thinking');
      const result = await evaluateAnswer(
        settings,
        book.title,
        currentQuestion.question,
        userAnswer.trim()
      );
      setEvaluationProgress('returning');
      setTimeout(() => {
        setEvaluation(result);
        setEvaluationProgress(null);
      }, 500);
    } catch (err) {
      console.error('Evaluation failed:', err);
      setEvaluationProgress(null);
      setEvaluation({
        evaluation: '评价失败，请检查 API 配置',
        supplement: err instanceof Error ? err.message : '',
        translation: undefined,
        scenario: undefined,
        vocabularyCards: undefined,
      });
    } finally {
      setEvaluating(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: getResponsiveValue({ mobile: '1rem', tablet: '0' }) }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>没有可刷的问题</p>
          <button
            onClick={onBack}
            style={{ marginTop: '1rem', padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }), maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>练习完成!</h2>
          <p style={{ color: '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>
            你已完成《{book.title}》的 {questions.length} 道题目
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }) }}>
            <button
              onClick={onBack}
              style={{ flex: 1, padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}
            >
              返回书籍
            </button>
            <button
              onClick={() => {
                const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
                setCurrentIndex(0);
                setCompleted(false);
                setShowAnswer(false);
                setUserAnswer('');
                setEvaluation(null);
                setSelectedChoice(null);
              }}
              style={{ flex: 1, padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#374151', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}
            >
              再来一轮
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '0.75rem', tablet: '0' }) }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer', width: getResponsiveValue({ mobile: '100%', tablet: 'auto' }), justifyContent: getResponsiveValue({ mobile: 'center', tablet: 'flex-start' }) }}
          >
            <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            退出
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }), flexDirection: getResponsiveValue({ mobile: 'row', tablet: 'row' }), width: getResponsiveValue({ mobile: '100%', tablet: 'auto' }), justifyContent: getResponsiveValue({ mobile: 'space-between', tablet: 'flex-start' }) }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {currentIndex + 1} / {questions.length}
            </span>
            <div style={{ width: getResponsiveValue({ mobile: '6rem', tablet: '8rem' }), height: '0.5rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div 
                style={{ height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s', width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <button
              onClick={() => setShowNavPanel(true)}
              style={{ padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem' }), backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.75rem', tablet: '0.875rem' }) }}
            >
              导航
            </button>
          </div>
        </div>

        <div style={{ marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), textAlign: 'center', display: 'flex', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
            {mode === 'standard' ? '标准刷题' : '概念考察'}
          </span>
          <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
            {currentQuestion?.questionType}
          </span>
          {currentQuestion?.knowledgePoint && (
            <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#059669' }}>
              📚 {currentQuestion.knowledgePoint}
            </span>
          )}
        </div>

        {currentQuestion?.questionType === '选择题' ? (
          <ChoiceCard
            question={currentQuestion}
            selectedChoice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            showAnswer={showAnswer}
            onConfirm={() => setShowAnswer(true)}
            onMarkMastery={handleMarkMastery}
          />
        ) : mode === 'standard' ? (
          <StandardCard
            question={currentQuestion}
            showAnswer={showAnswer}
            onFlip={() => setShowAnswer(!showAnswer)}
            onMarkMastery={handleMarkMastery}
          />
        ) : (
          <ConceptCard
            question={currentQuestion}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            evaluation={evaluation}
            evaluating={evaluating}
            evaluationProgress={evaluationProgress}
            showAnswer={showAnswer}
            onEvaluate={handleEvaluate}
            onShowAnswer={() => setShowAnswer(true)}
            onMarkMastery={handleMarkMastery}
          />
        )}

        <NavigationButtons
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      </div>

      {showNavPanel && (
        <NavPanel
          questions={questions}
          currentIndex={currentIndex}
          onQuestionClick={goToQuestion}
          onClose={() => setShowNavPanel(false)}
          onDeleteQuestion={(questionId) => {
            deleteQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            if (currentIndex >= questions.length - 1) {
              setCurrentIndex(Math.max(0, currentIndex - 1));
            }
          }}
        />
      )}
    </div>
  );
}

interface ChoiceCardProps {
  question: Question;
  selectedChoice: number | null;
  setSelectedChoice: (index: number | null) => void;
  showAnswer: boolean;
  onConfirm: () => void;
  onMarkMastery: (level: MasteryLevel) => void;
}

function ChoiceCard({ question, selectedChoice, setSelectedChoice, showAnswer, onConfirm, onMarkMastery }: ChoiceCardProps) {
  const isCorrect = selectedChoice !== null && selectedChoice === question.correctIndex;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '1.25rem', color: '#111827', fontWeight: 500 }}>{question.question}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {question.options?.map((opt, i) => {
            let bgColor = '#f9fafb';
            let borderColor = '#e5e7eb';
            let textColor = '#374151';
            
            if (showAnswer) {
              if (question.correctIndex !== undefined && i === question.correctIndex) {
                bgColor = '#dcfce7';
                borderColor = '#22c55e';
                textColor = '#16a34a';
              } else if (selectedChoice !== null && i === selectedChoice && question.correctIndex !== undefined && i !== question.correctIndex) {
                bgColor = '#fef2f2';
                borderColor = '#ef4444';
                textColor = '#dc2626';
              }
            } else if (selectedChoice === i) {
              bgColor = '#dbeafe';
              borderColor = '#3b82f6';
              textColor = '#2563eb';
            }

            return (
              <button
                key={i}
                onClick={() => !showAnswer && setSelectedChoice(i)}
                disabled={showAnswer}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '0.5rem',
                  textAlign: 'left',
                  cursor: showAnswer ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontWeight: 600, color: textColor }}>
                  {opt}
                  {showAnswer && question.correctIndex !== undefined && i === question.correctIndex && ' ✓'}
                  {showAnswer && selectedChoice !== null && i === selectedChoice && question.correctIndex !== undefined && i !== question.correctIndex && ' ✗'}
                </span>
              </button>
            );
          })}
        </div>

        {!showAnswer ? (
          <button
            onClick={onConfirm}
            disabled={selectedChoice === null}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: selectedChoice === null ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: selectedChoice === null ? 'not-allowed' : 'pointer',
            }}
          >
            确认答案
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: isCorrect ? '#dcfce7' : '#fef2f2',
              textAlign: 'center',
            }}>
              <p style={{ fontWeight: 600, color: isCorrect ? '#16a34a' : '#dc2626' }}>
                {isCorrect ? '🎉 回答正确！' : '❌ 回答错误'}
              </p>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>答案解析</p>
              <p style={{ color: '#374151' }}>
                {(() => {
                  if (question.answer && question.answer.trim() !== '') {
                    return question.answer;
                  }
                  
                  if (question.options && question.correctIndex !== undefined && question.options[question.correctIndex]) {
                    return `正确答案是：${question.options[question.correctIndex]}`;
                  }
                  
                  return `正确答案：${question.options ? question.options.join(' / ') : '选项数据丢失'}，正确索引：${question.correctIndex !== undefined ? question.correctIndex : '未知'}`;
                })()}
              </p>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '0.25rem', fontSize: '0.75rem', color: '#991b1b' }}>
                <strong>调试信息：</strong><br/>
                answer: {question.answer || '(空)'}<br/>
                options: {question.options ? JSON.stringify(question.options) : '(无)'}<br/>
                correctIndex: {question.correctIndex !== undefined ? question.correctIndex : '(未定义)'}<br/>
                selectedChoice: {selectedChoice !== null ? selectedChoice : '(未选择)'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={() => onMarkMastery('未掌握')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                未掌握
              </button>
              <button
                onClick={() => onMarkMastery('学习中')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#fefce8', color: '#ca8a04', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                学习中
              </button>
              <button
                onClick={() => onMarkMastery('已掌握')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                已掌握
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
}

function NavigationButtons({ currentIndex, totalQuestions, onPrevious, onNext }: NavigationButtonsProps) {
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        style={{
          flex: 1,
          padding: '0.75rem 1.5rem',
          backgroundColor: currentIndex === 0 ? '#f3f4f6' : '#3b82f6',
          color: currentIndex === 0 ? '#9ca3af' : '#ffffff',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        ← 上一题
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
        style={{
          flex: 1,
          padding: '0.75rem 1.5rem',
          backgroundColor: currentIndex === totalQuestions - 1 ? '#f3f4f6' : '#3b82f6',
          color: currentIndex === totalQuestions - 1 ? '#9ca3af' : '#ffffff',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: currentIndex === totalQuestions - 1 ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        下一题 →
      </button>
    </div>
  );
}

interface NavPanelProps {
  questions: Question[];
  currentIndex: number;
  onQuestionClick: (index: number) => void;
  onClose: () => void;
  onDeleteQuestion: (questionId: string) => void;
}

function NavPanel({ questions, currentIndex, onQuestionClick, onClose, onDeleteQuestion }: NavPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'wrong'>('all');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  const masteredCount = questions.filter(q => q.masteryLevel === '已掌握').length;
  const learningCount = questions.filter(q => q.masteryLevel === '学习中').length;
  const notMasteredCount = questions.filter(q => q.masteryLevel === '未掌握').length;

  const handleDeleteQuestion = async (questionId: string, questionText: string) => {
    const confirmed = await confirm(`确定要删除这个问题吗？\n"${questionText.substring(0, 50)}..."`);
    if (confirmed) {
      onDeleteQuestion(questionId);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedQuestionIds.size === 0) return;
    
    const confirmed = await confirm(`确定要删除选中的 ${selectedQuestionIds.size} 个题目吗？`);
    if (confirmed) {
      selectedQuestionIds.forEach(id => onDeleteQuestion(id));
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
    if (selectedQuestionIds.size === questions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(questions.map(q => q.id)));
    }
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
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '42rem',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>题目导航</h2>
          <button
            onClick={onClose}
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: filter === 'all' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'all' ? '#ffffff' : '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            全部 ({questions.length})
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: filter === 'unanswered' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'unanswered' ? '#ffffff' : '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            未答 ({notMasteredCount})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: filter === 'wrong' ? '#3b82f6' : '#f3f4f6',
              color: filter === 'wrong' ? '#ffffff' : '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            错题 ({notMasteredCount})
          </button>
        </div>

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
                  {selectedQuestionIds.size === questions.length ? '取消全选' : '全选'}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {questions.map((q, index) => (
            <div key={q.id} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (isBatchMode) {
                    toggleQuestionSelection(q.id);
                  } else {
                    onQuestionClick(index);
                    onClose();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '2px solid',
                  backgroundColor: index === currentIndex ? '#dbeafe' : (isBatchMode && selectedQuestionIds.has(q.id)) ? '#dbeafe' : '#f9fafb',
                  borderColor: index === currentIndex ? '#3b82f6' : (isBatchMode && selectedQuestionIds.has(q.id)) ? '#3b82f6' : q.masteryLevel === '已掌握' ? '#22c55e' : q.masteryLevel === '学习中' ? '#eab308' : '#e5e7eb',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  position: 'relative',
                }}
              >
                {index + 1}
                {q.masteryLevel === '已掌握' && !isBatchMode && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.75rem' }}>✓</span>
                )}
                {q.masteryLevel === '学习中' && !isBatchMode && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.75rem' }}>●</span>
                )}
                {isBatchMode && selectedQuestionIds.has(q.id) && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>✓</span>
                )}
              </button>
              {!isBatchMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(q.id, q.question);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: 0,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                  title="删除题目"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>已掌握 ({masteredCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>学习中 ({learningCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', backgroundColor: '#e5e7eb' }}></span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>未掌握 ({notMasteredCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StandardCardProps {
  question: Question;
  showAnswer: boolean;
  onFlip: () => void;
  onMarkMastery: (level: MasteryLevel) => void;
}

function StandardCard({ question, showAnswer, onFlip, onMarkMastery }: StandardCardProps) {
  return (
    <div 
      style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', cursor: 'pointer', minHeight: '400px' }}
      onClick={onFlip}
    >
      {!showAnswer ? (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
          <p style={{ fontSize: '1.25rem', color: '#111827', textAlign: 'center', fontWeight: 500 }}>
            {question.question}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '1.5rem' }}>点击翻转查看答案</p>
        </div>
      ) : (
        <div style={{ padding: '2rem', minHeight: '400px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>问题</p>
            <p style={{ color: '#111827', fontWeight: 500 }}>{question.question}</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>答案</p>
            <p style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>{question.answer}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onMarkMastery('未掌握')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              未掌握
            </button>
            <button
              onClick={() => onMarkMastery('学习中')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#fefce8', color: '#ca8a04', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              学习中
            </button>
            <button
              onClick={() => onMarkMastery('已掌握')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              已掌握
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConceptCardProps {
  question: Question;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  evaluation: ConceptEvaluation | null;
  evaluating: boolean;
  evaluationProgress: 'uploading' | 'thinking' | 'returning' | null;
  showAnswer: boolean;
  onEvaluate: () => void;
  onShowAnswer: () => void;
  onMarkMastery: (level: MasteryLevel) => void;
}

function ConceptCard({ 
  question, 
  userAnswer, 
  setUserAnswer, 
  evaluation, 
  evaluating,
  evaluationProgress,
  showAnswer,
  onEvaluate, 
  onShowAnswer,
  onMarkMastery 
}: ConceptCardProps) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>问题</p>
          <p style={{ fontSize: '1.25rem', color: '#111827', fontWeight: 500 }}>{question.question}</p>
        </div>

        {!evaluation && !showAnswer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                用你自己的话描述理解
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none' }}
                rows={4}
                placeholder="请输入你的理解..."
              />
            </div>
            
            {evaluating && evaluationProgress && (
              <div style={{ padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }), backgroundColor: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), height: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite' }}>
                    <svg style={{ width: getResponsiveValue({ mobile: '0.75rem', tablet: '0.875rem' }), height: getResponsiveValue({ mobile: '0.75rem', tablet: '0.875rem' }), color: '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 500, color: '#374151', fontSize: getResponsiveValue({ mobile: '0.8125rem', tablet: '0.875rem' }) }}>
                    {evaluationProgress === 'uploading' && '正在上传答案...'}
                    {evaluationProgress === 'thinking' && 'AI 正在思考分析...'}
                    {evaluationProgress === 'returning' && '正在获取评价结果...'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ 
                    flex: 1, 
                    height: '0.25rem', 
                    backgroundColor: evaluationProgress === 'uploading' ? '#8b5cf6' : '#e5e7eb', 
                    borderRadius: '0.125rem',
                    transition: 'background-color 0.3s'
                  }} />
                  <div style={{ 
                    flex: 1, 
                    height: '0.25rem', 
                    backgroundColor: evaluationProgress === 'thinking' ? '#8b5cf6' : '#e5e7eb', 
                    borderRadius: '0.125rem',
                    transition: 'background-color 0.3s'
                  }} />
                  <div style={{ 
                    flex: 1, 
                    height: '0.25rem', 
                    backgroundColor: evaluationProgress === 'returning' ? '#8b5cf6' : '#e5e7eb', 
                    borderRadius: '0.125rem',
                    transition: 'background-color 0.3s'
                  }} />
                </div>
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={onEvaluate}
                disabled={!userAnswer.trim() || evaluating}
                style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: !userAnswer.trim() || evaluating ? '#9ca3af' : '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !userAnswer.trim() || evaluating ? 'not-allowed' : 'pointer' }}
              >
                {evaluating ? 'AI 评价中...' : '提交评价'}
              </button>
              <button
                onClick={onShowAnswer}
                style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#374151', cursor: 'pointer' }}
              >
                直接看答案
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {evaluation && (
              <>
                <div style={{ padding: '1rem', backgroundColor: '#f3e8ff', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#7c3aed', marginBottom: '0.25rem' }}>你的回答</p>
                  <p style={{ color: '#374151' }}>{userAnswer}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#2563eb', marginBottom: '0.25rem' }}>AI 评价</p>
                  <p style={{ color: '#374151' }}>{evaluation.evaluation}</p>
                </div>
                {evaluation.supplement && (
                  <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.25rem' }}>补充说明</p>
                    <p style={{ color: '#374151' }}>{evaluation.supplement}</p>
                  </div>
                )}
                {evaluation.translation && typeof evaluation.translation === 'string' && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef9c3', borderRadius: '0.5rem', border: '2px solid #fbbf24' }}>
                    <p style={{ fontSize: '0.875rem', color: '#d97706', marginBottom: '0.5rem', fontWeight: 600 }}>📢 翻译成人话</p>
                    <div style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {evaluation.translation.split('\n').map((line, i, arr) => (
                        <div key={i} style={{ marginBottom: i === arr.length - 1 ? 0 : '0.5rem' }}>
                          {line.startsWith('>') ? (
                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>{line}</span>
                          ) : line.startsWith('**') && line.endsWith('**') ? (
                            <span style={{ fontWeight: 700, color: '#d97706' }}>{line.slice(2, -2)}</span>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {evaluation.scenario && typeof evaluation.scenario === 'string' && (
                  <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '0.5rem', border: '2px solid #0ea5e9' }}>
                    <p style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.5rem', fontWeight: 600 }}>🏠 场景模拟 (内含黑话)</p>
                    <div style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {evaluation.scenario.split('\n').map((line, i, arr) => (
                        <div key={i} style={{ marginBottom: i === arr.length - 1 ? 0 : '0.5rem' }}>
                          {line.startsWith('>') ? (
                            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>{line}</span>
                          ) : line.startsWith('**') && line.endsWith('**') ? (
                            <span style={{ fontWeight: 700, color: '#0369a1' }}>{line.slice(2, -2)}</span>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {evaluation.vocabularyCards && evaluation.vocabularyCards.length > 0 && (
                  <div style={{ padding: '1rem', backgroundColor: '#fce7f3', borderRadius: '0.5rem', border: '2px solid #ec4899' }}>
                    <p style={{ fontSize: '0.875rem', color: '#be185d', marginBottom: '0.75rem', fontWeight: 600 }}>🎓 今日"黑话"卡片</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {evaluation.vocabularyCards.map((card, index) => (
                        <div key={index} style={{ padding: '0.75rem', backgroundColor: '#fff1f2', borderRadius: '0.375rem', border: '1px solid #fbcfe8' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#be185d', marginBottom: '0.25rem' }}>
                            • {card.term}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#9d174d' }}>定义：</span>{card.definition}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ color: '#9d174d' }}>应用语境：</span>{card.context}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>参考答案</p>
              <p style={{ color: '#374151' }}>{question.answer}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', paddingTop: '1rem' }}>
              <button
                onClick={() => onMarkMastery('未掌握')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                未掌握
              </button>
              <button
                onClick={() => onMarkMastery('学习中')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#fefce8', color: '#ca8a04', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                学习中
              </button>
              <button
                onClick={() => onMarkMastery('已掌握')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                已掌握
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
