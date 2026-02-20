import type { SyncData } from '../types';
import { authService } from './auth';

const SYNC_TIMESTAMP_KEY = 'readrecall_last_sync';

export const cloudStorage = {
  async uploadToCloud(data: SyncData): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('请先登录');
    }

    const gistId = localStorage.getItem('readrecall_gist_id');
    
    if (gistId) {
      await this.updateGist(gistId, data);
    } else {
      const newGist = await this.createGist(data);
      localStorage.setItem('readrecall_gist_id', newGist.id);
    }

    localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
  },

  async downloadFromCloud(): Promise<SyncData | null> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('请先登录');
    }

    const gistId = localStorage.getItem('readrecall_gist_id');
    if (!gistId) {
      return null;
    }

    const gist = await this.getGist(gistId);
    const files = Object.values(gist.files);
    
    if (files.length === 0) {
      return null;
    }

    const file = files[0] as { content: string };
    const content = file.content;
    return JSON.parse(content);
  },

  async createGist(data: SyncData): Promise<any> {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${authService.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: '阅读回响数据备份',
        public: false,
        files: {
          'data.json': {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('创建 Gist 失败');
    }

    return response.json();
  },

  async updateGist(gistId: string, data: SyncData): Promise<void> {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${authService.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'data.json': {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('更新 Gist 失败');
    }
  },

  async getGist(gistId: string): Promise<any> {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${authService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取 Gist 失败');
    }

    return response.json();
  },

  getLastSyncTime(): number | null {
    const timestamp = localStorage.getItem(SYNC_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp) : null;
  },

  hasCloudData(): boolean {
    return localStorage.getItem('readrecall_gist_id') !== null;
  },
};