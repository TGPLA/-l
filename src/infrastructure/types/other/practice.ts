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
