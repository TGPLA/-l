// @审计已完成
// 章节详情组件 - 显示章节内容、划词创建段落、AI出题

import { useState, useEffect, useRef } from 'react';
import type { Chapter, Question, Difficulty, Paragraph, QuestionTypeEnum, PromptTemplate } from '@infrastructure/types';
import { chapterService } from '@shared/services/chapterService';
import { aiService } from '@shared/services/aiService';
import { paragraphService } from '@shared/services/paragraphService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';
import { ZhuiJiaTiMu } from './题目管理/ZhuiJiaTiMu';
import { TiShiCiMoBan } from './提示词管理/TiShiCiMoBan';
import { TiShiCiBianJi } from './提示词管理/TiShiCiBianJi';

const TI_XING: QuestionTypeEnum[] = ['名词解释', '意图理解', '生活应用'];

interface ChapterDetailProps {
  chapter: Chapter;
  onBack: () => void;
  onStartPractice: (paragraph: Paragraph, questions: Question[]) => void;
}

export function ChapterDetail({ chapter, onBack, onStartPractice }: ChapterDetailProps) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionBar, setShowSelectionBar] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showZhuiJiaModal, setShowZhuiJiaModal] = useState(false);
  const [showTiShiCiBianJiModal, setShowTiShiCiBianJiModal] = useState(false);
  const [generateTarget, setGenerateTarget] = useState<'chapter' | 'paragraph' | null>(null);
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('中等');
  const [questionType, setQuestionType] = useState<QuestionTypeEnum>('名词解释');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { paragraphs: loadedParagraphs } = await paragraphService.getParagraphsByChapter(chapter.id);
      if (mounted) setParagraphs(loadedParagraphs);
    })();
    return () => { mounted = false; };
  }, [chapter.id]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString().trim());
        setShowSelectionBar(true);
      } else {
        setShowSelectionBar(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleCreateParagraph = async () => {
    if (!selectedText.trim()) return;

    setCreating(true);
    try {
      const { paragraph, error: createError } = await paragraphService.createParagraph({
        chapterId: chapter.id,
        content: selectedText.trim(),
      });

      if (createError || !paragraph) {
        showError(createError?.message || '创建段落失败');
        return;
      }

      showSuccess('段落创建成功');
      setParagraphs(prev => [...prev, paragraph]);
      setSelectedText('');
      setShowSelectionBar(false);
      window.getSelection()?.removeAllRanges();
    } finally {
      setCreating(false);
    }
  };

  const handleOpenGenerateModal = () => {
    if (paragraphs.length === 0) {
      setGenerateTarget('chapter');
    } else {
      setGenerateTarget(null);
    }
    setShowGenerateModal(true);
  };

  const handleGenerate = async () => {
    if (!generateTarget) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      if (generateTarget === 'chapter') {
        result = await aiService.generateQuestions(chapter.id, difficulty, 5);
      } else if (generateTarget === 'paragraph' && selectedParagraphId) {
        result = await aiService.generateQuestionsForParagraph(selectedParagraphId, questionType, 5);
      }

      if (result?.error || !result?.data) {
        setError(result?.error?.message || result?.error || '生成失败');
        return;
      }

      showSuccess(`成功生成 ${result.data.questions.length} 道题目`);
      setShowGenerateModal(false);

      const { questions: loadedQuestions } = await chapterService.getChapterDetail(chapter.id);
      setQuestions(loadedQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (generateTarget === 'paragraph' && selectedParagraphId) {
      const paragraph = paragraphs.find(p => p.id === selectedParagraphId);
      if (paragraph) {
        onStartPractice(paragraph, questions);
      }
    } else {
      onStartPractice({ ...chapter, content: chapter.content } as Paragraph, questions);
    }
  };

  const handleZhuiJiaSuccess = async () => {
    const { questions: loadedQuestions } = await chapterService.getChapterDetail(chapter.id);
    setQuestions(loadedQuestions);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TouBuDaoHang chapter={chapter} onBack={onBack} />

      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem', paddingBottom: '6rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>章节内容</h2>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{chapter.content.length} 字</span>
          </div>
          <div
            ref={contentRef}
            style={{
              fontSize: '0.9375rem',
              color: '#374151',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              maxHeight: '32rem',
              overflowY: 'auto',
              userSelect: 'text',
            }}
          >
            {chapter.content || '暂无章节内容'}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem', textAlign: 'center' }}>
            💡 选中文字可创建段落，用于 AI 出题
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>
            已创建段落 ({paragraphs.length})
          </h3>
          {paragraphs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              暂无段落，在上方章节内容中选中文字创建
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '12rem', overflowY: 'auto' }}>
              {paragraphs.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#111827' }}>段落 {i + 1}</span>
                  <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>({p.content.length} 字)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleOpenGenerateModal}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          >
            AI 生成题目
          </button>
          {questions.some(q => q.paragraphId) && (
            <button
              onClick={() => setShowZhuiJiaModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 600,
              }}
            >
              批量追加
            </button>
          )}
          {questions.length > 0 && (
            <button
              onClick={handleStartPractice}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 600,
              }}
            >
              开始答题 ({questions.length} 题)
            </button>
          )}
        </div>
      </div>

      {showSelectionBar && selectedText && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 40,
        }}>
          <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              已选中 {selectedText.length} 字
            </div>
            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              maxHeight: '4rem',
              overflowY: 'auto',
              fontSize: '0.875rem',
              color: '#374151',
              lineHeight: 1.5,
            }}>
              {selectedText.length > 200 ? selectedText.slice(0, 200) + '...' : selectedText}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowSelectionBar(false); setSelectedText(''); }}
                style={{
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
                onClick={handleCreateParagraph}
                disabled={creating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: creating ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: creating ? 'not-allowed' : 'pointer',
                }}
              >
                {creating ? '创建中...' : '创建段落'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <ShengChengTanChuang
          paragraphs={paragraphs}
          generateTarget={generateTarget}
          setGenerateTarget={setGenerateTarget}
          selectedParagraphId={selectedParagraphId}
          setSelectedParagraphId={setSelectedParagraphId}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          questionType={questionType}
          setQuestionType={setQuestionType}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          showTiShiCiBianJiModal={showTiShiCiBianJiModal}
          setShowTiShiCiBianJiModal={setShowTiShiCiBianJiModal}
          loading={loading}
          error={error}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}

      {showZhuiJiaModal && (
        <ZhuiJiaTiMu
          visible={showZhuiJiaModal}
          questions={questions}
          onClose={() => setShowZhuiJiaModal(false)}
          onSuccess={handleZhuiJiaSuccess}
        />
      )}
    </div>
  );
}

