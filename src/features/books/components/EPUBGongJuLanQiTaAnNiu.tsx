// @审计已完成
// EPUB 工具栏其他按钮组件

import React from 'react';

interface EPUBGongJuLanQiTaAnNiuProps {
  darkMode: boolean;
  huaCiKaiQi: boolean;
  onHuaCiQieHuan: () => void;
  onClose: () => void;
}

export function EPUBGongJuLanQiTaAnNiu({
  darkMode,
  huaCiKaiQi,
  onHuaCiQieHuan,
  onClose,
}: EPUBGongJuLanQiTaAnNiuProps) {
  return (
    <>
      <button onClick={onHuaCiQieHuan} style={{ 
        padding: '0.5rem 1rem', 
        border: 'none', 
        borderRadius: '0.5rem', 
        backgroundColor: huaCiKaiQi ? '#10b981' : '#6b7280', 
        color: '#ffffff', 
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}>
        划词：{huaCiKaiQi ? '开' : '关'}
      </button>

      <button onClick={onClose} style={{ 
        padding: '0.5rem 1rem', 
        border: 'none', 
        borderRadius: '0.5rem', 
        backgroundColor: '#3b82f6', 
        color: '#ffffff', 
        cursor: 'pointer',
        fontSize: '0.875rem'
      }}>
        关闭
      </button>
    </>
  );
}
