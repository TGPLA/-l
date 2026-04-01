// @审计已完成
// EPUB 工具栏搜索区域组件

import React from 'react';

interface EPUBGongJuLanSouSuoQuProps {
  darkMode: boolean;
  souSuoCi: string;
  onSouSuoCiBianHua: (ci: string) => void;
  souSuoJieGuoShuLiang: number;
  dangQianJieGuo: number;
  onShangYiGe: () => void;
  onXiaYiGe: () => void;
}

export function EPUBGongJuLanSouSuoQu({
  darkMode,
  souSuoCi,
  onSouSuoCiBianHua,
  souSuoJieGuoShuLiang,
  dangQianJieGuo,
  onShangYiGe,
  onXiaYiGe,
}: EPUBGongJuLanSouSuoQuProps) {
  return (
    <>
      <input
        type="text"
        placeholder="搜索..."
        value={souSuoCi}
        onChange={(e) => onSouSuoCiBianHua(e.target.value)}
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          color: darkMode ? '#f9fafb' : '#111827',
          fontSize: '0.875rem'
        }}
      />
      
      {souSuoJieGuoShuLiang > 0 && (
        <>
          <button onClick={onShangYiGe} style={{ 
            padding: '0.5rem 1rem', 
            border: 'none', 
            borderRadius: '0.5rem', 
            backgroundColor: '#3b82f6', 
            color: '#ffffff', 
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            ↑
          </button>
          <span style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            {dangQianJieGuo + 1}/{souSuoJieGuoShuLiang}
          </span>
          <button onClick={onXiaYiGe} style={{ 
            padding: '0.5rem 1rem', 
            border: 'none', 
            borderRadius: '0.5rem', 
            backgroundColor: '#3b82f6', 
            color: '#ffffff', 
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
            ↓
          </button>
        </>
      )}
    </>
  );
}
