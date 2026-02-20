import type { SyncData, SyncConflict } from '../types';
import { storage } from '../store';
import { cloudStorage } from './cloudStorage';

function detectConflicts<T extends { id: string; updatedAt?: number }>(
  localData: T[],
  remoteData: T[],
  type: 'books' | 'questions' | 'settings'
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];
  
  for (const remote of remoteData) {
    const local = localData.find(item => item.id === remote.id);
    
    if (local && remote.updatedAt && local.updatedAt) {
      if (remote.updatedAt > local.updatedAt) {
        conflicts.push({
          type,
          localData: local,
          remoteData: remote,
        });
      }
    }
  }

  return conflicts;
}

function mergeArrays<T extends { id: string }>(
  localArray: T[],
  remoteArray: T[],
  idKey: keyof T
): T[] {
  const merged = [...localArray];
  const localIds = new Set(localArray.map(item => String(item[idKey])));

  for (const remoteItem of remoteArray) {
    const remoteId = String(remoteItem[idKey]);
    
    if (!localIds.has(remoteId)) {
      merged.push(remoteItem);
      localIds.add(remoteId);
    }
  }

  return merged;
}

function getLocalTimestamp(): number {
  const books = storage.getBooks();
  const questions = storage.getQuestions();
  
  const bookTimestamps = books.map(b => b.createdAt).filter(t => t > 0);
  const questionTimestamps = questions.map(q => q.createdAt).filter(t => t > 0);
  
  const allTimestamps = [...bookTimestamps, ...questionTimestamps];
  
  if (allTimestamps.length === 0) {
    return 0;
  }

  return Math.max(...allTimestamps);
}

export const syncService = {
  async uploadData(): Promise<void> {
    const books = storage.getBooks();
    const questions = storage.getQuestions();
    const settings = storage.getSettings();

    const syncData: SyncData = {
      books,
      questions,
      settings,
      timestamp: Date.now(),
    };

    await cloudStorage.uploadToCloud(syncData);
  },

  async downloadData(): Promise<SyncData> {
    const cloudData = await cloudStorage.downloadFromCloud();
    
    if (!cloudData) {
      throw new Error('云端没有数据');
    }

    return cloudData;
  },

  async syncData(): Promise<{ uploaded: boolean; downloaded: boolean; conflicts: SyncConflict[] }> {
    const conflicts: SyncConflict[] = [];
    let uploaded = false;
    let downloaded = false;

    try {
      const cloudData = await cloudStorage.downloadFromCloud();
      
      if (cloudData) {
        const localBooks = storage.getBooks();
        const localQuestions = storage.getQuestions();

        const bookConflicts = detectConflicts(localBooks, cloudData.books, 'books');
        const questionConflicts = detectConflicts(localQuestions, cloudData.questions, 'questions');

        if (bookConflicts.length > 0 || questionConflicts.length > 0) {
          conflicts.push(...bookConflicts, ...questionConflicts);
          return { uploaded: false, downloaded: false, conflicts };
        }

        if (cloudData.timestamp > getLocalTimestamp()) {
          storage.saveBooks(cloudData.books);
          storage.saveQuestions(cloudData.questions);
          storage.saveSettings(cloudData.settings);
          downloaded = true;
        } else {
          await this.uploadData();
          uploaded = true;
        }
      } else {
        await this.uploadData();
        uploaded = true;
      }
    } catch (error) {
      if ((error as Error).message === '云端没有数据') {
        await this.uploadData();
        uploaded = true;
      } else {
        throw error;
      }
    }

    return { uploaded, downloaded, conflicts };
  },

  async mergeData(cloudData: SyncData): Promise<void> {
    const localBooks = storage.getBooks();
    const localQuestions = storage.getQuestions();
    const localSettings = storage.getSettings();

    const mergedBooks = mergeArrays(localBooks, cloudData.books, 'id');
    const mergedQuestions = mergeArrays(localQuestions, cloudData.questions, 'id');
    const mergedSettings = { ...localSettings, ...cloudData.settings };

    storage.saveBooks(mergedBooks);
    storage.saveQuestions(mergedQuestions);
    storage.saveSettings(mergedSettings);
  },

  async resolveConflicts(_conflicts: SyncConflict[], useRemote: boolean): Promise<void> {
    const cloudData = await cloudStorage.downloadFromCloud();
    
    if (!cloudData) {
      return;
    }

    if (useRemote) {
      await this.mergeData(cloudData);
    }
  },
};