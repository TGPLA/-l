import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './hooks';
import { BookShelf } from './components/BookShelf';
import { BookDetail } from './components/BookDetail';
import { PracticeMode } from './components/PracticeMode';
import { SettingsPage } from './components/SettingsPage';
import { AuthPage } from './components/AuthPage';
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

  const handleBackToShelf = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
  };

  const handleBackToDetail = () => {
    setCurrentPage('detail');
  };

  const handleStartPractice = (mode: 'standard' | 'concept' | 'wrong') => {
    setPracticeMode(mode);
    setCurrentPage('practice');
  };

  const handleOpenSettings = () => {
    setCurrentPage('settings');
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: settings.darkMode ? '#111827' : '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid', 
            borderColor: settings.darkMode ? '#3b82f6' : '#60a5fa', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            margin: '0 auto 1rem', 
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb' }}>
      {currentPage === 'shelf' && (
        <BookShelf 
          onSelectBook={handleSelectBook}
          onOpenSettings={handleOpenSettings}
        />
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
        <SettingsPage onBack={handleBackToShelf} />
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