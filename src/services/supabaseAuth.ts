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
      });

      if (error) {
        return { user: null, error: { message: error.message } };
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
        error: { message: error instanceof Error ? error.message : '注册失败' } 
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
        return { user: null, error: { message: error.message } };
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
        error: { message: error instanceof Error ? error.message : '登录失败' } 
      };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message } };
      }
      this.currentUser = null;
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '登出失败' } 
      };
    }
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '重置密码失败' } 
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : '更新密码失败' } 
      };
    }
  }
}

export const authService = new AuthService();
