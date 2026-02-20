import { createContext } from 'react';
import type { Book, Question, Settings } from '../types';

interface AppContextType {
  books: Book[];
  questions: Question[];
  settings: Settings;
  refreshBooks: () => void;
  refreshQuestions: () => void;
  updateSettings: (settings: Settings) => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'questionCount' | 'masteredCount'>) => Book;
  updateBook: (id: string, updates: Partial<Book>) => Book | null;
  deleteBook: (id: string) => boolean;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => Question | null;
  deleteQuestion: (id: string) => boolean;
  getQuestionsByBook: (bookId: string) => Question[];
}

export const AppContext = createContext<AppContextType | null>(null);
