// @审计已完成
// 书籍卡片组件 - 显示单本书籍信息

import { useState } from 'react';
import type { Book } from '@infrastructure/types';
import { getResponsiveValue } from '@shared/utils/responsive';

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
        <p style={{ fontSize: '0.75rem', color: darkMode ? '#6b7280' : '#9ca3af', marginTop: '0.5rem' }}>
          {book.questionCount} 道题目
        </p>
      </div>

      {showEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
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
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
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
