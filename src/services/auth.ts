import type { User, AuthResponse } from '../types';

const AUTH_KEY = 'readrecall_auth';
const TOKEN_KEY = 'readrecall_token';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAllUsers(): User[] {
  try {
    const data = localStorage.getItem('readrecall_users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem('readrecall_users', JSON.stringify(users));
}

function generateToken(userId: string): string {
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  return btoa(data);
}

export const authService = {
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  async register(email: string, _password: string): Promise<AuthResponse> {
    const users = getAllUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('该邮箱已被注册');
    }

    const newUser: User = {
      id: generateId(),
      email,
      createdAt: Date.now(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateToken(newUser.id);

    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, token);

    return {
      user: newUser,
      token,
    };
  },

  async login(email: string, _password: string): Promise<AuthResponse> {
    const users = getAllUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('用户不存在');
    }

    const token = generateToken(user.id);

    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);

    return {
      user,
      token,
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  validateToken(token: string): boolean {
    try {
      const data = atob(token);
      const [, timestamp] = data.split(':');
      const age = Date.now() - parseInt(timestamp);
      return age < 30 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  },
};