import { supabase } from '../lib/supabase';
import type { Book, Question, Settings } from '../types';

export interface DatabaseError {
  message: string;
}

class DatabaseService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private checkAuth(): void {
    if (!this.userId) {
      throw new Error('用户未登录');
    }
  }

  async getAllBooks(): Promise<{ books: Book[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { books: [], error: { message: error.message } };
      }

      const books: Book[] = (data || []).map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url,
        description: book.description,
        questionCount: book.question_count,
        masteredCount: book.mastered_count,
        createdAt: book.created_at,
        updatedAt: book.updated_at
      }));

      return { books, error: null };
    } catch (error) {
      return { 
        books: [], 
        error: { message: error instanceof Error ? error.message : '获取书籍失败' } 
      };
    }
  }

  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ book: Book | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('books')
        .insert({
          user_id: this.userId,
          title: book.title,
          author: book.author,
          cover_url: book.coverUrl,
          description: book.description,
          question_count: book.questionCount,
          mastered_count: book.masteredCount
        })
        .select()
        .single();

      if (error) {
        return { book: null, error: { message: error.message } };
      }

      const newBook: Book = {
        id: data.id,
        title: data.title,
        author: data.author,
        coverUrl: data.cover_url,
        description: data.description,
        questionCount: data.question_count,
        masteredCount: data.mastered_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { book: newBook, error: null };
    } catch (error) {
      return { 
        book: null, 
        error: { message: error instanceof Error ? error.message : '创建书籍失败' } 
      };
    }
  }

  async updateBook(bookId: string, updates: Partial<Book>): Promise<{ book: Book | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('books')
        .update({
          title: updates.title,
          author: updates.author,
          cover_url: updates.coverUrl,
          description: updates.description,
          question_count: updates.questionCount,
          mastered_count: updates.masteredCount
        })
        .eq('id', bookId)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) {
        return { book: null, error: { message: error.message } };
      }

      const updatedBook: Book = {
        id: data.id,
        title: data.title,
        author: data.author,
        coverUrl: data.cover_url,
        description: data.description,
        questionCount: data.question_count,
        masteredCount: data.mastered_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { book: updatedBook, error: null };
    } catch (error) {
      return { 
        book: null, 
        error: { message: error instanceof Error ? error.message : '更新书籍失败' } 
      };
    }
  }

  async deleteBook(bookId: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', this.userId);

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '删除书籍失败' } 
      };
    }
  }

  async getQuestionsByBook(bookId: string): Promise<{ questions: Question[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { questions: [], error: { message: error.message } };
      }

      const questions: Question[] = (data || []).map(q => ({
        id: q.id,
        bookId: q.book_id,
        question: q.question,
        questionType: q.question_type as Question['questionType'],
        category: q.category as Question['category'],
        answer: q.answer,
        options: q.options,
        correctIndex: q.correct_index,
        explanation: q.explanation,
        difficulty: q.difficulty as Question['difficulty'],
        knowledgePoint: q.knowledge_point,
        masteryLevel: q.mastery_level as Question['masteryLevel'],
        practiceCount: q.practice_count,
        lastPracticedAt: q.last_practiced_at,
        createdAt: q.created_at,
        updatedAt: q.updated_at
      }));

      return { questions, error: null };
    } catch (error) {
      return { 
        questions: [], 
        error: { message: error instanceof Error ? error.message : '获取题目失败' } 
      };
    }
  }

  async createQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ question: Question | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          user_id: this.userId,
          book_id: question.bookId,
          question: question.question,
          question_type: question.questionType,
          category: question.category,
          answer: question.answer,
          options: question.options,
          correct_index: question.correctIndex,
          explanation: question.explanation,
          difficulty: question.difficulty,
          knowledge_point: question.knowledgePoint,
          mastery_level: question.masteryLevel,
          practice_count: question.practiceCount,
          last_practiced_at: question.lastPracticedAt
        })
        .select()
        .single();

      if (error) {
        return { question: null, error: { message: error.message } };
      }

      const newQuestion: Question = {
        id: data.id,
        bookId: data.book_id,
        question: data.question,
        questionType: data.question_type as Question['questionType'],
        category: data.category as Question['category'],
        answer: data.answer,
        options: data.options,
        correctIndex: data.correct_index,
        explanation: data.explanation,
        difficulty: data.difficulty as Question['difficulty'],
        knowledgePoint: data.knowledge_point,
        masteryLevel: data.mastery_level as Question['masteryLevel'],
        practiceCount: data.practice_count,
        lastPracticedAt: data.last_practiced_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { question: newQuestion, error: null };
    } catch (error) {
      return { 
        question: null, 
        error: { message: error instanceof Error ? error.message : '创建题目失败' } 
      };
    }
  }

  async updateQuestion(questionId: string, updates: Partial<Question>): Promise<{ question: Question | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('questions')
        .update({
          question: updates.question,
          question_type: updates.questionType,
          category: updates.category,
          answer: updates.answer,
          options: updates.options,
          correct_index: updates.correctIndex,
          explanation: updates.explanation,
          difficulty: updates.difficulty,
          knowledge_point: updates.knowledgePoint,
          mastery_level: updates.masteryLevel,
          practice_count: updates.practiceCount,
          last_practiced_at: updates.lastPracticedAt
        })
        .eq('id', questionId)
        .eq('user_id', this.userId)
        .select()
        .single();

      if (error) {
        return { question: null, error: { message: error.message } };
      }

      const updatedQuestion: Question = {
        id: data.id,
        bookId: data.book_id,
        question: data.question,
        questionType: data.question_type as Question['questionType'],
        category: data.category as Question['category'],
        answer: data.answer,
        options: data.options,
        correctIndex: data.correct_index,
        explanation: data.explanation,
        difficulty: data.difficulty as Question['difficulty'],
        knowledgePoint: data.knowledge_point,
        masteryLevel: data.mastery_level as Question['masteryLevel'],
        practiceCount: data.practice_count,
        lastPracticedAt: data.last_practiced_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return { question: updatedQuestion, error: null };
    } catch (error) {
      return { 
        question: null, 
        error: { message: error instanceof Error ? error.message : '更新题目失败' } 
      };
    }
  }

  async deleteQuestion(questionId: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('user_id', this.userId);

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '删除题目失败' } 
      };
    }
  }

  async getUserSettings(): Promise<{ settings: Settings | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { settings: null, error: { message: error.message } };
      }

      if (!data) {
        const defaultSettings: Settings = {
          darkMode: false
        };
        await this.createUserSettings(defaultSettings);
        return { settings: defaultSettings, error: null };
      }

      const settings: Settings = {
        darkMode: data.dark_mode
      };

      return { settings, error: null };
    } catch (error) {
      return { 
        settings: null, 
        error: { message: error instanceof Error ? error.message : '获取设置失败' } 
      };
    }
  }

  async createUserSettings(settings: Settings): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: this.userId,
          dark_mode: settings.darkMode
        });

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '创建设置失败' } 
      };
    }
  }

  async updateUserSettings(settings: Partial<Settings>): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          dark_mode: settings.darkMode
        })
        .eq('user_id', this.userId);

      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '更新设置失败' } 
      };
    }
  }

  subscribeToBooks(callback: (books: Book[]) => void): () => void {
    const subscription = supabase
      .channel('books-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books',
          filter: `user_id=eq.${this.userId}`
        },
        async () => {
          const { books } = await this.getAllBooks();
          callback(books);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToQuestions(bookId: string, callback: (questions: Question[]) => void): () => void {
    const subscription = supabase
      .channel('questions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `book_id=eq.${bookId}`
        },
        async () => {
          const { questions } = await this.getQuestionsByBook(bookId);
          callback(questions);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const databaseService = new DatabaseService();
