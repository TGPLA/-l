// @审计已完成
// EPUB 工具栏标题区域组件

import React from 'react';

interface EPUBGongJuLanBiaoTiQuProps {
  darkMode: boolean;
  yeMaXinXi: string;
}

export function EPUBGongJuLanBiaoTiQu({ darkMode, yeMaXinXi }: EPUBGongJuLanBiaoTiQuProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: darkMode ? '#f9fafb' : '#111827' }}>
        EPUB 阅读器
      </h2>
      {yeMaXinXi && (
        <span style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          {yeMaXinXi}
        </span>
      )}
    </div>
  );
}
