import type { Book } from '../book/book';
import type { Question } from '../book/question';
import type { Settings } from '../config/settings';

export interface SyncData {
  books: Book[];
  questions: Question[];
  settings: Settings;
  timestamp: number;
}

export interface SyncConflict {
  type: 'books' | 'questions' | 'settings';
  localData: Book | Question | Settings;
  remoteData: Book | Question | Settings;
}
