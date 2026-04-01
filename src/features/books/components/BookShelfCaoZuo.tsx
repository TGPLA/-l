// @审计已完成
// 书架操作栏组件 - 顶部按钮组

import { getResponsiveValue } from '@shared/utils/responsive';

interface BookShelfCaoZuoProps {
  darkMode: boolean;
  onAddBook: () => void;
  onImportEPUB: () => void;
  onOpenSettings: () => void;
}

export function BookShelfCaoZuo({ darkMode, onAddBook, onImportEPUB, onOpenSettings }: BookShelfCaoZuoProps) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button onClick={onAddBook} style={{ padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>
        <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        添加书籍
      </button>
      <button onClick={onImportEPUB} style={{ padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>
        <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        导入 EPUB
      </button>
      <button onClick={onOpenSettings} style={{ padding: getResponsiveValue({ mobile: '0.375rem 0.75rem', tablet: '0.5rem 1rem' }), backgroundColor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#f9fafb' : '#111827', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: getResponsiveValue({ mobile: '0.875rem', tablet: '0.875rem' }) }}>
        <svg style={{ width: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }), height: getResponsiveValue({ mobile: '1rem', tablet: '1.25rem' }) }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        设置
      </button>
    </div>
  );
}
