// @审计已完成
// 书架空状态组件 - 空书架显示和操作引导

import { getResponsiveValue } from '@shared/utils/responsive';

interface BookShieKongZhiProps {
  darkMode: boolean;
  onAddBook: () => void;
  onImportEPUB: () => void;
}

export function BookShieKongZhi({ darkMode, onAddBook, onImportEPUB }: BookShieKongZhiProps) {
  return (
    <div style={{ textAlign: 'center', padding: getResponsiveValue({ mobile: '3rem 0', tablet: '5rem 0' }) }}>
      <div style={{ fontSize: getResponsiveValue({ mobile: '3rem', tablet: '4rem' }), marginBottom: '1rem' }}>📖</div>
      <h2 style={{ fontSize: getResponsiveValue({ mobile: '1.125rem', tablet: '1.25rem' }), fontWeight: 600, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>书架空空如也</h2>
      <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }), fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>添加第一本书开始你的阅读之旅</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button onClick={onAddBook} style={{ padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }), backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>添加书籍</button>
        <button onClick={onImportEPUB} style={{ padding: getResponsiveValue({ mobile: '0.5rem 1rem', tablet: '0.75rem 1.5rem' }), backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>导入 EPUB</button>
      </div>
    </div>
  );
}
