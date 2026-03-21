export interface PracticeRecord {
  id: string;
  userId: string;
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  aiEvaluation?: string;
  practiceAt: number;
}

export interface CreatePracticeRecordInput {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  aiEvaluation?: string;
}
