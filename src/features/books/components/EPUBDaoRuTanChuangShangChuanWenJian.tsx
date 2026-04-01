// @审计已完成
// EPUB 导入弹窗 - 文件选择子组件

import { useRef } from 'react';
import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface EPUBDaoRuTanChuangShangChuanWenJianProps {
  darkMode: boolean;
  loading: boolean;
  selectedFile: File | null;
  onFileSelected: (file: File) => void;
  onError: (error: string) => void;
}

export function EPUBDaoRuTanChuangShangChuanWenJian({ darkMode, loading, selectedFile, onFileSelected, onError }: EPUBDaoRuTanChuangShangChuanWenJianProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.epub')) {
      onError('请选择 EPUB 文件');
      return;
    }

    onFileSelected(file);
  };

  return (
    <label
      htmlFor="epub-file-input-v2"
      style={{
        display: 'block',
        border: `2px dashed ${darkMode ? '#4b5563' : '#d1d5db'}`,
        borderRadius: '0.5rem',
        padding: '2rem',
        textAlign: 'center',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'border-color 0.2s',
        opacity: loading ? 0.7 : 1,
        marginBottom: '1rem',
      }}
      onClick={loading ? (e) => e.preventDefault() : undefined}
    >
      <input
        id="epub-file-input-v2"
        ref={fileInputRef}
        type="file"
        accept=".epub"
        onChange={handleFileSelect}
        disabled={loading}
        style={{ display: 'none' }}
      />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <JiaZaiZhuangTai chiCun="large" />
          <p style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>正在上传...</p>
        </div>
      ) : selectedFile ? (
        <>
          <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p style={{ marginTop: '1rem', color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
            已选择：{selectedFile.name}
          </p>
          <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.5rem' }}>
            点击可重新选择
          </p>
        </>
      ) : (
        <>
          <svg style={{ width: '3rem', height: '3rem', margin: '0 auto', color: darkMode ? '#6b7280' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p style={{ marginTop: '1rem', color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
            点击选择 EPUB 文件
          </p>
        </>
      )}
    </label>
  );
}
