import { useState } from 'react';
import { authService } from '../services/supabaseAuth';
import { getResponsiveValue } from '../utils/responsive';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user, error: authError } = await authService.signIn(email, password);
        if (authError) {
          setError(authError.message);
        } else if (user) {
          onAuthSuccess();
        }
      } else {
        const { user, error: authError } = await authService.signUp(email, password);
        if (authError) {
          setError(authError.message);
        } else if (user) {
          onAuthSuccess();
        } else {
          setError('注册成功，请检查邮箱验证');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const { error } = await authService.resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setError('密码重置邮件已发送，请检查邮箱');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: getResponsiveValue({ mobile: '1rem', tablet: '2rem' })
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }),
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: getResponsiveValue({ mobile: '1.5rem', tablet: '1.875rem' }),
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>
            {isLogin ? '欢迎回来' : '创建账户'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {isLogin ? '登录以继续学习' : '开始你的学习之旅'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {isLogin && (
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                忘记密码？
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          {isLogin ? '还没有账户？' : '已有账户？'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
            继续即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
}
