import type { Book, Question, Settings } from '../types';

const BOOKS_KEY = 'readrecall_books';
const QUESTIONS_KEY = 'readrecall_questions';
const SETTINGS_KEY = 'readrecall_settings';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const storage = {
  getBooks(): Book[] {
    try {
      const data = localStorage.getItem(BOOKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveBooks(books: Book[]): void {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  },

  addBook(book: Omit<Book, 'id' | 'createdAt' | 'questionCount' | 'masteredCount'>): Book {
    const books = this.getBooks();
    const newBook: Book = {
      ...book,
      id: generateId(),
      createdAt: Date.now(),
      questionCount: 0,
      masteredCount: 0,
    };
    books.push(newBook);
    this.saveBooks(books);
    return newBook;
  },

  updateBook(id: string, updates: Partial<Book>): Book | null {
    const books = this.getBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return null;
    books[index] = { ...books[index], ...updates };
    this.saveBooks(books);
    return books[index];
  },

  deleteBook(id: string): boolean {
    const books = this.getBooks();
    const filtered = books.filter(b => b.id !== id);
    if (filtered.length === books.length) return false;
    this.saveBooks(filtered);
    
    const questions = this.getQuestions();
    const remainingQuestions = questions.filter(q => q.bookId !== id);
    this.saveQuestions(remainingQuestions);
    return true;
  },

  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(QUESTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  },

  getQuestionsByBook(bookId: string): Question[] {
    return this.getQuestions().filter(q => q.bookId === bookId);
  },

  addQuestion(question: Omit<Question, 'id' | 'createdAt' | 'masteryLevel' | 'practiceCount'>): Question {
    const questions = this.getQuestions();
    const newQuestion: Question = {
      ...question,
      id: generateId(),
      createdAt: Date.now(),
      masteryLevel: '未掌握',
      practiceCount: 0,
      category: question.category || 'standard',
    };
    questions.push(newQuestion);
    this.saveQuestions(questions);
    
    this.updateBookQuestionCount(question.bookId);
    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<Question>): Question | null {
    const questions = this.getQuestions();
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    questions[index] = { ...questions[index], ...updates };
    this.saveQuestions(questions);
    
    if (updates.masteryLevel) {
      this.updateBookQuestionCount(questions[index].bookId);
    }
    return questions[index];
  },

  deleteQuestion(id: string): boolean {
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === id);
    if (!question) return false;
    
    const filtered = questions.filter(q => q.id !== id);
    this.saveQuestions(filtered);
    this.updateBookQuestionCount(question.bookId);
    return true;
  },

  updateBookQuestionCount(bookId: string): void {
    const questions = this.getQuestionsByBook(bookId);
    const masteredCount = questions.filter(q => q.masteryLevel === '已掌握').length;
    this.updateBook(bookId, { 
      questionCount: questions.length, 
      masteredCount 
    });
  },

  getSettings(): Settings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        zhipuApiKey: '',
        zhipuModel: 'glm-4-flash',
        darkMode: false,
      };
    } catch {
      return {
        zhipuApiKey: '',
        zhipuModel: 'glm-4-flash',
        darkMode: false,
      };
    }
  },

  saveSettings(settings: Settings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  clearAll(): void {
    localStorage.removeItem(BOOKS_KEY);
    localStorage.removeItem(QUESTIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  },
};
