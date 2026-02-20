import type { User } from '../types';

const USER_GIST_KEY = 'readrecall_user_gist_id';

async function getUserGistId(): Promise<string | null> {
  return localStorage.getItem(USER_GIST_KEY);
}

async function setUserGistId(gistId: string): Promise<void> {
  localStorage.setItem(USER_GIST_KEY, gistId);
}

async function createUserGist(users: User[], token: string): Promise<string> {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: '阅读回响用户账号数据',
      public: false,
      files: {
        'users.json': {
          content: JSON.stringify(users, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`创建用户 Gist 失败: ${error}`);
  }

  const gist = await response.json();
  return gist.id;
}

async function updateUserGist(gistId: string, users: User[], token: string): Promise<void> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'users.json': {
          content: JSON.stringify(users, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`更新用户 Gist 失败: ${error}`);
  }
}

async function getUserGist(gistId: string, token: string): Promise<User[]> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`获取用户 Gist 失败: ${error}`);
  }

  const gist = await response.json();
  const files = Object.values(gist.files);
  
  if (files.length === 0) {
    return [];
  }

  const file = files[0] as { content: string };
  const content = file.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export const userCloudStorage = {
  async uploadUsers(users: User[], token: string): Promise<void> {
    const gistId = await getUserGistId();
    
    if (gistId) {
      await updateUserGist(gistId, users, token);
    } else {
      const newGistId = await createUserGist(users, token);
      await setUserGistId(newGistId);
    }
  },

  async downloadUsers(token: string): Promise<User[]> {
    const gistId = await getUserGistId();
    
    if (!gistId) {
      return [];
    }

    try {
      return await getUserGist(gistId, token);
    } catch (error) {
      console.error('下载用户数据失败:', error);
      return [];
    }
  },

  async syncUsers(users: User[], token: string): Promise<User[]> {
    const remoteUsers = await this.downloadUsers(token);
    
    if (remoteUsers.length === 0) {
      await this.uploadUsers(users, token);
      return users;
    }

    const mergedUsers = [...remoteUsers];
    const localEmails = new Set(users.map(u => u.email.toLowerCase()));

    for (const localUser of users) {
      if (!localEmails.has(localUser.email.toLowerCase())) {
        mergedUsers.push(localUser);
      }
    }

    await this.uploadUsers(mergedUsers, token);
    return mergedUsers;
  },
};