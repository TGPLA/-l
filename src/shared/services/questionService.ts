// @审计已完成
// 题目服务 - 题目相关 API 调用

import { ApiClient } from '@shared/utils/common/apiRequest';
import { authService } from './auth';
import type { Question } from '@infrastructure/types';

interface RawQuestion {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id?: string;
  paragraph_id?: string;
  annotation_id?: string;
  annotation?: {
    id: string;
    text: string;
    cfi_range: string;
    yan_se: string;
    lei_xing: string;
    bei_zhu: string;
  };
  question: string;
  answer: string;
  question_type: string;
  difficulty: string;
  knowledge_point?: string;
  mastery_level: string;
  practice_count: number;
  last_practiced_at?: string;
  created_at: string;
  updated_at?: string;
}

function zhuanHuanTiMu(raw: RawQuestion): Question {
  return {
    id: raw.id,
    userId: raw.user_id,
    bookId: raw.book_id,
    chapterId: raw.chapter_id,
    paragraphId: raw.paragraph_id,
    annotationId: raw.annotation_id,
    annotation: raw.annotation ? {
      id: raw.annotation.id,
      text: raw.annotation.text,
      cfiRange: raw.annotation.cfi_range,
      yanSe: raw.annotation.yan_se as any,
      leiXing: raw.annotation.lei_xing as any,
      beiZhu: raw.annotation.bei_zhu,
    } : undefined,
    question: raw.question,
    answer: raw.answer,
    questionType: raw.question_type as any,
    difficulty: raw.difficulty as any,
    knowledgePoint: raw.knowledge_point,
    masteryLevel: raw.mastery_level as any,
    practiceCount: raw.practice_count,
    lastPracticedAt: raw.last_practiced_at ? new Date(raw.last_practiced_at).getTime() : undefined,
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
  };
}

const apiClient = new ApiClient({ 
  baseUrl: '',
  token: authService.getToken(),
  onAuthExpired: () => {
    authService.signOut();
    window.location.reload();
  }
});

export const questionService = {
  async getQuestionsByBook(bookId: string): Promise<{ questions: Question[]; error: string | null }> {
    const { data, error } = await apiClient.request<RawQuestion[]>(`/api/questions/book/${bookId}`);
    const questions = (data || []).map(zhuanHuanTiMu);
    return { questions, error };
  },

  async getQuestionsByChapter(chapterId: string): Promise<{ questions: Question[]; error: string | null }> {
    const { data, error } = await apiClient.request<Question[]>(`/api/questions/chapter/${chapterId}`);
    return { questions: data || [], error };
  },

  async getQuestionsByParagraph(paragraphId: string): Promise<{ questions: Question[]; error: string | null }> {
    const { data, error } = await apiClient.request<Question[]>(`/api/paragraphs/${paragraphId}/questions`);
    return { questions: data || [], error };
  },

  async createQuestion(question: Partial<Question>): Promise<{ question: Question | null; error: string | null }> {
    const { data, error } = await apiClient.request<Question>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return { question: data, error };
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<{ error: string | null }> {
    const { error } = await apiClient.request(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { error };
  },

  async deleteQuestion(id: string): Promise<{ error: string | null }> {
    const { error } = await apiClient.request(`/api/questions/${id}`, {
      method: 'DELETE',
    });
    return { error };
  },
};
