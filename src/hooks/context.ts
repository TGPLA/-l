import { createContext } from 'react';
import type { Book, Question, Settings } from '../types';

interface AppContextType {
  books: Book[];
  questions: Question[];
  settings: Settings;
  refreshBooks: () => Promise<void>;
  refreshQuestions: () => Promise<void>;
  updateSettings: (settings: Settings) => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'questionCount' | 'masteredCount'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<Book | null>;
  deleteBook: (id: string) => Promise<boolean>;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => Promise<Question>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<Question | null>;
  deleteQuestion: (id: string) => Promise<boolean>;
  getQuestionsByBook: (bookId: string) => Question[];
}

export const AppContext = createContext<AppContextType | null>(null);
