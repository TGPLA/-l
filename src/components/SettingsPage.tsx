import { useState, useEffect } from 'react';
import { useApp } from '../hooks';
import type { Settings } from '../types';
import { validateApiKey } from '../api/zhipu';
import { getResponsiveValue } from '../utils/responsive';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings } = useApp();
  const [formData, setFormData] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回书架
        </button>

        <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: '#111827', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>⚙️ 设置</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>外观设置</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: getResponsiveValue({ mobile: 'column', tablet: 'row' }), gap: getResponsiveValue({ mobile: '0.75rem', tablet: '0' }), alignItems: getResponsiveValue({ mobile: 'flex-start', tablet: 'center' }) }}>
              <div>
                <p style={{ fontWeight: 500, color: '#111827' }}>深色模式</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>切换深色/浅色主题</p>
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
                  transition: 'background-color 0.2s',
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
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
            <h2 style={{ fontSize: getResponsiveValue({ mobile: '1rem', tablet: '1.125rem' }), fontWeight: 600, color: '#111827', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>智谱 AI API 配置</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: getResponsiveValue({ mobile: '0.75rem', tablet: '1rem' }) }}>
              配置智谱 AI API 以使用 AI 生成问题和概念纠错功能
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
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
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  在 <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>智谱 AI 开放平台</a> 获取 API Key
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
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
                  }}
                >
                  <option value="glm-4-flash">GLM-4-Flash (快速)</option>
                  <option value="glm-4">GLM-4 (标准)</option>
                  <option value="glm-4-plus">GLM-4-Plus (增强)</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
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

          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>数据管理</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
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

          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>关于</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#6b7280' }}>
              <p><strong>阅读回响 (ReadRecall)</strong></p>
              <p>一个帮助读者通过主动回忆机制加深书籍理解的个人刷题工具。</p>
              <p style={{ fontSize: '0.875rem' }}>版本: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
