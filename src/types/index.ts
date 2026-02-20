export type QuestionType = '选择题' | '简答题';
export type Difficulty = '基础' | '中等' | '进阶' | '挑战';
export type MasteryLevel = '未掌握' | '学习中' | '已掌握';
export type AnswerStatus = 'forgot' | 'vague' | 'mastered' | null;
export type QuestionCategory = 'standard' | 'concept';

export interface User {
  id: string;
  email: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SyncData {
  books: Book[];
  questions: Question[];
  settings: Settings;
  timestamp: number;
}

export interface SyncConflict {
  type: 'books' | 'questions' | 'settings';
  localData: any;
  remoteData: any;
}

export interface Question {
  id: string;
  bookId: string;
  question: string;
  answer: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  masteryLevel: MasteryLevel;
  createdAt: number;
  lastPracticedAt?: number;
  practiceCount: number;
  options?: string[];
  correctIndex?: number;
  knowledgePoint?: string;
  answerStatus?: AnswerStatus;
  answeredAt?: number;
  userAnswer?: string;
  category: QuestionCategory;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  createdAt: number;
  questionCount: number;
  masteredCount: number;
  summary?: string;
  contents?: string;
  keyPoints?: string[];
}

export interface Settings {
  zhipuApiKey?: string;
  zhipuModel?: string;
  difyApiKey?: string;
  questionWorkflowUrl?: string;
  correctionWorkflowUrl?: string;
  darkMode: boolean;
}

export interface PracticeSession {
  bookId: string;
  questionIds: string[];
  currentIndex: number;
  mode: 'standard' | 'concept';
  startTime: number;
}

export interface ConceptEvaluation {
  evaluation: string;
  supplement: string;
  translation?: string;
  scenario?: string;
  vocabularyCards?: Array<{
    term: string;
    definition: string;
    context: string;
  }>;
}
