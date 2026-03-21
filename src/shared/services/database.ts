// @审计已完成
// 数据库服务 - 基于 Go 后端 API

import type { Book, Question, Settings } from '@infrastructure/types';
import { authService } from './auth';

const API_BASE = '/api';

export interface DatabaseError {
  message: string;
}

interface RawBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url?: string;
  chapter_count: number;
  question_count: number;
  created_at: string;
  updated_at?: string;
}

function zhuanHuanShuJi(raw: RawBook): Book {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    author: raw.author,
    coverUrl: raw.cover_url,
    chapterCount: raw.chapter_count,
    questionCount: raw.question_count,
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
  };
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

  private async request<T>(endpoint: string, options?: RequestInit): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options?.headers,
        },
      });

      if (response.status === 401) {
        await authService.signOut();
        window.location.reload();
        return { 
          data: null, 
          error: { message: '登录已过期，请重新登录' } 
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { 
          data: null, 
          error: { message: errorData.error || errorData.message || `请求失败：${response.status}` } 
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : '网络错误' } 
      };
    }
  }

  async getAllBooks(): Promise<{ books: Book[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await this.request<{ success: boolean; data: RawBook[] }>(`/books?userId=${this.userId}`);
      
      if (error) {
        return { books: [], error };
      }

      return { books: (data?.data || []).map(zhuanHuanShuJi), error: null };
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
      
      const { data, error } = await this.request<{ success: boolean; data: RawBook }>('/books', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
        }),
      });

      if (error) {
        return { book: null, error };
      }

      return { book: data?.data ? zhuanHuanShuJi(data.data) : null, error: null };
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
      
      const { data, error } = await this.request<{ success: boolean; data: RawBook }>(`/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updates.title,
          author: updates.author,
          coverUrl: updates.coverUrl,
        }),
      });

      if (error) {
        return { book: null, error };
      }

      return { book: data?.data ? zhuanHuanShuJi(data.data) : null, error: null };
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
      
      const { error } = await this.request(`/books/${bookId}`, {
        method: 'DELETE',
      });

      return { error };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '删除书籍失败' } 
      };
    }
  }

  async getQuestionsByBook(bookId: string): Promise<{ questions: Question[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { data, error } = await this.request<{ success: boolean; data: Question[] }>(`/questions/book/${bookId}`);
      
      if (error) {
        return { questions: [], error };
      }

      return { questions: data?.data || [], error: null };
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
      
      const { data, error } = await this.request<Question>('/questions', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          bookId: question.bookId,
          question: question.question,
          questionType: question.questionType,
          category: question.category,
          answer: question.answer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          knowledgePoint: question.knowledgePoint,
          masteryLevel: question.masteryLevel,
          practiceCount: question.practiceCount || 0,
        }),
      });

      if (error) {
        return { question: null, error };
      }

      return { question: data, error: null };
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
      
      const { data, error } = await this.request<Question>(`/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (error) {
        return { question: null, error };
      }

      return { question: data, error: null };
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
      
      const { error } = await this.request(`/questions/${questionId}`, {
        method: 'DELETE',
      });

      return { error };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '删除题目失败' } 
      };
    }
  }

  async getUserSettings(): Promise<{ settings: Settings | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      interface RawSettings {
        id: string;
        user_id: string;
        dark_mode: boolean;
        zhipu_api_key: string;
        zhipu_model: string;
        dify_api_key: string;
        question_workflow_url: string;
        correction_workflow_url: string;
        created_at: string;
        updated_at: string;
      }

      const { data, error } = await this.request<{ success: boolean; data: RawSettings }>(`/settings?userId=${this.userId}`);
      
      if (error) {
        return { settings: null, error };
      }

      if (data?.data) {
        const raw = data.data;
        return {
          settings: {
            darkMode: raw.dark_mode,
            zhipuApiKey: raw.zhipu_api_key,
            zhipuModel: raw.zhipu_model,
          },
          error: null,
        };
      }

      return { settings: null, error: null };
    } catch (error) {
      return { 
        settings: null, 
        error: { message: error instanceof Error ? error.message : '获取设置失败' } 
      };
    }
  }

  async updateUserSettings(settings: Partial<Settings>): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      
      const { error } = await this.request('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          userId: this.userId,
          zhipu_api_key: settings.zhipuApiKey,
          zhipu_model: settings.zhipuModel,
          dark_mode: settings.darkMode,
        }),
      });

      return { error };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '更新设置失败' } 
      };
    }
  }
}

export const databaseService = new DatabaseService();
