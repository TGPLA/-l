// @审计已完成
// 提示词模板服务 - 提示词模板相关 API 调用

import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';
import { authService } from './auth';

const API_BASE = '/api';

export interface DatabaseError {
  message: string;
}

interface RawPromptTemplate {
  id: string;
  user_id?: string;
  name: string;
  question_type: string;
  content: string;
  is_default: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

function zhuanHuanTiShiCi(raw: RawPromptTemplate): PromptTemplate {
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.name,
    questionType: raw.question_type as QuestionTypeEnum,
    content: raw.content,
    isDefault: raw.is_default,
    isSystem: raw.is_system,
    createdAt: new Date(raw.created_at).getTime(),
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() : undefined,
  };
}

class PromptService {
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

  async getPromptTemplates(): Promise<{ templates: PromptTemplate[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/prompts`, {
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { templates: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { templates: [], error: { message: errorData.error || '获取提示词模板失败' } };
      }
      
      const data = await response.json();
      const templates = (data.data || []).map(zhuanHuanTiShiCi);
      return { templates, error: null };
    } catch (error) {
      return { templates: [], error: { message: error instanceof Error ? error.message : '获取提示词模板失败' } };
    }
  }

  async getPromptTemplatesByType(type: QuestionTypeEnum): Promise<{ templates: PromptTemplate[]; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/prompts/type/${encodeURIComponent(type)}`, {
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { templates: [], error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { templates: [], error: { message: errorData.error || '获取提示词模板失败' } };
      }
      
      const data = await response.json();
      const templates = (data.data || []).map(zhuanHuanTiShiCi);
      return { templates, error: null };
    } catch (error) {
      return { templates: [], error: { message: error instanceof Error ? error.message : '获取提示词模板失败' } };
    }
  }

  async createPromptTemplate(template: { name: string; questionType: QuestionTypeEnum; content: string; isDefault?: boolean }): Promise<{ template: PromptTemplate | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          user_id: this.userId,
          name: template.name,
          question_type: template.questionType,
          content: template.content,
          is_default: template.isDefault || false,
        }),
      });
      
      if (await this.handle401(response)) {
        return { template: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { template: null, error: { message: errorData.error || '创建提示词模板失败' } };
      }
      
      const data = await response.json();
      return { template: zhuanHuanTiShiCi(data.data), error: null };
    } catch (error) {
      return { template: null, error: { message: error instanceof Error ? error.message : '创建提示词模板失败' } };
    }
  }

  async updatePromptTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<{ template: PromptTemplate | null; error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/prompts/${templateId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: updates.name,
          content: updates.content,
          is_default: updates.isDefault,
        }),
      });
      
      if (await this.handle401(response)) {
        return { template: null, error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { template: null, error: { message: errorData.error || '更新提示词模板失败' } };
      }
      
      const data = await response.json();
      return { template: zhuanHuanTiShiCi(data.data), error: null };
    } catch (error) {
      return { template: null, error: { message: error instanceof Error ? error.message : '更新提示词模板失败' } };
    }
  }

  async deletePromptTemplate(templateId: string): Promise<{ error: DatabaseError | null }> {
    try {
      this.checkAuth();
      const response = await fetch(`${API_BASE}/prompts/${templateId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (await this.handle401(response)) {
        return { error: { message: '登录已过期' } };
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: { message: errorData.error || '删除提示词模板失败' } };
      }
      
      return { error: null };
    } catch (error) {
      return { error: { message: error instanceof Error ? error.message : '删除提示词模板失败' } };
    }
  }
}

export const promptService = new PromptService();
