// @审计已完成
// 应用主组件 - 页面路由和全局状态管理

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@infrastructure/hooks';
import { BookShelf } from '@features/books/components/BookShelf';
import { BookDetail } from '@features/books/components/BookDetail';
import { DaTiZhu } from '@features/practice/DaTiZhu';
import { SettingsPage } from '@features/user/components/SettingsPage';
import { TiShiCiGuanLi } from '@features/user/components/TiShiCiGuanLi';
import { AuthPage } from '@features/user/components/AuthPage';
import { authService } from '@shared/services/auth';
import { ToastContainer } from '@shared/utils/common/ToastTiShi';
import { QuanPingJiaZai } from '@shared/utils/common/JiaZaiZhuangTai';
import { CuoWuBianJie } from '@shared/utils/common/CuoWuBianJie';
import type { Book, Paragraph, Question } from '@infrastructure/types';

type Page = 'shelf' | 'detail' | 'practice' | 'answer' | 'settings' | 'prompts';

function AppContent() {
  const { settings } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('shelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<Paragraph | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
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
    } else {
      html.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentPage('detail');
  };

  const handleBackToShelf = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
    setSelectedParagraph(null);
    setPracticeQuestions([]);
  };

  const handleStartPractice = (paragraph: Paragraph, questions: Question[]) => {
    setSelectedParagraph(paragraph);
    setPracticeQuestions(questions);
    setCurrentPage('answer');
  };

  const handleBackToDetail = () => {
    setCurrentPage('detail');
    setSelectedParagraph(null);
    setPracticeQuestions([]);
  };

  const handleComplete = () => {
    setCurrentPage('detail');
    setSelectedParagraph(null);
    setPracticeQuestions([]);
  };

  if (isLoading) {
    return <QuanPingJiaZai wenAn="加载应用..." />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb' }}>
      {currentPage === 'shelf' && (
        <BookShelf onSelectBook={handleSelectBook} onOpenSettings={() => setCurrentPage('settings')} />
      )}
      {currentPage === 'detail' && selectedBook && (
        <BookDetail book={selectedBook} onBack={handleBackToShelf} onStartPractice={handleStartPractice} />
      )}
      {currentPage === 'answer' && selectedParagraph && practiceQuestions.length > 0 && (
        <DaTiZhu paragraph={selectedParagraph} questions={practiceQuestions} onComplete={handleComplete} />
      )}
      {currentPage === 'settings' && <SettingsPage onBack={handleBackToShelf} onOpenPrompts={() => setCurrentPage('prompts')} />}
      {currentPage === 'prompts' && <TiShiCiGuanLi onBack={() => setCurrentPage('settings')} />}
    </div>
  );
}

function App() {
  return (
    <CuoWuBianJie>
      <AppProvider>
        <AppContent />
        <ToastContainer />
      </AppProvider>
    </CuoWuBianJie>
  );
}

export default App;
