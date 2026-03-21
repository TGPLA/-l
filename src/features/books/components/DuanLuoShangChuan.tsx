import { useState, useRef } from 'react';
import type { Paragraph } from '@infrastructure/types';
import { paragraphService } from '@shared/services/paragraphService';

interface DuanLuoShangChuanProps {
  chapterId: string;
  onSuccess: (paragraphs: Paragraph[]) => void;
  onClose: () => void;
}

export function DuanLuoShangChuan({ chapterId, onSuccess, onClose }: DuanLuoShangChuanProps) {
  const [mode, setMode] = useState<'manual' | 'file'>('manual');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = async () => {
    if (!content.trim()) {
      setError('请输入段落内容');
      return;
    }

    setLoading(true);
    setError(null);

    const { paragraph, error: submitError } = await paragraphService.createParagraph({
      chapterId,
      content: content.trim(),
    });

    setLoading(false);

    if (submitError || !paragraph) {
      setError(submitError?.message || '创建失败');
      return;
    }

    onSuccess([paragraph]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'application/epub+zip'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.epub')) {
      setError('仅支持 TXT 或 EPUB 文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const paragraphs = text
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (paragraphs.length === 0) {
        setError('文件内容为空');
        setLoading(false);
        return;
      }

      const { paragraphs: createdParagraphs, error: submitError } = 
        await paragraphService.batchCreateParagraphs(chapterId, paragraphs);

      setLoading(false);

      if (submitError) {
        setError(submitError.message);
        return;
      }

      onSuccess(createdParagraphs);
    } catch {
      setLoading(false);
      setError('文件读取失败');
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
        maxWidth: '36rem',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>添加段落</h2>
          <button onClick={onClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setMode('manual')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: mode === 'manual' ? '#3b82f6' : '#f3f4f6',
              color: mode === 'manual' ? '#ffffff' : '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            手动输入
          </button>
          <button
            onClick={() => setMode('file')}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: mode === 'file' ? '#3b82f6' : '#f3f4f6',
              color: mode === 'file' ? '#ffffff' : '#374151',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            上传文件
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {mode === 'manual' ? (
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              段落内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入段落内容..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                minHeight: '12rem',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={onClose}
                style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                取消
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={loading || !content.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: loading || !content.trim() ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>点击上传 TXT 或 EPUB 文件</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>文件内容将按空行分割为多个段落</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.epub"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {loading && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280' }}>
                正在处理文件...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
