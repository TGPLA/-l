// @审计已完成
// 章节服务 - 章节相关 API 调用

import type { Chapter, Question } from '@infrastructure/types';
import { authService } from './auth';

const API_BASE = '/api';

export interface DatabaseError {
  message: string;
}

interface RawChapter {
  id: string;
  book_id: string;
  user_id: string;
  title: string;
  content: string;
  order_index: number;
  question_count: number;
  created_at: string;
  updated_at: string;
  questions?: RawQuestion[];
}

interface RawQuestion {
  id: string;
  book_id: string;
  chapter_id: string;
  question: string;
  answer: string;
  question_type: string;
  difficulty: string;
  mastery_level: string;
  created_at: string;
  updated_at?: string;
  last_practiced_at?: string;
  practice_count: number;
  knowledge_point: string;
  explanation: string;
  category: string;
}

function zhuanHuanZhangJie(raw: RawChapter): Chapter {
  return {
    id: raw.id,
    bookId: raw.book_id,
    title: raw.title,
    content: raw.content,
    orderIndex: raw.order_index,
    questionCount: raw.question_count,
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
  };
}

function zhuanHuanTiMu(raw: RawQuestion): Question {
  return {
    id: raw.id,
    bookId: raw.book_id,
    chapterId: raw.chapter_id,
    question: raw.question,
    answer: raw.answer,
    questionType: raw.question_type as Question['questionType'],
    difficulty: raw.difficulty as Question['difficulty'],
    masteryLevel: raw.mastery_level as Question['masteryLevel'],
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
    lastPracticedAt: raw.last_practiced_at ? new Date(raw.last_practiced_at).getTime() : undefined,
    practiceCount: raw.practice_count,
    knowledgePoint: raw.knowledge_point,
    explanation: raw.explanation,
    category: raw.category as Question['category'],
  };
}

class ChapterService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private checkAuth(): void {
    if (!this.userId) {
      throw new Error('用户未登录');
    }
  }

  private async handle401(response: Response): Promise<boolean> {
    if (response.status === 401) {
      await authService.signOut();
      window.location.reload();
      return true;
    }
    return false;
  }

  async getChaptersByBook(bookId: string): Promise<{ chapters: Chapter[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/chapters/book/${bookId}`, {
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (await this.handle401(response)) {
        return { chapters: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { chapters: [], error: { message: errorData.error || '获取章节失败' } };
      }
      
      const data = await response.json();
      const chapters = (data.data || []).map(zhuanHuanZhangJie);
      return { chapters, error: null };
    } catch (error) {
      return { chapters: [], error: { message: error instanceof Error ? error.message : '获取章节失败' } };
    }
  }

  async createChapter(chapter: { bookId: string; title: string; content: string; orderIndex?: number }): Promise<{ chapter: Chapter | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/chapters`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          book_id: chapter.bookId,
          user_id: this.userId,
          title: chapter.title,
          content: chapter.content,
          order_index: chapter.orderIndex,
        }),
      });
      
      if (await this.handle401(response)) {
        return { chapter: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { chapter: null, error: { message: errorData.error || '创建章节失败' } };
      }
      
      const data = await response.json();
      return { chapter: zhuanHuanZhangJie(data.data || data), error: null };
    } catch (error) {
      return { chapter: null, error: { message: error instanceof Error ? error.message : '创建章节失败' } };
    }
  }

  async getChapterDetail(chapterId: string): Promise<{ chapter: Chapter | null; questions: Question[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (await this.handle401(response)) {
        return { chapter: null, questions: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { chapter: null, questions: [], error: { message: errorData.error || '获取章节详情失败' } };
      }
      
      const data = await response.json();
      return { 
        chapter: zhuanHuanZhangJie(data.data), 
        questions: (data.data.questions || []).map(zhuanHuanTiMu), 
        error: null 
      };
    } catch (error) {
      return { chapter: null, questions: [], error: { message: error instanceof Error ? error.message : '获取章节详情失败' } };
    }
  }

  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<{ chapter: Chapter | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: updates.title,
          content: updates.content,
          order_index: updates.orderIndex,
        }),
      });
      
      if (await this.handle401(response)) {
        return { chapter: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { chapter: null, error: { message: errorData.error || '更新章节失败' } };
      }
      
      const data = await response.json();
      return { chapter: zhuanHuanZhangJie(data.data), error: null };
    } catch (error) {
      return { chapter: null, error: { message: error instanceof Error ? error.message : '更新章节失败' } };
    }
  }

  async deleteChapter(chapterId: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const token = authService.getToken();
      const response = await fetch(`${API_BASE}/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (await this.handle401(response)) {
        return { error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: { message: errorData.error || '删除章节失败' } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : '删除章节失败' } };
    }
  }
}

export const chapterService = new ChapterService();
