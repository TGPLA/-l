// @审计已完成
// 书架主组件 - 显示书籍列表

import { useState } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { Book } from '@infrastructure/types';
import { getResponsiveValue } from '@shared/utils/responsive';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';
import { BookCard } from './BookCard';
import { AddBookModal } from './AddBookModal';
import { EPUBDaoRuTanChuang } from './EPUBDaoRuTanChuang';
import { chapterService } from '@shared/services/chapterService';
import type { EPUBMetadata, EPUBChapter } from '@shared/utils/epubParser';

interface BookShelfProps {
  onSelectBook: (book: Book) => void;
  onOpenSettings: () => void;
}

export function BookShelf({ onSelectBook, onOpenSettings }: BookShelfProps) {
  const { books, deleteBook, settings, isLoading, addBook } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEPUBModal, setShowEPUBModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();
  const [importing, setImporting] = useState(false);

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    const confirmed = window.confirm(`确定要删除《${bookTitle}》吗？这将同时删除该书的所有问题。`);
    if (!confirmed) return;

    try {
      await deleteBook(bookId);
      showSuccess('书籍删除成功');
    } catch (error) {
      showError(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingBook(undefined);
  };

  const handleEPUBImport = async (data: { metadata: EPUBMetadata; chapters: EPUBChapter[] }) => {
    setImporting(true);
    try {
      const newBook = await addBook({
        title: data.metadata.title || '未命名书籍',
        author: data.metadata.author || '未知作者',
      });

      if (!newBook) {
        throw new Error('创建书籍失败');
      }

      let successCount = 0;
      let skipCount = 0;
      for (const chapter of data.chapters) {
        if (!chapter.content || chapter.content.trim() === '') {
          skipCount++;
          continue;
        }
        const result = await chapterService.createChapter({
          bookId: newBook.id,
          title: chapter.title,
          content: chapter.content,
          orderIndex: chapter.orderIndex,
        });
        if (!result.error) {
          successCount++;
        }
      }

      const message = skipCount > 0
        ? `导入成功！创建书籍《${newBook.title}》，包含 ${successCount} 个章节（跳过 ${skipCount} 个空章节）`
        : `导入成功！创建书籍《${newBook.title}》，包含 ${successCount} 个章节`;
      showSuccess(message);
      setShowEPUBModal(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  if (isLoading || importing) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <JiaZaiZhuangTai wenAn={importing ? "正在导入 EPUB..." : "加载书架..."} chiCun="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }), flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '1rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) }}>
          <div>
            <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.5rem', tablet: '1.875rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827' }}>📚 阅读回响</h1>
            <p style={{ color: settings.darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>通过主动回忆，加深书籍理解</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setEditingBook(undefined); setShowAddModal(true); }}
              style={{
                padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                backgroundColor: '#3b82f6',
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
              添加书籍
            </button>
            <button
              onClick={() => setShowEPUBModal(true)}
              style={{
                padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                backgroundColor: '#8b5cf6',
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              导入 EPUB
            </button>
            <button
              onClick={onOpenSettings}
              style={{
                padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }),
                backgroundColor: settings.darkMode ? '#374151' : '#e5e7eb',
                color: settings.darkMode ? '#f9fafb' : '#111827',
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
          </div>
        </div>

        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: getResponsiveValue({ mobile: '3rem 0', tablet: '5rem 0' }) }}>
            <div style={{ fontSize: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), marginBottom: '1rem' }}>📖</div>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 600, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>书架空空如也</h2>
            <p style={{ color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>添加第一本书开始你的阅读之旅</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => { setEditingBook(undefined); setShowAddModal(true); }}
                style={{
                  padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }),
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                }}
              >
                添加书籍
              </button>
              <button
                onClick={() => setShowEPUBModal(true)}
                style={{
                  padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }),
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }),
                }}
              >
                导入 EPUB
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: getResponsiveValue({ mobile: 'repeat(auto-fill, minmax(140px, 1fr))', tablet: 'repeat(auto-fill, minmax(180px, 1fr))' }),
            gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' })
          }}>
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onSelectBook(book)}
                onDelete={() => handleDeleteBook(book.id, book.title)}
                onEdit={() => handleEditBook(book)}
                darkMode={settings.darkMode}
              />
            ))}
          </div>
        )}
      </div>

      <AddBookModal
        key={editingBook?.id || 'new'}
        isOpen={showAddModal}
        onClose={handleCloseModal}
        book={editingBook}
        darkMode={settings.darkMode}
      />

      <EPUBDaoRuTanChuang
        isOpen={showEPUBModal}
        onClose={() => setShowEPUBModal(false)}
        onConfirm={handleEPUBImport}
        darkMode={settings.darkMode}
      />
    </div>
  );
}
