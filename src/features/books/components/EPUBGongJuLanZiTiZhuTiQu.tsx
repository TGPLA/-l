// @审计已完成
// EPUB 工具栏字体主题区域组件

import React from 'react';
import type { ZhuTiLeiXing } from '../hooks/useZhuTi';

interface EPUBGongJuLanZiTiZhuTiQuProps {
  darkMode: boolean;
  zhuTi: ZhuTiLeiXing;
  onZhuTiBianHua: (zhuTi: ZhuTiLeiXing) => void;
  ziTiDaXiao: number;
  onZiTiDaXiaoBianHua: (daXiao: number) => void;
}

export function EPUBGongJuLanZiTiZhuTiQu({
  darkMode,
  zhuTi,
  onZhuTiBianHua,
  ziTiDaXiao,
  onZiTiDaXiaoBianHua,
}: EPUBGongJuLanZiTiZhuTiQuProps) {
  const zhuTiXuanXiang: { value: ZhuTiLeiXing; label: string }[] = [
    { value: 'light', label: '日间' },
    { value: 'dark', label: '夜间' },
    { value: 'eye', label: '护眼' },
  ];

  return (
    <>
      <select
        value={zhuTi}
        onChange={(e) => onZhuTiBianHua(e.target.value as ZhuTiLeiXing)}
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
          backgroundColor: darkMode ? '#374151' : '#ffffff',
          color: darkMode ? '#f9fafb' : '#111827',
          fontSize: '0.875rem'
        }}
      >
        {zhuTiXuanXiang.map(xuanXiang => (
          <option key={xuanXiang.value} value={xuanXiang.value}>
            {xuanXiang.label}
          </option>
        ))}
      </select>

      <button onClick={() => onZiTiDaXiaoBianHua(Math.max(80, ziTiDaXiao - 10))} style={{ 
        padding: '0.5rem 0.75rem', 
        border: 'none', 
        borderRadius: '0.5rem', 
        backgroundColor: '#6b7280', 
        color: '#ffffff', 
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}>
        A-
      </button>
      <span style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280', minWidth: '40px', textAlign: 'center' }}>
        {ziTiDaXiao}%
      </span>
      <button onClick={() => onZiTiDaXiaoBianHua(Math.min(200, ziTiDaXiao + 10))} style={{ 
        padding: '0.5rem 0.75rem', 
        border: 'none', 
        borderRadius: '0.5rem', 
        backgroundColor: '#6b7280', 
        color: '#ffffff', 
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}>
        A+
      </button>
    </>
  );
}
