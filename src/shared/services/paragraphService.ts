// @审计已完成
// 段落服务 - 段落相关 API 调用

import type { Paragraph, Question } from '@infrastructure/types';
import { authService } from './auth';

const API_BASE = '/api';

export interface DatabaseError {
  message: string;
}

interface RawParagraph {
  id: string;
  chapter_id: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface RawQuestion {
  id: string;
  book_id: string;
  chapter_id: string;
  paragraph_id?: string;
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

function zhuanHuanDuanLuo(raw: RawParagraph): Paragraph {
  return {
    id: raw.id,
    chapterId: raw.chapter_id,
    content: raw.content,
    orderIndex: raw.order_index,
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
  };
}

function zhuanHuanTiMu(raw: RawQuestion): Question {
  return {
    id: raw.id,
    bookId: raw.book_id,
    chapterId: raw.chapter_id,
    paragraphId: raw.paragraph_id,
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

class ParagraphService {
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

  private getHeaders(): Record<string, string> {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async getParagraphsByChapter(chapterId: string): Promise<{ paragraphs: Paragraph[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs/chapter/${chapterId}`, {
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { paragraphs: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { paragraphs: [], error: { message: errorData.error || '获取段落失败' } };
      }
      
      const data = await response.json();
      const paragraphs = (data.data || []).map(zhuanHuanDuanLuo);
      return { paragraphs, error: null };
    } catch (error) {
      return { paragraphs: [], error: { message: error instanceof Error ? error.message : '获取段落失败' } };
    }
  }

  async getParagraphDetail(paragraphId: string): Promise<{ paragraph: Paragraph | null; questions: Question[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs/${paragraphId}`, {
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { paragraph: null, questions: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { paragraph: null, questions: [], error: { message: errorData.error || '获取段落详情失败' } };
      }
      
      const data = await response.json();
      return { 
        paragraph: zhuanHuanDuanLuo(data.data), 
        questions: (data.data.questions || []).map(zhuanHuanTiMu), 
        error: null 
      };
    } catch (error) {
      return { paragraph: null, questions: [], error: { message: error instanceof Error ? error.message : '获取段落详情失败' } };
    }
  }

  async createParagraph(paragraph: { chapterId: string; content: string; orderIndex?: number }): Promise<{ paragraph: Paragraph | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: paragraph.chapterId,
          user_id: this.userId,
          content: paragraph.content,
          order_index: paragraph.orderIndex,
        }),
      });
      
      if (await this.handle401(response)) {
        return { paragraph: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { paragraph: null, error: { message: errorData.error || '创建段落失败' } };
      }
      
      const data = await response.json();
      return { paragraph: zhuanHuanDuanLuo(data.data), error: null };
    } catch (error) {
      return { paragraph: null, error: { message: error instanceof Error ? error.message : '创建段落失败' } };
    }
  }

  async batchCreateParagraphs(chapterId: string, contents: string[]): Promise<{ paragraphs: Paragraph[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs/batch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: chapterId,
          user_id: this.userId,
          contents: contents,
        }),
      });
      
      if (await this.handle401(response)) {
        return { paragraphs: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { paragraphs: [], error: { message: errorData.error || '批量创建段落失败' } };
      }
      
      const data = await response.json();
      const paragraphs = (data.data || []).map(zhuanHuanDuanLuo);
      return { paragraphs, error: null };
    } catch (error) {
      return { paragraphs: [], error: { message: error instanceof Error ? error.message : '批量创建段落失败' } };
    }
  }

  async updateParagraph(paragraphId: string, content: string): Promise<{ paragraph: Paragraph | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs/${paragraphId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });
      
      if (await this.handle401(response)) {
        return { paragraph: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { paragraph: null, error: { message: errorData.error || '更新段落失败' } };
      }
      
      const data = await response.json();
      return { paragraph: zhuanHuanDuanLuo(data.data), error: null };
    } catch (error) {
      return { paragraph: null, error: { message: error instanceof Error ? error.message : '更新段落失败' } };
    }
  }

  async deleteParagraph(paragraphId: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/paragraphs/${paragraphId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: { message: errorData.error || '删除段落失败' } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : '删除段落失败' } };
    }
  }
}

export const paragraphService = new ParagraphService();
