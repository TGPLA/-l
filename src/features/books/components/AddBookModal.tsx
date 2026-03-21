// @审计已完成
// 添加书籍弹窗组件

import { useState } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { Book } from '@infrastructure/types';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book;
  darkMode: boolean;
}

export function AddBookModal({ isOpen, onClose, book, darkMode }: AddBookModalProps) {
  const { addBook, updateBook } = useApp();
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setLoading(true);
    try {
      if (book) {
        await updateBook(book.id, {
          title: title.trim(),
          author: author.trim(),
          coverUrl: coverUrl.trim() || undefined,
        });
        showSuccess('书籍更新成功');
      } else {
        await addBook({
          title: title.trim(),
          author: author.trim(),
          coverUrl: coverUrl.trim() || undefined,
        });
        showSuccess('书籍添加成功');
      }

      setTitle('');
      setAuthor('');
      setCoverUrl('');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
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
    }}>
      <div style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '28rem',
        width: '100%',
        padding: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>
          {book ? '编辑书籍' : '添加新书籍'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
              书名 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#f9fafb' : '#111827',
              }}
              placeholder="请输入书名"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
              作者 *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#f9fafb' : '#111827',
              }}
              placeholder="请输入作者"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
              封面链接（可选）
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#f9fafb' : '#111827',
              }}
              placeholder="https://example.com/cover.jpg"
              disabled={loading}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'transparent',
                color: darkMode ? '#e5e7eb' : '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '处理中...' : (book ? '保存' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
