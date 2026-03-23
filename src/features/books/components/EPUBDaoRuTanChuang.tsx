// @审计已完成
// EPUB 导入弹窗 - 显示解析结果，可编辑、选择章节

import { useState, useRef } from 'react';
import { jieXiEPUB, type EPUBMetadata, type EPUBChapter } from '@shared/utils/epubParser';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface EPUBDaoRuTanChuangProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { metadata: EPUBMetadata; chapters: EPUBChapter[] }) => void;
  darkMode: boolean;
}

export function EPUBDaoRuTanChuang({ isOpen, onClose, onConfirm, darkMode }: EPUBDaoRuTanChuangProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<EPUBMetadata | null>(null);
  const [chapters, setChapters] = useState<EPUBChapter[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.epub')) {
      showError('请选择 EPUB 文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await jieXiEPUB(file);
      setMetadata(result.metadata);
      setChapters(result.chapters);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'EPUB 解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    setChapters(prev => prev.map((c, i) => i === index ? { ...c, title: newTitle } : c));
  };

  const handleToggleChapter = (index: number) => {
    setChapters(prev => prev.map((c, i) => i === index ? { ...c, selected: !c.selected } : c));
  };

  const handleSelectAll = () => {
    setChapters(prev => prev.map(c => ({ ...c, selected: true })));
  };

  const handleDeselectAll = () => {
    setChapters(prev => prev.map(c => ({ ...c, selected: false })));
  };

  const handleConfirm = () => {
    const selectedChapters = chapters.filter(c => c.selected);
    if (selectedChapters.length === 0) {
      showError('请至少选择一个章节');
      return;
    }

    onConfirm({ metadata: metadata!, chapters: selectedChapters });
    handleReset();
  };

  const handleReset = () => {
    setStep('upload');
    setMetadata(null);
    setChapters([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const selectedCount = chapters.filter(c => c.selected).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      padding: '1rem',
    }} onClick={handleClose}>
      <div style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '42rem',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }} onClick={e => e.stopPropagation()}>
        
        {step === 'upload' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>
                导入 EPUB 电子书
              </h2>
              <button onClick={handleClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <label
              htmlFor="epub-file-input"
              style={{
                display: 'block',
                border: `2px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                padding: '3rem',
                textAlign: 'center',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'border-color 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <input
                id="epub-file-input"
                type="file"
                accept=".epub"
                onChange={handleFileSelect}
                disabled={loading}
                style={{ display: 'none' }}
              />
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <JiaZaiZhuangTai chiCun="large" />
                  <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>正在解析 EPUB 文件...</p>
                </div>
              ) : (
                <>
                  <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: darkMode ? '#6b7280' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p style={{ marginTop: '1rem', color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
                    点击选择 EPUB 文件
                  </p>
                  <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
                    支持标准 EPUB 格式，将自动解析书名、作者和章节
                  </p>
                </>
              )}
            </label>
          </>
        )}

        {step === 'preview' && metadata && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>
                确认导入信息
              </h2>
              <button onClick={handleClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{ backgroundColor: darkMode ? '#374151' : '#f9fafb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.5rem' }}>书籍信息</h3>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>{metadata.title || '未知书名'}</p>
              <p style={{ fontSize: '0.875rem', color: darkMode ? '#d1d5db' : '#6b7280', marginTop: '0.25rem' }}>
                作者：{metadata.author || '未知'} {metadata.publisher && `| 出版社：${metadata.publisher}`}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  章节列表 ({selectedCount}/{chapters.length} 已选择)
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSelectAll} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                    全选
                  </button>
                  <button onClick={handleDeselectAll} style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                    取消全选
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '16rem', overflowY: 'auto', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '0.5rem' }}>
                {chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderBottom: index < chapters.length - 1 ? `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` : 'none',
                      backgroundColor: chapter.selected ? (darkMode ? '#1e3a5f' : '#eff6ff') : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={chapter.selected}
                      onChange={() => handleToggleChapter(index)}
                      style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', minWidth: '3rem' }}>
                      第 {index + 1} 章
                    </span>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.25rem 0.5rem',
                        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '0.25rem',
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        color: darkMode ? '#f9fafb' : '#111827',
                        fontSize: '0.875rem',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                      {chapter.content.length} 字
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '0.5rem',
                  backgroundColor: 'transparent',
                  color: darkMode ? '#e5e7eb' : '#374151',
                  cursor: 'pointer',
                }}
              >
                重新选择
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedCount === 0}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedCount === 0 ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                确认导入 ({selectedCount} 章)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