function TouBuDaoHang({ chapter, onBack }: { chapter: Chapter; onBack: () => void }) {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回章节列表
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginTop: '0.5rem' }}>{chapter.title}</h1>
      </div>
    </div>
  );
}

function ShengChengTanChuang({
  paragraphs,
  generateTarget,
  setGenerateTarget,
  selectedParagraphId,
  setSelectedParagraphId,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  selectedTemplate,
  setSelectedTemplate,
  showTiShiCiBianJiModal,
  setShowTiShiCiBianJiModal,
  loading,
  error,
  onClose,
  onGenerate,
}: {
  paragraphs: Paragraph[];
  generateTarget: 'chapter' | 'paragraph' | null;
  setGenerateTarget: (t: 'chapter' | 'paragraph') => void;
  selectedParagraphId: string | null;
  setSelectedParagraphId: (id: string | null) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  questionType: QuestionTypeEnum;
  setQuestionType: (t: QuestionTypeEnum) => void;
  selectedTemplate: PromptTemplate | null;
  setSelectedTemplate: (template: PromptTemplate | null) => void;
  showTiShiCiBianJiModal: boolean;
  setShowTiShiCiBianJiModal: (show: boolean) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onGenerate: () => void;
}) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={onClose}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', maxWidth: '32rem', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>AI 生成题目</h2>

          {error && <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>选择出题范围</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => { setGenerateTarget('chapter'); setSelectedParagraphId(null); }}
                style={{
                  padding: '0.75rem',
                  backgroundColor: generateTarget === 'chapter' ? '#eff6ff' : '#f9fafb',
                  border: generateTarget === 'chapter' ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 500, color: '#111827' }}>基于整章内容</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>使用章节的全部内容生成题目</div>
              </button>
              {paragraphs.length > 0 && (
                <button
                  onClick={() => setGenerateTarget('paragraph')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: generateTarget === 'paragraph' ? '#eff6ff' : '#f9fafb',
                    border: generateTarget === 'paragraph' ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontWeight: 500, color: '#111827' }}>基于段落内容</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>选择特定段落生成题目</div>
                </button>
              )}
            </div>
          </div>

          {generateTarget === 'paragraph' && paragraphs.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>选择段落</label>
              <div style={{ maxHeight: '10rem', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                {paragraphs.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParagraphId(p.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: selectedParagraphId === p.id ? '#eff6ff' : 'transparent',
                      borderBottom: i < paragraphs.length - 1 ? '1px solid #f3f4f6' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: '#111827' }}>段落 {i + 1}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>({p.content.length} 字)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generateTarget === 'paragraph' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>题型选择</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {TI_XING.map(type => (
                  <button
                    key={type}
                    onClick={() => { setQuestionType(type); setSelectedTemplate(null); }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: questionType === type ? '#3b82f6' : '#f9fafb',
                      color: questionType === type ? '#ffffff' : '#374151',
                      border: questionType === type ? 'none' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {generateTarget === 'paragraph' && (
            <div style={{ marginBottom: '1rem' }}>
              <TiShiCiMoBan
                questionType={questionType}
                onSelect={(template) => setSelectedTemplate(template)}
                onCreateCustom={() => setShowTiShiCiBianJiModal(true)}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>难度</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
              <option value="基础">基础</option>
              <option value="中等">中等</option>
              <option value="进阶">进阶</option>
              <option value="挑战">挑战</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#374151', cursor: 'pointer' }}>取消</button>
            <button
              onClick={onGenerate}
              disabled={loading || !generateTarget || (generateTarget === 'paragraph' && !selectedParagraphId)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: (loading || !generateTarget || (generateTarget === 'paragraph' && !selectedParagraphId)) ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                cursor: (loading || !generateTarget || (generateTarget === 'paragraph' && !selectedParagraphId)) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '生成中...' : '生成题目'}
            </button>
          </div>
        </div>
      </div>

      {showTiShiCiBianJiModal && (
        <TiShiCiBianJi
          questionType={questionType}
          onClose={() => setShowTiShiCiBianJiModal(false)}
          onSave={(template) => {
            setSelectedTemplate(template);
            setShowTiShiCiBianJiModal(false);
          }}
        />
      )}
    </>
  );
}
