// @审计已完成
// 账户信息组件 - 展示用户账户信息和修改密码入口

import type { AuthUser } from '@shared/services/auth';

interface ZhangHuXinXiProps {
  currentUser: AuthUser | null;
  darkMode: boolean;
  onOpenPasswordModal: () => void;
}

export function ZhangHuXinXi({ currentUser, darkMode, onOpenPasswordModal }: ZhangHuXinXiProps) {
  return (
    <div style={{
      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>
        账户信息
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>用户名</span>
          <span style={{ color: darkMode ? '#f9fafb' : '#111827', fontWeight: 500 }}>
            {currentUser?.username || '未登录'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>账户状态</span>
          <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 500 }}>已登录</span>
        </div>
      </div>
      <button
        onClick={onOpenPasswordModal}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: darkMode ? '#374151' : '#f3f4f6',
          color: darkMode ? '#f9fafb' : '#111827',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        修改密码
      </button>
    </div>
  );
}
