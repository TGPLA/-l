/**
 * 认证服务 - 本地认证 + MySQL 云端存储
 * 使用数字用户名作为用户标识，数据通过 Go 后端存储到 MySQL
 */

export interface AuthUser {
  id: string;
  username: string;
  nickname?: string;
}

export interface AuthError {
  message: string;
}

const API_BASE = '/api';

class AuthService {
  private currentUser: AuthUser | null = null;
  private token: string | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];
  private rememberMe: boolean = true;

  constructor() {
    this.rememberMe = localStorage.getItem('remember_me') !== 'false';
    this.initializeAuth();
  }

  private getStorage(): Storage {
    return this.rememberMe ? localStorage : sessionStorage;
  }

  private async initializeAuth() {
    const storage = this.getStorage();
    const storedUser = storage.getItem('current_user');
    const storedToken = storage.getItem('auth_token');
    // 如果 sessionStorage 中没有，尝试 localStorage（切换 remember 模式时）
    const fallbackUser = !storedUser ? localStorage.getItem('current_user') : null;
    const fallbackToken = !storedToken ? localStorage.getItem('auth_token') : null;

    const userData = storedUser || fallbackUser;
    const tokenData = storedToken || fallbackToken;

    if (userData && tokenData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.token = tokenData;
      } catch (error) {
        console.error('恢复用户信息失败:', error);
        this.clearAllStorage();
      }
    }
    this.notifyListeners();
  }

  private clearAllStorage() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');
    sessionStorage.removeItem('auth_token');
  }

  private persistAuth(user: AuthUser, token: string) {
    const storage = this.getStorage();
    storage.setItem('current_user', JSON.stringify(user));
    storage.setItem('auth_token', token);
    // 始终在 localStorage 中持久化 remember_me 设置
    localStorage.setItem('remember_me', String(this.rememberMe));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  getToken(): string | null {
    return this.token;
  }

  setRememberMe(value: boolean) {
    this.rememberMe = value;
    localStorage.setItem('remember_me', String(value));
  }

  getRememberMe(): boolean {
    return this.rememberMe;
  }

  onAuthChange(callback: (user: AuthUser | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  private isValidUsername(username: string): boolean {
    return /^[1-9][0-9]{3,15}$/.test(username);
  }

  async signIn(username: string, password: string, rememberMe?: boolean): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // @关键代码-不要随意删除 [登录前清理旧状态]
      // 原因：避免旧 token 干扰新登录请求，防止认证冲突
      this.signOutLocal();

      if (rememberMe !== undefined) {
        this.setRememberMe(rememberMe);
      }

      if (password.length < 6) {
        return {
          user: null,
          error: { message: '密码至少需要 6 个字符' }
        };
      }

      if (!this.isValidUsername(username)) {
        return {
          user: null,
          error: { message: '用户名必须是4-16位数字，且首位不能为0' }
        };
      }

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.delete('Authorization');

      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      if (!text) {
        return {
          user: null,
          error: { message: '服务器无响应，请稍后重试' }
        };
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return {
          user: null,
          error: { message: '响应解析失败，请稍后重试' }
        };
      }

      if (!response.ok || !data.success) {
        return {
          user: null,
          error: { message: data.error || '登录失败' }
        };
      }

      const user: AuthUser = {
        id: String(data.data.user.id),
        username: data.data.user.username,
        nickname: data.data.user.nickname,
      };

      this.currentUser = user;
      this.token = data.data.token;
      this.persistAuth(user, data.data.token);

      this.notifyListeners();
      return { user, error: null };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return {
          user: null,
          error: { message: '无法连接后端服务，请确认后端已启动' }
        };
      }
      return {
        user: null,
        error: { message: error instanceof Error ? error.message : '登录失败' }
      };
    }
  }

  async signUp(username: string, password: string, nickname?: string, recoveryPhrase?: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      this.signOutLocal();

      if (password.length < 6) {
        return {
          user: null,
          error: { message: '密码至少需要 6 个字符' }
        };
      }

      if (!this.isValidUsername(username)) {
        return {
          user: null,
          error: { message: '用户名必须是4-16位数字，且首位不能为0' }
        };
      }

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.delete('Authorization');

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ username, password, nickname, recovery_phrase: recoveryPhrase }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          user: null,
          error: { message: data.error || '注册失败' }
        };
      }

      const user: AuthUser = {
        id: String(data.data.user.id),
        username: data.data.user.username,
        nickname: data.data.user.nickname,
      };

      this.currentUser = user;
      this.token = data.data.token;
      this.persistAuth(user, data.data.token);

      this.notifyListeners();
      return { user, error: null };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return {
          user: null,
          error: { message: '无法连接后端服务，请确认后端已启动' }
        };
      }
      return {
        user: null,
        error: { message: error instanceof Error ? error.message : '注册失败' }
      };
    }
  }

  private signOutLocal() {
    this.currentUser = null;
    this.token = null;
    this.clearAllStorage();
    this.notifyListeners();
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // 调用后端使 token 失效
      if (this.token) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
        }).catch(() => {});
      }
    } finally {
      this.signOutLocal();
    }

    return { error: null };
  }

  async forgotPassword(username: string, recoveryPhrase: string): Promise<{ token: string | null; expiresIn: number | null; error: AuthError | null }> {
    try {
      if (!this.isValidUsername(username)) {
        return {
          token: null,
          expiresIn: null,
          error: { message: '用户名必须是4-16位数字，且首位不能为0' }
        };
      }

      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, recovery_phrase: recoveryPhrase }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          token: null,
          expiresIn: null,
          error: { message: data.error || '获取重置码失败' }
        };
      }

      return {
        token: data.data?.reset_token || null,
        expiresIn: data.data?.expires_in || null,
        error: null,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return {
          token: null,
          expiresIn: null,
          error: { message: '无法连接后端服务，请确认后端已启动' }
        };
      }
      return {
        token: null,
        expiresIn: null,
        error: { message: '获取重置码失败，请检查网络连接' }
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      if (newPassword.length < 6) {
        return { error: { message: '密码至少需要 6 个字符' } };
      }

      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { error: { message: data.error || '重置密码失败' } };
      }

      return { error: null };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return {
          error: { message: '无法连接后端服务，请确认后端已启动' }
        };
      }
      return {
        error: { message: '重置密码失败，请检查网络连接' }
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      if (!this.token) {
        return { error: { message: '未登录' } };
      }

      const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { error: { message: data.error || '更新密码失败' } };
      }

      // 密码更新后，后端已使当前 token 失效，需重新登录
      this.signOutLocal();
      return { error: null };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return { error: { message: '无法连接后端服务，请确认后端已启动' } };
      }
      return { error: { message: '更新密码失败，请检查网络连接' } };
    }
  }
}

export const authService = new AuthService();
