import type { User, AuthResponse } from '../types';

const AUTH_KEY = 'readrecall_auth';
const TOKEN_KEY = 'readrecall_token';

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

    const users = getAllUsers();
    
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
    saveUsers(users);

    const token = generateToken(newUser.id);

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

    const users = getAllUsers();
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
};