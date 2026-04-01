// @审计已完成
// 后端服务不可用提示组件

import { useState, useEffect } from 'react';
import { checkBackendHealth, type HealthStatus } from '@shared/services/healthCheck';
import { getResponsiveValue } from '@shared/utils/responsive';

interface BackendUnavailableProps {
  darkMode?: boolean;
}

export function BackendUnavailable({ darkMode = false }: BackendUnavailableProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    const status = await checkBackendHealth();
    setHealthStatus(status);
    setChecking(false);
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: darkMode ? '#111827' : '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getResponsiveValue({ mobile: '1rem', tablet: '2rem' }),
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: '1rem',
    boxShadow: darkMode ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    padding: getResponsiveValue({ mobile: '1.5rem', tablet: '2rem' }),
    maxWidth: '32rem',
    width: '100%',
    textAlign: 'center' as const,
  };

  const iconStyle = {
    width: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }),
    height: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }),
    margin: '0 auto 1.5rem',
    color: '#f59e0b',
  };

  const titleStyle = {
    fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }),
    fontWeight: 700,
    color: darkMode ? '#f9fafb' : '#111827',
    marginBottom: '1rem',
  };

  const messageStyle = {
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  };

  const stepsContainerStyle = {
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
  };

  const stepStyle = {
    fontSize: '0.875rem',
    color: darkMode ? '#e5e7eb' : '#374151',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  };

  const numberStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '9999px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  };

  const retryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
    color: darkMode ? '#9ca3af' : '#6b7280',
  };

  const statusStyle = {
    fontSize: '0.875rem',
    color: checking ? '#6b7280' : (healthStatus?.isBackendAvailable ? '#10b981' : '#ef4444'),
    marginTop: '1rem',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>

        <h1 style={titleStyle}>后端服务不可用</h1>

        <p style={messageStyle}>
          {healthStatus?.errorMessage || '无法连接到后端服务，请检查后端是否正常运行'}
        </p>

        <div style={stepsContainerStyle}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '0.75rem' }}>
            📋 启动步骤：
          </p>
          <div style={stepStyle}>
            <span style={numberStyle}>1</span>
            <span>建立 SSH 隧道：<code style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>ssh -f -N -L 3307:127.0.0.1:3306 root@linyubo.top</code></span>
          </div>
          <div style={stepStyle}>
            <span style={numberStyle}>2</span>
            <span>启动后端服务：<code style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>cd backend && go run main.go</code></span>
          </div>
          <div style={stepStyle}>
            <span style={numberStyle}>3</span>
            <span>等待后端显示 <strong style={{ color: '#10b981' }}>✅ 服务器已启动</strong></span>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={buttonStyle}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058h5.828a2 2 0 002.828-2.828l.707-.707a2 2 0 112.828 2.828l-.707.707A6 6 0 004 14v5a2 2 0 002 2h16a2 2 0 002-2v-2h-2v2H6v-2zm0 0a6 6 0 016-6v5a2 2 0 002 2h5a6 6 0 01-6 6z" />
          </svg>
          刷新页面
        </button>

        <button
          onClick={checkHealth}
          disabled={checking}
          style={retryButtonStyle}
        >
          <svg style={{ width: '1rem', height: '1rem', animation: checking ? 'spin 1s linear infinite' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.058h5.828a2 2 0 002.828-2.828l.707-.707a2 2 0 112.828 2.828l-.707.707A6 6 0 004 14v5a2 2 0 002 2h16a2 2 0 002-2v-2h-2v2H6v-2zm0 0a6 6 0 016-6v5a2 2 0 002 2h5a6 6 0 01-6 6z" />
          </svg>
          {checking ? '检查中...' : '重新检查'}
        </button>

        <p style={statusStyle}>
          {checking ? '正在检查后端状态...' : (healthStatus?.isBackendAvailable ? '✓ 后端服务正常' : '✗ 后端服务不可用')}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
