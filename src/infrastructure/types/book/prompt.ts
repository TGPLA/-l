export interface PromptTemplate {
  id: string;
  userId?: string;
  name: string;
  questionType: QuestionTypeEnum;
  content: string;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: number;
  updatedAt?: number;
}

export type QuestionTypeEnum = '名词解释' | '意图理解' | '生活应用';

export interface PromptConfig {
  paragraphId: string;
  questionType: QuestionTypeEnum;
  templateId?: string;
  customPrompt?: string;
}
