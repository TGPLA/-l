// @审计已完成
// 修改密码弹窗组件 - 修改密码表单弹窗

import { useState } from 'react';

interface XiuGaiMiMaTanChuangProps {
  darkMode: boolean;
  onClose: () => void;
  onConfirm: (newPassword: string) => Promise<void>;
}

export function XiuGaiMiMaTanChuang({ darkMode, onClose, onConfirm }: XiuGaiMiMaTanChuangProps) {
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    if (passwordForm.newPassword.length < 6) {
      setError('新密码至少需要 6 个字符');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    await onConfirm(passwordForm.newPassword);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', maxWidth: '24rem', width: '100%' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>修改密码</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>新密码</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="至少 6 个字符"
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>确认密码</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="再次输入新密码"
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827' }}
            />
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', backgroundColor: darkMode ? '#374151' : '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={() => { setError(''); setPasswordForm({ newPassword: '', confirmPassword: '' }); onClose(); }}
            style={{ padding: '0.5rem 1rem', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer' }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !passwordForm.newPassword || !passwordForm.confirmPassword}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  );
}
