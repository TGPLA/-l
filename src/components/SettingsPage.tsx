import { useState, useEffect } from 'react';
import { useApp } from '../hooks';
import type { Settings } from '../types';
import { validateApiKey } from '../api/zhipu';
import { getResponsiveValue } from '../utils/responsive';
import { authService } from '../services/auth';
import { cloudStorage } from '../services/cloudStorage';
import { syncService } from '../services/sync';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [showSyncConflict, setShowSyncConflict] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<any[]>([]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const user = authService.getCurrentUser();
  const isLoggedIn = authService.isAuthenticated();
  const lastSyncTime = cloudStorage.getLastSyncTime();

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleDarkMode = () => {
    const newSettings = { ...formData, darkMode: !formData.darkMode };
    setFormData(newSettings);
    updateSettings(newSettings);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showAuthModal) return;
      
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!authLoading && !authSuccess) {
          handleAuth();
        }
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAuthModal(false);
        setAuthError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showAuthModal, email, password, confirmPassword, authMode, authLoading, authSuccess]);

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return '请输入邮箱';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return '邮箱格式不正确';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return '请输入密码';
    }
    if (password.length < 6) {
      return '密码长度至少为 6 位';
    }
    if (password.length > 50) {
      return '密码长度不能超过 50 位';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return '密码必须包含字母';
    }
    if (!/[0-9]/.test(password)) {
      return '密码必须包含数字';
    }
    return '';
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (password.length >= 12) strength += 1;
    
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  const validateConfirmPassword = (password: string, confirm: string): string => {
    if (!confirm.trim()) {
      return '请确认密码';
    }
    if (password !== confirm) {
      return '两次输入的密码不一致';
    }
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    setPasswordStrength(calculatePasswordStrength(value));
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmPasswordError(validateConfirmPassword(password, value));
  };

  const handleAuth = async () => {
    setAuthError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAuthLoading(true);
    setAuthSuccess(false);
    
    try {
      if (authMode === 'login') {
        await authService.login(email, password);
        if (rememberPassword) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      } else {
        await authService.register(email, password, confirmPassword);
      }
      
      setAuthSuccess(true);
      setTimeout(() => {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAuthSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '认证失败');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload();
  };

  const handleResetPassword = async () => {
    setResetError('');
    setResetEmailError(validateEmail(resetEmail));
    
    if (resetEmailError) {
      return;
    }
    
    setResetLoading(true);
    
    try {
      await authService.resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
        setResetSuccess(false);
      }, 2000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : '重置密码失败');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isLoggedIn) {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberPassword(true);
      }
      setShowAuthModal(true);
      return;
    }

    setSyncing(true);
    setSyncStatus('正在同步数据...');

    try {
      const result = await syncService.syncData();
      
      if (result.conflicts.length > 0) {
        setSyncConflicts(result.conflicts);
        setShowSyncConflict(true);
        setSyncStatus('发现数据冲突');
      } else if (result.downloaded) {
        setSyncStatus('数据已从云端同步');
        setTimeout(() => window.location.reload(), 1500);
      } else if (result.uploaded) {
        setSyncStatus('数据已上传到云端');
      }
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '同步失败');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleResolveConflict = async (useRemote: boolean) => {
    setShowSyncConflict(false);
    setSyncing(true);
    setSyncStatus('正在解决冲突...');

    try {
      await syncService.resolveConflicts(syncConflicts, useRemote);
      setSyncStatus('冲突已解决，正在重新加载...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : '解决冲突失败');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleValidateApiKey = async () => {
    if (!formData.zhipuApiKey) {
      setValidationResult({ valid: false, message: '请先输入 API Key' });
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(formData.zhipuApiKey, formData.zhipuModel || 'glm-4-flash');
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: error instanceof Error ? error.message : '验证失败',
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书架
        </button>

        <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>⚙️ 设置</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>外观设置</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '0.75rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) }}>
              <div>
                <p style={{ fontWeight: 500, color: settings.darkMode ? '#f9fafb' : '#111827' }}>深色模式</p>
                <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>切换深色/浅色主题</p>
              </div>
              <button
                onClick={handleToggleDarkMode}
                style={{
                  position: 'relative',
                  width: '3.5rem',
                  height: '1.75rem',
                  borderRadius: '9999px',
                  backgroundColor: formData.darkMode ? '#3b82f6' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: formData.darkMode ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 0 20px rgba(209, 213, 219, 0.4)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    left: formData.darkMode ? '1.75rem' : '0.25rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '9999px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {formData.darkMode ? (
                    <svg style={{ width: '0.75rem', height: '0.75rem', color: '#fbbf24' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg style={{ width: '0.75rem', height: '0.75rem', color: '#6366f1' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.646-3.646 9 9 0 01-2.292-2.292zM12 3a9.003 9.003 0 00-8.646 3.646 9 9 0 012.292 2.292 9 9 0 01-3.646 8.646A9.003 9.003 0 0012 21a9.003 9.003 0 003.646-8.646 9 9 0 01-2.292-2.292z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>智谱 AI API 配置</h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>
              配置智谱 AI API 以使用 AI 生成问题和概念纠错功能
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                  智谱 AI API Key
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }) }}>
                  <input
                    type="password"
                    value={formData.zhipuApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, zhipuApiKey: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      width: getResponsiveValue({ mobile: '100%', tablet: 'auto' }),
                      backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                      color: settings.darkMode ? '#f9fafb' : '#111827',
                    }}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                    onClick={handleValidateApiKey}
                    disabled={validating}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: validating ? '#9ca3af' : '#10b981',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: validating ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {validating ? '验证中...' : '验证'}
                  </button>
                </div>
                {validationResult && (
                  <p style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    color: validationResult.valid ? '#10b981' : '#ef4444',
                  }}>
                    {validationResult.message}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', color: settings.darkMode ? '#6b7280' : '#9ca3af', marginTop: '0.25rem' }}>
                  在 <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>智谱 AI 开放平台</a> 获取 API Key
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                  模型选择
                </label>
                <select
                  value={formData.zhipuModel || 'glm-4-flash'}
                  onChange={(e) => setFormData({ ...formData, zhipuModel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                    color: settings.darkMode ? '#f9fafb' : '#111827',
                  }}
                >
                  <option value="glm-4-flash">GLM-4-Flash (快速)</option>
                  <option value="glm-4">GLM-4 (标准)</option>
                  <option value="glm-4-plus">GLM-4-Plus (增强)</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: settings.darkMode ? '#6b7280' : '#9ca3af', marginTop: '0.25rem' }}>
                  GLM-4-Flash 速度快且成本低，GLM-4-Plus 效果最好
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {saved ? '✓ 已保存' : '保存设置'}
            </button>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>数据同步</h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>
              在不同设备之间同步您的数据
            </p>

            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '0.5rem', tablet: '0' }) }}>
                  <div>
                    <p style={{ fontWeight: 500, color: settings.darkMode ? '#f9fafb' : '#111827' }}>已登录</p>
                    <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    退出登录
                  </button>
                </div>

                {lastSyncTime && (
                  <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>
                    上次同步: {new Date(lastSyncTime).toLocaleString('zh-CN')}
                  </p>
                )}

                <button
                  onClick={handleSync}
                  disabled={syncing}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: syncing ? '#9ca3af' : '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: syncing ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {syncing ? '同步中...' : '立即同步'}
                </button>

                {syncStatus && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: syncStatus.includes('失败') || syncStatus.includes('冲突') ? '#ef4444' : '#10b981',
                  }}>
                    {syncStatus}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                登录以启用数据同步
              </button>
            )}
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>数据管理</h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem' }}>
              所有数据保存在浏览器本地存储中
            </p>
            <button
              onClick={async () => {
                const confirmed = await window.confirm('确定要清除所有数据吗？此操作不可恢复。');
                if (confirmed) {
                  try {
                    window.localStorage.clear();
                    window.alert('数据已清除');
                    window.location.reload();
                  } catch (error) {
                    window.alert('清除数据失败');
                  }
                } else {
                  window.alert('操作已取消');
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              清除所有数据
            </button>
          </div>

          <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', boxShadow: settings.darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>关于</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>
              <p><strong>阅读回响 (ReadRecall)</strong></p>
              <p>一个帮助读者通过主动回忆机制加深书籍理解的个人刷题工具。</p>
              <p style={{ fontSize: '0.875rem' }}>版本: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1.5rem' }}>
              {authMode === 'login' ? '登录' : '注册'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: emailError ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                    color: settings.darkMode ? '#f9fafb' : '#111827',
                    transition: focusedInput === 'email' ? 'border-color 0.2s, box-shadow 0.2s' : 'none',
                    boxShadow: focusedInput === 'email' ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                  }}
                  placeholder="your@email.com"
                />
                {emailError && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                  密码
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                      border: passwordError ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                      color: settings.darkMode ? '#f9fafb' : '#111827',
                      transition: focusedInput === 'password' ? 'border-color 0.2s, box-shadow 0.2s' : 'none',
                      boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      color: settings.darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    {showPassword ? (
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    {passwordError}
                  </p>
                )}
                {password && passwordStrength > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: '0.25rem',
                            backgroundColor: passwordStrength >= level 
                              ? level <= 2 ? '#ef4444' 
                              : level <= 3 ? '#f59e0b' 
                              : '#10b981'
                              : '#d1d5db',
                            borderRadius: '0.125rem',
                            transition: 'background-color 0.3s',
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>
                      {passwordStrength <= 2 ? '弱' : passwordStrength <= 3 ? '中等' : passwordStrength <= 4 ? '强' : '非常强'}
                    </p>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                    确认密码
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                      onFocus={() => setFocusedInput('confirmPassword')}
                      onBlur={() => setFocusedInput(null)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                        border: confirmPasswordError ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                        color: settings.darkMode ? '#f9fafb' : '#111827',
                        transition: focusedInput === 'confirmPassword' ? 'border-color 0.2s, box-shadow 0.2s' : 'none',
                        boxShadow: focusedInput === 'confirmPassword' ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        color: settings.darkMode ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      {showConfirmPassword ? (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              )}

              {authError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '0.5rem',
                  animation: 'shake 0.5s ease-in-out',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', margin: 0 }}>
                    {authError}
                  </p>
                </div>
              )}

              <button
                onClick={handleAuth}
                disabled={authLoading || authSuccess}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: authSuccess ? '#10b981' : authLoading ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: authLoading || authSuccess ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                }}
              >
                {authLoading ? (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {authMode === 'login' ? '登录中...' : '注册中...'}
                  </>
                ) : authSuccess ? (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {authMode === 'login' ? '登录成功' : '注册成功'}
                  </>
                ) : (
                  authMode === 'login' ? '登录' : '注册'
                )}
              </button>

              {authMode === 'login' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      cursor: 'pointer',
                    }}
                  />
                  <label
                    htmlFor="remember"
                    style={{
                      fontSize: '0.875rem',
                      color: settings.darkMode ? '#9ca3af' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    记住我
                  </label>
                </div>
              )}

              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setShowResetModal(true);
                    setResetEmail(email);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#3b82f6',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  忘记密码？
                </button>
              )}

              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  borderRadius: '0.5rem',
                  border: '1px solid #3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {authMode === 'login' ? '没有账号？注册' : '已有账号？登录'}
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError('');
                  setEmailError('');
                  setPasswordError('');
                  setConfirmPasswordError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: settings.darkMode ? '#9ca3af' : '#6b7280',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>
              重置密码
            </h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1.5rem' }}>
              输入您的邮箱地址，我们将为您生成临时密码
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: settings.darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.25rem' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetEmailError(validateEmail(e.target.value));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: resetEmailError ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                    color: settings.darkMode ? '#f9fafb' : '#111827',
                  }}
                  placeholder="your@email.com"
                />
                {resetEmailError && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    {resetEmailError}
                  </p>
                )}
              </div>

              {resetError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '0.5rem',
                  animation: 'shake 0.5s ease-in-out',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', margin: 0 }}>
                    {resetError}
                  </p>
                </div>
              )}

              {resetSuccess && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '0.5rem',
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#10b981', margin: 0 }}>
                    ✓ 临时密码已生成，请查看弹窗
                  </p>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={resetLoading || resetSuccess}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: resetSuccess ? '#10b981' : resetLoading ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: resetLoading || resetSuccess ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {resetLoading ? (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    处理中...
                  </>
                ) : resetSuccess ? (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    完成
                  </>
                ) : (
                  '生成临时密码'
                )}
              </button>

              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetEmail('');
                  setResetEmailError('');
                  setResetError('');
                  setResetSuccess(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: settings.darkMode ? '#9ca3af' : '#6b7280',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showSyncConflict && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>
              发现数据冲突
            </h2>
            <p style={{ fontSize: '0.875rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1.5rem' }}>
              本地和云端都有数据修改，请选择要保留的数据版本
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => handleResolveConflict(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                使用本地数据
              </button>

              <button
                onClick={() => handleResolveConflict(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                使用云端数据
              </button>

              <button
                onClick={() => setShowSyncConflict(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: settings.darkMode ? '#9ca3af' : '#6b7280',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
