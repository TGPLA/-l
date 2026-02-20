import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Book, Question, Settings } from '../types';
import { storage } from '../store';
import { authService } from '../services/supabaseAuth';
import { databaseService } from '../services/database';
import { AppContext } from './context';

function getInitialSettings(): Settings {
  const settings = storage.getSettings();
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  }
  return settings;
}

function getInitialBooks(): Book[] {
  return storage.getBooks();
}

function getInitialQuestions(): Question[] {
  return storage.getQuestions();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>(getInitialBooks);
  const [questions, setQuestions] = useState<Question[]>(getInitialQuestions);
  const [settings, setSettings] = useState<Settings>(getInitialSettings);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        databaseService.setUserId(user.id);
        loadUserData();
      } else {
        setIsAuthenticated(false);
        databaseService.setUserId('');
        setBooks([]);
        setQuestions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (isAuthenticated) {
      databaseService.updateUserSettings(settings);
    } else {
      storage.saveSettings(settings);
    }
  }, [settings, isAuthenticated]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const { books: dbBooks, error: booksError } = await databaseService.getAllBooks();
      if (!booksError) {
        setBooks(dbBooks);
        
        const allQuestions: Question[] = [];
        for (const book of dbBooks) {
          const { questions: bookQuestions, error } = await databaseService.getQuestionsByBook(book.id);
          if (!error) {
            allQuestions.push(...bookQuestions);
          }
        }
        setQuestions(allQuestions);
      }

      const { settings: dbSettings, error: settingsError } = await databaseService.getUserSettings();
      if (!settingsError && dbSettings) {
        setSettings(dbSettings);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBooks = useCallback(async () => {
    if (isAuthenticated) {
      const { books, error } = await databaseService.getAllBooks();
      if (!error) {
        setBooks(books);
      }
    } else {
      setBooks(storage.getBooks());
    }
  }, [isAuthenticated]);

  const refreshQuestions = useCallback(async () => {
    if (isAuthenticated) {
      const allQuestions: Question[] = [];
      for (const book of books) {
        const { questions: bookQuestions, error } = await databaseService.getQuestionsByBook(book.id);
        if (!error) {
          allQuestions.push(...bookQuestions);
        }
      }
      setQuestions(allQuestions);
    } else {
      setQuestions(storage.getQuestions());
    }
  }, [isAuthenticated, books]);

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'createdAt' | 'questionCount' | 'masteredCount'>) => {
    if (isAuthenticated) {
      const { book: newBook, error } = await databaseService.createBook({
        ...book,
        questionCount: 0,
        masteredCount: 0
      });
      if (!error && newBook) {
        setBooks(prev => [newBook, ...prev]);
        return newBook;
      }
      throw new Error(error?.message || '创建书籍失败');
    } else {
      const newBook = storage.addBook(book);
      refreshBooks();
      return newBook;
    }
  }, [isAuthenticated, refreshBooks]);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    if (isAuthenticated) {
      const { book: updatedBook, error } = await databaseService.updateBook(id, updates);
      if (!error && updatedBook) {
        setBooks(prev => prev.map(b => b.id === id ? updatedBook : b));
        return updatedBook;
      }
      throw new Error(error?.message || '更新书籍失败');
    } else {
      const result = storage.updateBook(id, updates);
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, refreshBooks]);

  const deleteBook = useCallback(async (id: string) => {
    if (isAuthenticated) {
      const { error } = await databaseService.deleteBook(id);
      if (!error) {
        setBooks(prev => prev.filter(b => b.id !== id));
        setQuestions(prev => prev.filter(q => q.bookId !== id));
        return true;
      }
      throw new Error(error?.message || '删除书籍失败');
    } else {
      const result = storage.deleteBook(id);
      refreshBooks();
      refreshQuestions();
      return result;
    }
  }, [isAuthenticated, refreshBooks, refreshQuestions]);

  const addQuestion = useCallback(async (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => {
    if (isAuthenticated) {
      const { question: newQuestion, error } = await databaseService.createQuestion({
        ...question,
        masteryLevel: '未掌握',
        practiceCount: 0
      });
      if (!error && newQuestion) {
        setQuestions(prev => [newQuestion, ...prev]);
        await updateBookQuestionCount(question.bookId, 1);
        return newQuestion;
      }
      throw new Error(error?.message || '创建题目失败');
    } else {
      const newQuestion = storage.addQuestion(question);
      refreshQuestions();
      refreshBooks();
      return newQuestion;
    }
  }, [isAuthenticated, refreshQuestions, refreshBooks]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    if (isAuthenticated) {
      const { question: updatedQuestion, error } = await databaseService.updateQuestion(id, updates);
      if (!error && updatedQuestion) {
        setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
        if (updates.masteryLevel) {
          await updateBookMasteredCount(updatedQuestion.bookId);
        }
        return updatedQuestion;
      }
      throw new Error(error?.message || '更新题目失败');
    } else {
      const result = storage.updateQuestion(id, updates);
      refreshQuestions();
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, refreshQuestions, refreshBooks]);

  const deleteQuestion = useCallback(async (id: string) => {
    if (isAuthenticated) {
      const question = questions.find(q => q.id === id);
      const { error } = await databaseService.deleteQuestion(id);
      if (!error) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        if (question) {
          await updateBookQuestionCount(question.bookId, -1);
          if (question.masteryLevel === '已掌握') {
            await updateBookMasteredCount(question.bookId);
          }
        }
        return true;
      }
      throw new Error(error?.message || '删除题目失败');
    } else {
      const result = storage.deleteQuestion(id);
      refreshQuestions();
      refreshBooks();
      return result;
    }
  }, [isAuthenticated, questions, refreshQuestions, refreshBooks]);

  const getQuestionsByBook = useCallback((bookId: string) => {
    return questions.filter(q => q.bookId === bookId);
  }, [questions]);

  const updateBookQuestionCount = async (bookId: string, delta: number) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newCount = Math.max(0, book.questionCount + delta);
      await databaseService.updateBook(bookId, { questionCount: newCount });
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, questionCount: newCount } : b));
    }
  };

  const updateBookMasteredCount = async (bookId: string) => {
    const bookQuestions = questions.filter(q => q.bookId === bookId);
    const masteredCount = bookQuestions.filter(q => q.masteryLevel === '已掌握').length;
    await databaseService.updateBook(bookId, { masteredCount });
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, masteredCount } : b));
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const unsubscribeBooks = databaseService.subscribeToBooks((updatedBooks) => {
        setBooks(updatedBooks);
      });

      return () => {
        unsubscribeBooks();
      };
    }
  }, [isAuthenticated, isLoading]);

  return (
    <AppContext.Provider value={{
      books,
      questions,
      settings,
      refreshBooks,
      refreshQuestions,
      updateSettings,
      addBook,
      updateBook,
      deleteBook,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      getQuestionsByBook,
    }}>
      {children}
    </AppContext.Provider>
  );
}
