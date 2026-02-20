import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  private translateErrorMessage(error: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': '邮箱或密码错误',
      'User already registered': '该邮箱已被注册',
      'Email not confirmed': '请先验证邮箱',
      'Password should be at least 6 characters': '密码至少需要6个字符',
      'Unable to validate email address: invalid format': '邮箱格式不正确',
      'Signups not allowed for this instance': '当前不允许注册新用户',
      'Email rate limit exceeded': '发送邮件过于频繁，请稍后再试',
      'Invalid email': '邮箱格式不正确',
      'Password is too short': '密码过短',
      'User not found': '用户不存在',
      'Invalid password': '密码错误',
      'Email already confirmed': '邮箱已验证',
      'Signup not allowed': '注册功能已关闭',
      'Invalid token': '验证链接无效或已过期',
      'Token has expired or is invalid': '验证链接无效或已过期',
      'Email link is invalid or expired': '验证链接无效或已过期',
    };

    return errorMap[error] || error;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.currentUser = {
        id: session.user.id,
        email: session.user.email || ''
      };
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email || ''
        };
      } else {
        this.currentUser = null;
      }
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
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
    return this.currentUser !== null;
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            skip_email_verification: true
          }
        }
      });

      if (error) {
        return { user: null, error: { message: this.translateErrorMessage(error.message) } };
      }

      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || ''
        };
        return { user: this.currentUser, error: null };
      }

      return { user: null, error: { message: '注册失败' } };
    } catch (error) {
      return { 
        user: null, 
        error: { message: error instanceof Error ? this.translateErrorMessage(error.message) : '注册失败' } 
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: this.translateErrorMessage(error.message) } };
      }

      if (data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email || ''
        };
        return { user: this.currentUser, error: null };
      }

      return { user: null, error: { message: '登录失败' } };
    } catch (error) {
      return { 
        user: null, 
        error: { message: error instanceof Error ? this.translateErrorMessage(error.message) : '登录失败' } 
      };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: this.translateErrorMessage(error.message) } };
      }
      this.currentUser = null;
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? this.translateErrorMessage(error.message) : '登出失败' } 
      };
    }
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: { message: this.translateErrorMessage(error.message) } };
      }
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? this.translateErrorMessage(error.message) : '重置密码失败' } 
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { error: { message: this.translateErrorMessage(error.message) } };
      }
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? this.translateErrorMessage(error.message) : '更新密码失败' } 
      };
    }
  }
}

export const authService = new AuthService();
