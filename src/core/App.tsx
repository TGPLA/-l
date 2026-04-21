// @审计已完成
// 应用主组件 - 页面路由和全局状态管理

import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@infrastructure/hooks';
import { BookShelf } from '@features/books/components/BookShelf';
import { EPUBReaderPage } from '@features/books/components/EPUBReaderPage';
import { FuShuXueXi } from '@features/practice/FuShuXueXi';
import { GaiNianJieShi } from '@features/practice/GaiNianJieShi';
import { SettingsPage } from '@features/user/components/SettingsPage';
import { TiShiCiGuanLi } from '@features/user/components/TiShiCiGuanLi';
import { AuthPage } from '@features/user/components/AuthPage';
import { BackendUnavailable } from '@features/user/components/BackendUnavailable';
import { authService } from '@shared/services/auth';
import { checkBackendHealth } from '@shared/services/healthCheck';
import { ToastContainer } from '@shared/utils/common/ToastTiShi';
import { QuanPingJiaZai } from '@shared/utils/common/JiaZaiZhuangTai';
import { CuoWuBianJie } from '@shared/utils/common/CuoWuBianJie';
import type { Book, Question } from '@infrastructure/types';

type Page = 'shelf' | 'reader' | 'settings' | 'prompts' | 'concept-learning' | 'concept-explanation';

interface LearningSource {
  chapterId?: string;
  paragraphId?: string;
  content: string;
  explanation?: string;
  isConcept?: boolean;
}

function AppContent() {
  const { settings } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('shelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedParagraph, setSelectedParagraph] = useState<{ id: string; content: string } | null>(null);
  const [learningSource, setLearningSource] = useState<LearningSource | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(true);

  useEffect(() => {
    const checkBackend = async (showLoading: boolean = false) => {
      if (showLoading) {
        setCheckingBackend(true);
      }
      const status = await checkBackendHealth();
      setIsBackendAvailable(status.isBackendAvailable);
      if (showLoading) {
        setCheckingBackend(false);
      }
    };
    
    checkBackend(true);
    const interval = setInterval(() => checkBackend(false), 30000);
    
    const unsubscribe = authService.onAuthChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
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
    setCurrentPage('reader');
  };

  const handleCloseReader = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleBackToShelf = () => {
    setCurrentPage('shelf');
    setSelectedBook(null);
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleStartConceptLearning = (source: LearningSource) => {
    setLearningSource(source);
    setCurrentPage('concept-learning');
  };

  const handleFuShuXueXi = (text: string) => {
    setLearningSource({ content: text });
    setCurrentPage('concept-learning');
  };

  const handleGaiNianJieShi = (text: string) => {
    setLearningSource({ content: text });
    setCurrentPage('concept-explanation');
  };

  const handleStartFuShuFromJieShi = (explanation: string) => {
    // 从概念解释页面跳转到复述学习，保存 explanation
    console.log('[DEBUG] handleStartFuShuFromJieShi called');
    console.log('[DEBUG] Current learningSource:', learningSource);
    console.log('[DEBUG] Explanation to pass:', explanation);
    
    const newSource = learningSource ? { ...learningSource, explanation, isConcept: true } : null;
    console.log('[DEBUG] New learningSource:', newSource);
    
    setLearningSource(newSource);
    setCurrentPage('concept-learning');
  };

  const handleBackToDetail = () => {
    setCurrentPage('reader');
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  const handleComplete = () => {
    setCurrentPage('reader');
    setSelectedParagraph(null);
    setLearningSource(null);
    setPracticeQuestions([]);
  };

  if (isLoading || checkingBackend) {
    return <QuanPingJiaZai wenAn="加载应用..." />;
  }

  if (!isBackendAvailable) {
    return <BackendUnavailable darkMode={settings.darkMode} />;
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', position: 'relative', overflow: 'hidden' }}>
      {/* 书架页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'shelf' ? 1 : 0, 
        pointerEvents: currentPage === 'shelf' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'shelf' ? 1 : 0
      }}>
        {currentPage === 'shelf' && (
          <BookShelf onSelectBook={handleSelectBook} onOpenSettings={() => setCurrentPage('settings')} />
        )}
      </div>

      {/* 阅读器页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'reader' ? 1 : 0, 
        pointerEvents: currentPage === 'reader' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'reader' ? 2 : 1
      }}>
        {selectedBook && (
          <EPUBReaderPage
            book={selectedBook}
            onClose={handleCloseReader}
            onFuShuXueXi={handleFuShuXueXi}
            onGaiNianJieShi={handleGaiNianJieShi}
          />
        )}
      </div>

      {/* 复述学习页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'concept-learning' ? 1 : 0, 
        pointerEvents: currentPage === 'concept-learning' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'concept-learning' ? 3 : 1
      }}>
        {currentPage === 'concept-learning' && learningSource && selectedBook && (
          <FuShuXueXi 
            key={learningSource.chapterId ? `chapter-${learningSource.chapterId}` : `paragraph-${learningSource.paragraphId}`}
            bookId={selectedBook.id}
            chapterId={learningSource.chapterId}
            paragraphId={learningSource.paragraphId}
            content={learningSource.content}
            explanation={learningSource.explanation}
            isConcept={learningSource.isConcept}
            onComplete={handleComplete}
            onBack={handleBackToDetail}
          />
        )}
      </div>

      {/* 概念解释页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'concept-explanation' ? 1 : 0, 
        pointerEvents: currentPage === 'concept-explanation' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'concept-explanation' ? 3 : 1
      }}>
        {currentPage === 'concept-explanation' && learningSource && selectedBook && (
          <GaiNianJieShi 
            bookId={selectedBook.id}
            content={learningSource.content}
            onComplete={handleComplete}
            onBack={handleBackToDetail}
            onStartFuShu={handleStartFuShuFromJieShi}
          />
        )}
      </div>

      {/* 设置页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'settings' ? 1 : 0, 
        pointerEvents: currentPage === 'settings' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'settings' ? 2 : 0,
        overflowY: 'auto',
      }}>
        {currentPage === 'settings' && <SettingsPage onBack={handleBackToShelf} onOpenPrompts={() => setCurrentPage('prompts')} />}
      </div>

      {/* 提示词管理页面 */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        opacity: currentPage === 'prompts' ? 1 : 0, 
        pointerEvents: currentPage === 'prompts' ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-in-out',
        zIndex: currentPage === 'prompts' ? 3 : 0
      }}>
        {currentPage === 'prompts' && <TiShiCiGuanLi onBack={() => setCurrentPage('settings')} />}
      </div>
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
