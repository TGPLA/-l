// @审计已完成
// 复述记录服务 - 复述记录相关 API 调用

import { ApiClient } from '@shared/utils/common/apiRequest';
import { authService } from './auth';

export interface ParaphraseRecord {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id?: string;
  original_text: string;
  paraphrased_text: string;
  created_at: string;
}

const apiClient = new ApiClient({ 
  baseUrl: '',
  token: authService.getToken(),
  onAuthExpired: () => {
    authService.signOut();
    window.location.reload();
  }
});

export const paraphraseService = {
  async createParaphrase(params: {
    book_id: string;
    chapter_id?: string;
    original_text: string;
    paraphrased_text: string;
  }): Promise<{ record: ParaphraseRecord | null; error: string | null }> {
    const { data, error } = await apiClient.request<ParaphraseRecord>('/api/paraphrases', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return { record: data, error };
  },

  async getParaphrasesByBook(bookId: string): Promise<{ records: ParaphraseRecord[]; error: string | null }> {
    const { data, error } = await apiClient.request<{ data: ParaphraseRecord[] }>(`/api/paraphrases?book_id=${bookId}`);
    return { records: data?.data || [], error };
  },

  async deleteParaphrase(id: string): Promise<{ error: string | null }> {
    const { error } = await apiClient.request(`/api/paraphrases/${id}`, {
      method: 'DELETE',
    });
    return { error };
  },
};
