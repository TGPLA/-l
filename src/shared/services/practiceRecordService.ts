import type { PracticeRecord } from '@infrastructure/types';

const API_BASE = '/api';

interface RawPracticeRecord {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean | null;
  ai_evaluation: string;
  practice_at: string;
}

function zhuanHuanLianXiJiLu(raw: RawPracticeRecord): PracticeRecord {
  return {
    id: raw.id,
    questionId: raw.question_id,
    userAnswer: raw.user_answer,
    isCorrect: raw.is_correct,
    aiEvaluation: raw.ai_evaluation,
    practicedAt: new Date(raw.practice_at).getTime(),
  };
}

class PracticeRecordService {
  async getRecordsByQuestion(questionId: string): Promise<{ records: PracticeRecord[]; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}/records`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { records: [], error: errorData.error || '获取练习记录失败' };
      }
      
      const data = await response.json();
      const records = (data.data || []).map(zhuanHuanLianXiJiLu);
      return { records, error: null };
    } catch (error) {
      return { records: [], error: error instanceof Error ? error.message : '获取练习记录失败' };
    }
  }

  async createRecord(record: { questionId: string; userAnswer: string; aiEvaluation: string }): Promise<{ record: PracticeRecord | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/questions/${record.questionId}/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_answer: record.userAnswer,
          ai_evaluation: record.aiEvaluation,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { record: null, error: errorData.error || '创建练习记录失败' };
      }
      
      const data = await response.json();
      return { record: zhuanHuanLianXiJiLu(data.data), error: null };
    } catch (error) {
      return { record: null, error: error instanceof Error ? error.message : '创建练习记录失败' };
    }
  }
}

export const practiceRecordService = new PracticeRecordService();
