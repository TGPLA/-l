export interface Paragraph {
  id: string;
  chapterId: string;
  content: string;
  orderIndex: number;
  questionCount: number;
  createdAt: number;
  updatedAt?: number;
}
