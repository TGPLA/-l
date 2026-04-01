// @审计已完成
// 划线多功能菜单组件 - 微信读书风格

import { useState, useRef, useEffect } from 'react';
import type { ChuTiLeiXing } from '../hooks/useHuaXianChuTi';

interface HuaXianCaiDanProps {
  selectedText: string;
  position: { top: number; left: number };
  generating: boolean;
  onGenerateQuestion: (text: string, type: ChuTiLeiXing) => void;
  onHighlight: (text: string) => void;
  onCopy: (text: string) => void;
  onCancel: () => void;
}

const CHU_TI_LEI_XING: ChuTiLeiXing[] = ['名词解释', '意图理解', '生活应用'];

export function HuaXianCaiDan({
  selectedText,
  position,
  generating,
  onGenerateQuestion,
  onHighlight,
  onCopy,
  onCancel,
}: HuaXianCaiDanProps) {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 9999,
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={{
        display: 'flex',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSubMenu(!showSubMenu)}
            disabled={generating}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: showSubMenu ? '#eff6ff' : 'transparent',
              color: '#3b82f6',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            🤖 AI出题
            <span style={{ fontSize: '0.625rem' }}>▾</span>
          </button>

          {showSubMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              minWidth: '6rem',
            }}>
              {CHU_TI_LEI_XING.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    onGenerateQuestion(selectedText, type);
                    setShowSubMenu(false);
                  }}
                  disabled={generating}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontSize: '0.8125rem',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {generating ? '生成中...' : type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={() => onHighlight(selectedText)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#f59e0b',
            cursor: 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          🖍 高亮
        </button>

        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={() => onCopy(selectedText)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          📋 复制
        </button>
      </div>
    </div>
  );
}
