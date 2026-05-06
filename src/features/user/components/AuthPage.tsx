import { useState } from 'react';
import { authService } from '@shared/services/auth';
import { getResponsiveValue } from '@shared/utils/responsive';

interface AuthPageProps {
  onAuthSuccess: () => void;
  backendAvailable?: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot-step1' | 'forgot-step2';

export function AuthPage({ onAuthSuccess, backendAvailable = true }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [rememberMe, setRememberMe] = useState(authService.getRememberMe());
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = (newMode: AuthMode) => {
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setNickname('');
    setRecoveryPhrase('');
    setResetToken('');
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, error: authError } = await authService.signIn(username, password, rememberMe);
        if (authError) {
          setError(authError.message);
        } else if (user) {
          onAuthSuccess();
        }
      } else if (mode === 'register') {
        const { user, error: authError } = await authService.signUp(
          username,
          password,
          nickname || undefined,
          recoveryPhrase || undefined
        );
        if (authError) {
          setError(authError.message);
        } else if (user) {
          onAuthSuccess();
        }
      } else if (mode === 'forgot-step1') {
        const { token, expiresIn, error: authError } = await authService.forgotPassword(username, recoveryPhrase);
        if (authError) {
          setError(authError.message);
        } else if (token) {
          setResetToken(token);
          setSuccess(`重置码已获取，有效期 ${Math.floor((expiresIn || 900) / 60)} 分钟。请复制下方重置码并进入下一步。`);
        }
      } else if (mode === 'forgot-step2') {
        const { error: authError } = await authService.resetPassword(resetToken, password);
        if (authError) {
          setError(authError.message);
        } else {
          setSuccess('密码重置成功！请使用新密码登录。');
          setTimeout(() => resetForm('login'), 1500);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot-step1' || mode === 'forgot-step2';

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
  };

  const buttonStyle = (disabled: boolean) => ({
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
  });

  const linkStyle = {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  } as const;

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
            {isLogin ? '欢迎回来' : isRegister ? '创建账户' : '找回密码'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {isLogin ? '登录以继续学习' : isRegister ? '开始你的学习之旅' : '验证身份以重置密码'}
          </p>
        </div>

        {!backendAvailable && (
          <div style={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            后端服务未启动，当前仅可预览登录界面。登录功能需先启动后端服务。
          </div>
        )}

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

        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#059669',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            wordBreak: 'break-all',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 用户名 - login/register/forgot-step1 都显示 */}
          {(mode !== 'forgot-step2') && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                用户名（4-16位数字，首位不为0）
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
                required
                placeholder="例如：10001"
                maxLength={16}
                style={inputStyle}
              />
            </div>
          )}

          {/* 密码 - login/register/forgot-step2 都显示 */}
          {!isForgot && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                密码（至少6位）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {/* 忘记密码第二步也显示密码输入 */}
          {mode === 'forgot-step2' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                新密码（至少6位）
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
          )}

          {/* 重置码 - forgot-step2 */}
          {mode === 'forgot-step2' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                重置码
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value.trim())}
                required
                placeholder="请输入获取到的重置码"
                style={inputStyle}
              />
            </div>
          )}

          {/* 昵称 - 仅注册 */}
          {isRegister && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                昵称（选填）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己起个名字"
                maxLength={50}
                style={inputStyle}
              />
            </div>
          )}

          {/* 恢复短语 - 仅注册 */}
          {isRegister && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                恢复短语（选填，用于找回密码）
              </label>
              <input
                type="text"
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                placeholder="设置一个你能记住的短语"
                maxLength={100}
                style={inputStyle}
              />
            </div>
          )}

          {/* 恢复短语 - forgot-step1 */}
          {mode === 'forgot-step1' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                恢复短语（注册时设置的）
              </label>
              <input
                type="text"
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                required
                placeholder="请输入注册时设置的恢复短语"
                maxLength={100}
                style={inputStyle}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                如果未设置恢复短语，将无法自助找回密码
              </p>
            </div>
          )}

          {/* 记住我 - 仅登录 */}
          {isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '0.875rem', color: '#374151', cursor: 'pointer' }}>
                记住我
              </label>
            </div>
          )}

          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? '处理中...' :
              isLogin ? '登录' :
              isRegister ? '注册' :
              mode === 'forgot-step1' ? '获取重置码' :
              '重置密码'}
          </button>
        </form>

        {/* 忘记密码第二步：已有重置码直接进入 */}
        {mode === 'forgot-step1' && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => resetForm('forgot-step2')}
              style={linkStyle}
            >
              已有重置码？直接重置
            </button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          {isLogin && (
            <>
              还没有账户？{' '}
              <button onClick={() => resetForm('register')} style={linkStyle}>立即注册</button>
              <span style={{ margin: '0 0.5rem' }}>|</span>
              <button onClick={() => resetForm('forgot-step1')} style={linkStyle}>忘记密码</button>
            </>
          )}
          {isRegister && (
            <>
              已有账户？{' '}
              <button onClick={() => resetForm('login')} style={linkStyle}>立即登录</button>
            </>
          )}
          {isForgot && (
            <>
              <button onClick={() => resetForm('login')} style={linkStyle}>返回登录</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
