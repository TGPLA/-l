import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Book, Question, Settings } from '../types';
import { storage } from '../store';
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

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.saveSettings(settings);
  }, [settings]);

  const refreshBooks = useCallback(() => setBooks(storage.getBooks()), []);
  const refreshQuestions = useCallback(() => setQuestions(storage.getQuestions()), []);
  const updateSettings = useCallback((newSettings: Settings) => setSettings(newSettings), []);

  const addBook = useCallback((book: Omit<Book, 'id' | 'createdAt' | 'questionCount' | 'masteredCount'>) => {
    const newBook = storage.addBook(book);
    refreshBooks();
    return newBook;
  }, [refreshBooks]);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    const result = storage.updateBook(id, updates);
    refreshBooks();
    return result;
  }, [refreshBooks]);

  const deleteBook = useCallback((id: string) => {
    const result = storage.deleteBook(id);
    refreshBooks();
    refreshQuestions();
    return result;
  }, [refreshBooks, refreshQuestions]);

  const addQuestion = useCallback((question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => {
    const newQuestion = storage.addQuestion(question);
    refreshQuestions();
    refreshBooks();
    return newQuestion;
  }, [refreshQuestions, refreshBooks]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    const result = storage.updateQuestion(id, updates);
    refreshQuestions();
    refreshBooks();
    return result;
  }, [refreshQuestions, refreshBooks]);

  const deleteQuestion = useCallback((id: string) => {
    const result = storage.deleteQuestion(id);
    refreshQuestions();
    refreshBooks();
    return result;
  }, [refreshQuestions, refreshBooks]);

  const getQuestionsByBook = useCallback((bookId: string) => storage.getQuestionsByBook(bookId), []);

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
