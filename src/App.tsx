import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './hooks';
import { BookShelf } from './components/BookShelf';
import { BookDetail } from './components/BookDetail';
import { PracticeMode } from './components/PracticeMode';
import { SettingsPage } from './components/SettingsPage';
import { AuthPage } from './components/AuthPage';
import { getResponsiveValue } from './utils/responsive';
import { authService } from './services/supabaseAuth';
import type { Book } from './types';

type Page = 'shelf' | 'detail' | 'practice' | 'settings';

function AppContent() {
  const { settings } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('shelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [practiceMode, setPracticeMode] = useState<'standard' | 'concept' | 'wrong'>('standard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    
    if (settings.darkMode) {
      html.classList.add('dark');
      html.classList.add('dark-mode-transition');
    } else {
      html.classList.remove('dark');
      html.classList.add('dark-mode-transition');
    }
    
    const timer = setTimeout(() => {
      html.classList.remove('dark-mode-transition');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [settings.darkMode]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage('detail');
  };

  const handleStartPractice = (mode: 'standard' | 'concept' | 'wrong') => {
    setPracticeMode(mode);
    setCurrentPage('practice');
  };

  const handleBackToShelf = () => {
    setSelectedBook(null);
    setCurrentPage('shelf');
  };

  const handleBackToDetail = () => {
    setCurrentPage('detail');
  };

  const handleLogout = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setSelectedBook(null);
      setCurrentPage('shelf');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280', margin: 0 }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb' }}>
      {currentPage !== 'shelf' && currentPage !== 'settings' && (
        <div style={{ position: 'fixed', top: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }), right: getResponsiveValue({ mobile: '0.5rem', tablet: '1rem' }), zIndex: 50 }}>
          <button
            onClick={() => setCurrentPage('settings')}
            style={{
              padding: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
              backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
              borderRadius: '9999px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), height: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), color: settings.darkMode ? '#9ca3af' : '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {currentPage === 'shelf' && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCurrentPage('settings')}
            style={{
              position: 'fixed',
              top: getResponsiveValue({ mobile: '0.75rem', tablet: '1.5rem' }),
              right: getResponsiveValue({ mobile: '0.75rem', tablet: '1.5rem' }),
              zIndex: 50,
              padding: getResponsiveValue({ mobile: '0.375rem', tablet: '0.5rem' }),
              backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
              borderRadius: '9999px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), height: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), color: settings.darkMode ? '#9ca3af' : '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <BookShelf onSelectBook={handleSelectBook} />
        </div>
      )}

      {currentPage === 'detail' && selectedBook && (
        <BookDetail
          book={selectedBook}
          onBack={handleBackToShelf}
          onStartPractice={handleStartPractice}
        />
      )}

      {currentPage === 'practice' && selectedBook && (
        <PracticeMode
          book={selectedBook}
          mode={practiceMode}
          onBack={handleBackToDetail}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage onBack={handleBackToShelf} onLogout={handleLogout} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
