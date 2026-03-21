// @审计已完成
// AI 服务 - 统一的 AI 相关 API 调用

import type { ConceptEvaluation } from '@infrastructure/types';
import { YingYongCuoWu } from '@shared/utils/common/CuoWuDingYi';
import { translateError } from '@shared/utils/common/errorTranslator';
import { authService } from './auth';

const API_BASE = '/api';

interface RawGeneratedQuestion {
  question: string;
  answer: string;
  type: string;
  knowledge_point: string;
}

interface RawGeneratedQuestionsResponse {
  questions: RawGeneratedQuestion[];
  count: number;
}

interface RawEvaluationResponse {
  evaluation: string;
  supplement: string;
  translation?: string;
  scenario?: string;
  vocabulary_cards?: Array<{
    term: string;
    definition: string;
    context: string;
  }>;
}

function zhuanHuanTiMu(raw: RawGeneratedQuestion) {
  return {
    question: raw.question,
    answer: raw.answer,
    type: raw.type,
    knowledgePoint: raw.knowledge_point,
  };
}

function zhuanHuanPingJia(raw: RawEvaluationResponse): ConceptEvaluation {
  return {
    evaluation: raw.evaluation,
    supplement: raw.supplement,
    translation: raw.translation,
    scenario: raw.scenario,
    vocabularyCards: raw.vocabulary_cards?.map(card => ({
      term: card.term,
      definition: card.definition,
      context: card.context,
    })),
  };
}

export interface GenerateQuestionsResult {
  questions: Array<{
    question: string;
    answer: string;
    type: string;
    knowledgePoint: string;
  }>;
}

class AIService {
  private getHeaders(): Record<string, string> {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async handle401(response: Response): Promise<boolean> {
    if (response.status === 401) {
      await authService.signOut();
      window.location.reload();
      return true;
    }
    return false;
  }

  async generateQuestions(chapterId: string, difficulty: string, count: number): Promise<{ data: GenerateQuestionsResult | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/generate-questions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          chapter_id: chapterId,
          difficulty,
          count,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as RawGeneratedQuestionsResponse;
      const questions = (responseData?.questions || []).map(zhuanHuanTiMu);
      return { data: { questions }, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 生成题目失败' };
    }
  }

  async evaluateAnswer(questionId: string, userAnswer: string): Promise<{ data: ConceptEvaluation | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/evaluate-answer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as { data: RawEvaluationResponse };
      return { data: zhuanHuanPingJia(responseData.data), error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: error.message };
      }
      return { data: null, error: error instanceof Error ? error.message : 'AI 评价失败' };
    }
  }

  async recordPractice(questionId: string, userAnswer: string, aiEvaluation: string): Promise<{ error: string | null }> {
    try {
      const response = await fetch(`${API_BASE}/questions/${questionId}/practice`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_answer: userAnswer,
          ai_evaluation: aiEvaluation,
        }),
      });

      if (await this.handle401(response)) {
        return { error: '登录已过期' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      return { error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { error: error.message };
      }
      return { error: error instanceof Error ? error.message : '记录练习失败' };
    }
  }

  async generateQuestionsForParagraph(paragraphId: string, questionType: string, count: number): Promise<{ data: GenerateQuestionsResult | null; error: { message: string } | null }> {
    try {
      const response = await fetch(`${API_BASE}/ai/generate-questions-paragraph`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          paragraph_id: paragraphId,
          question_type: questionType,
          count,
        }),
      });

      if (await this.handle401(response)) {
        return { data: null, error: { message: '登录已过期' } };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
      }

      const responseData = await response.json() as RawGeneratedQuestionsResponse;
      const questions = (responseData?.questions || []).map(zhuanHuanTiMu);
      return { data: { questions }, error: null };
    } catch (error) {
      if (error instanceof YingYongCuoWu) {
        return { data: null, error: { message: error.message } };
      }
      return { data: null, error: { message: error instanceof Error ? error.message : 'AI 生成题目失败' } };
    }
  }
}

export const aiService = new AIService();
