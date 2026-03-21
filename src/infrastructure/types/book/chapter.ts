export interface Chapter {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  content: string;
  orderIndex: number;
  paragraphCount: number;
  questionCount: number;
  createdAt: number;
  updatedAt?: number;
}

export interface CreateChapterInput {
  bookId: string;
  title: string;
  content: string;
  orderIndex?: number;
}

export interface UpdateChapterInput {
  title?: string;
  content?: string;
  orderIndex?: number;
}
