import type { User, AuthResponse } from '../types';
import { userCloudStorage } from './userCloudStorage';

const AUTH_KEY = 'readrecall_auth';
const TOKEN_KEY = 'readrecall_token';
const USERS_KEY = 'readrecall_users';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少为 6 位' };
  }
  
  if (password.length > 50) {
    return { valid: false, message: '密码长度不能超过 50 位' };
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含字母' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  
  return { valid: true, message: '' };
}

async function getAllUsers(token?: string): Promise<User[]> {
  try {
    const localData = localStorage.getItem(USERS_KEY);
    let localUsers: User[] = localData ? JSON.parse(localData) : [];
    
    if (token) {
      try {
        const cloudUsers = await userCloudStorage.downloadUsers(token);
        
        if (cloudUsers.length > 0) {
          const mergedUsers = [...cloudUsers];
          const localEmails = new Set(cloudUsers.map(u => u.email.toLowerCase()));
          
          for (const localUser of localUsers) {
            if (!localEmails.has(localUser.email.toLowerCase())) {
              mergedUsers.push(localUser);
            }
          }
          
          localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
          return mergedUsers;
        }
      } catch (error) {
        console.error('从云端获取用户数据失败:', error);
      }
    }
    
    return localUsers;
  } catch {
    return [];
  }
}

async function saveUsers(users: User[], token?: string): Promise<void> {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  if (token) {
    try {
      await userCloudStorage.uploadUsers(users, token);
    } catch (error) {
      console.error('上传用户数据到云端失败:', error);
    }
  }
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
    const token = this.getToken();
    const user = this.getCurrentUser();
    return token !== null && user !== null;
  },

  async register(email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    if (!email.trim()) {
      throw new Error('请输入邮箱');
    }

    if (!validateEmail(email)) {
      throw new Error('邮箱格式不正确');
    }

    if (!password.trim()) {
      throw new Error('请输入密码');
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    if (password !== confirmPassword) {
      throw new Error('两次输入的密码不一致');
    }

    const githubToken = localStorage.getItem('github_token');
    const users = await getAllUsers(githubToken || undefined);
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('该邮箱已被注册');
    }

    const passwordHash = await hashPassword(password);

    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: Date.now(),
    };

    users.push(newUser);
    
    const token = generateToken(newUser.id);
    await saveUsers(users, githubToken || undefined);

    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, token);

    return {
      user: newUser,
      token,
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email.trim()) {
      throw new Error('请输入邮箱');
    }

    if (!validateEmail(email)) {
      throw new Error('邮箱格式不正确');
    }

    if (!password.trim()) {
      throw new Error('请输入密码');
    }

    const githubToken = localStorage.getItem('github_token');
    const users = await getAllUsers(githubToken || undefined);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('用户不存在');
    }

    const passwordHash = await hashPassword(password);

    if (user.passwordHash !== passwordHash) {
      throw new Error('密码错误');
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

  async resetPassword(email: string): Promise<void> {
    if (!email.trim()) {
      throw new Error('请输入邮箱');
    }

    if (!validateEmail(email)) {
      throw new Error('邮箱格式不正确');
    }

    const githubToken = localStorage.getItem('github_token');
    const users = await getAllUsers(githubToken || undefined);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('用户不存在');
    }

    const newPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newPasswordHash = await hashPassword(newPassword);

    user.passwordHash = newPasswordHash;
    
    await saveUsers(users, githubToken || undefined);

    window.alert(`您的临时密码是：${newPassword}\n\n请登录后立即修改密码！`);
  },
};