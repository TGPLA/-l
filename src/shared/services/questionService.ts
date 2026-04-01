// @审计已完成
// 题目服务 - 题目相关 API 调用

import { ApiClient } from '@shared/utils/common/apiRequest';
import { authService } from './auth';
import type { Question } from '@infrastructure/types';

const apiClient = new ApiClient({ 
  baseUrl: '',
  token: authService.getToken(),
  onAuthExpired: () => {
    authService.signOut();
    window.location.reload();
  }
});

export const questionService = {
  async getQuestionsByChapter(chapterId: string): Promise<{ questions: Question[]; error: string | null }> {
    const { data, error } = await apiClient.request<{ questions: Question[] }>(`/questions/chapter/${chapterId}`);
    return { questions: data?.questions || [], error };
  },

  async getQuestionsByParagraph(paragraphId: string): Promise<{ questions: Question[]; error: string | null }> {
    const { data, error } = await apiClient.request<{ questions: Question[] }>(`/paragraphs/${paragraphId}/questions`);
    return { questions: data?.questions || [], error };
  },

  async createQuestion(question: Partial<Question>): Promise<{ question: Question | null; error: string | null }> {
    const { data, error } = await apiClient.request<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return { question: data, error };
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<{ error: string | null }> {
    const { error } = await apiClient.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { error };
  },

  async deleteQuestion(id: string): Promise<{ error: string | null }> {
    const { error } = await apiClient.request(`/questions/${id}`, {
      method: 'DELETE',
    });
    return { error };
  },
};
