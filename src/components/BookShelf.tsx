import { useState, useEffect } from 'react';
import { useApp } from '../hooks';
import type { Book } from '../types';
import { getResponsiveValue } from '../utils/responsive';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  darkMode: boolean;
}

export function BookCard({ book, onClick, onDelete, onEdit, darkMode }: BookCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  const progress = book.questionCount > 0 
    ? Math.round((book.masteredCount / book.questionCount) * 100) 
    : 0;

  return (
    <div 
      style={{
        position: 'relative',
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        setShowDelete(true);
        setShowEdit(true);
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        setShowDelete(false);
        setShowEdit(false);
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
      }}
    >
      <div onClick={onClick} style={{ padding: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>
        <div style={{
          aspectRatio: '3/4',
          background: darkMode ? 'linear-gradient(to bottom right, #1e3a5f, #2d1f4e)' : 'linear-gradient(to bottom right, #dbeafe, #f3e8ff)',
          borderRadius: '0.5rem',
          marginBottom: getResponsiveValue({ mobile: '0.5rem', tablet: '0.75rem' }),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg style={{ width: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), height: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), color: darkMode ? '#6b7280' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <h3 style={{ fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '1rem' }) }}>{book.title}</h3>
        <p style={{ fontSize: getResponsiveValue({ mobile: '0.75rem', tablet: '0.875rem' }), color: darkMode ? '#9ca3af' : '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</p>
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '0.25rem' }}>
            <span>掌握进度</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '0.5rem', backgroundColor: darkMode ? '#374151' : '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                transition: 'width 0.3s',
                width: `${progress}%` 
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: darkMode ? '#6b7280' : '#9ca3af', marginTop: '0.25rem' }}>
            {book.questionCount} 道题目
          </p>
        </div>
      </div>
      
      {showEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            position: 'absolute',
            top: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
            left: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
            padding: '0.375rem',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
      
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
            right: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
            padding: '0.375rem',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: Book;
  darkMode: boolean;
}

export function AddBookModal({ isOpen, onClose, book, darkMode }: AddBookModalProps) {
  const { addBook, updateBook } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setCoverUrl(book.coverUrl || '');
    } else {
      setTitle('');
      setAuthor('');
      setCoverUrl('');
    }
  }, [book, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    
    if (book) {
      updateBook(book.id, {
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl.trim() || undefined,
      });
    } else {
      addBook({
        title: title.trim(),
        author: author.trim(),
        coverUrl: coverUrl.trim() || undefined,
      });
    }
    
    setTitle('');
    setAuthor('');
    setCoverUrl('');
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
                color: darkMode ? '#e5e7eb' : '#374151',
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
              {book ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BookShelfProps {
  onSelectBook: (book: Book) => void;
}

export function BookShelf({ onSelectBook }: BookShelfProps) {
  const { books, deleteBook, settings } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    const confirmed = await confirm(`确定要删除《${bookTitle}》吗？这将同时删除该书的所有问题。`);
    if (confirmed) {
      deleteBook(bookId);
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }), flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '1rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) }}>
          <div>
            <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.5rem', tablet: '1.875rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827' }}>📚 阅读回响</h1>
            <p style={{ color: settings.darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>通过主动回忆，加深书籍理解</p>
          </div>
          <button
            onClick={() => {
              setEditingBook(undefined);
              setShowAddModal(true);
            }}
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
        </div>

        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: getResponsiveValue({ mobile: '3rem 0', tablet: '5rem 0' }) }}>
            <div style={{ fontSize: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), marginBottom: '1rem' }}>📖</div>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 600, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>书架空空如也</h2>
            <p style={{ color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>添加第一本书开始你的阅读之旅</p>
            <button
              onClick={() => {
                setEditingBook(undefined);
                setShowAddModal(true);
              }}
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

      <AddBookModal isOpen={showAddModal} onClose={handleCloseModal} book={editingBook} darkMode={settings.darkMode} />
    </div>
  );
}
