// @审计已完成
// 划线多功能菜单组件 - 微信读书风格

import { useState, useRef, useEffect } from 'react';
import type { ChuTiLeiXing, HuaXianYanSe } from '../hooks/useHuaXianChuTi';

const CHU_TI_LEI_XING: ChuTiLeiXing[] = ['名词解释', '意图理解', '生活应用'];

interface HuaXianCaiDanProps {
  selectedText: string;
  position: { top: number; left: number };
  showMenu: boolean;
  generating: boolean;
  darkMode?: boolean;
  showCaretUp?: boolean;
  onGenerateQuestion: (text: string, type: ChuTiLeiXing) => void;
  onHuaXian: (text: string, yanSe: HuaXianYanSe, beiZhu: string) => void;
  onCopy: (text: string) => void;
  onCancel: () => void;
}

export function HuaXianCaiDan({
  selectedText,
  position,
  showMenu,
  generating,
  darkMode,
  showCaretUp,
  onGenerateQuestion,
  onHuaXian,
  onCopy,
  onCancel,
}: HuaXianCaiDanProps) {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [yanSe] = useState<HuaXianYanSe>('yellow');
  const [beiZhu, setBeiZhu] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMenu) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [showMenu]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    if (showMenu) {
      timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 200);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu, onCancel]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: 9999,
    opacity: isVisible ? 1 : 0,
    transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.9}) translateY(${isVisible ? 0 : 10}px)`,
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: showMenu ? 'auto' : 'none',
  };

  const menuContainerStyle: React.CSSProperties = {
    display: 'flex',
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 2px 16px rgba(0, 0, 0, 0.3)',
    padding: '0.25rem',
    flexDirection: 'column',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    gap: '0.25rem',
    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '0.5rem',
    position: 'relative',
    overflow: 'hidden',
  };

  const getButtonStyle = (buttonId: string, isActive: boolean): React.CSSProperties => ({
    ...buttonStyle,
    color: isActive ? '#60a5fa' : '#ffffff',
    backgroundColor: activeButton === buttonId ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
    transform: activeButton === buttonId ? 'scale(0.95)' : 'scale(1)',
  });

  const handleMouseDown = (buttonId: string) => {
    setActiveButton(buttonId);
  };

  const handleMouseUp = () => {
    setActiveButton(null);
  };

  const handleMouseLeave = () => {
    setActiveButton(null);
  };

  const handleCopyClick = () => {
    onCopy(selectedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const handleHuaXianClick = () => {
    setActiveButton('huaXian');
    onHuaXian(selectedText, yanSe, beiZhu);
    setBeiZhu('');
    setTimeout(() => setActiveButton(null), 150);
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={menuContainerStyle}>
        <div style={{ display: 'flex' }}>
          <button
            onClick={() => { setActiveButton('ai'); setShowSubMenu(!showSubMenu); }}
            disabled={generating}
            style={getButtonStyle('ai', showSubMenu)}
            onMouseDown={() => handleMouseDown('ai')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', transition: 'transform 0.15s', transform: showSubMenu ? 'rotate(30deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            AI问书
          </button>

          <button
            onClick={handleCopyClick}
            style={getButtonStyle('copy', copySuccess)}
            onMouseDown={() => handleMouseDown('copy')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {copySuccess ? (
              <svg style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {copySuccess ? '已复制' : '复制'}
          </button>

          <button
            onClick={handleHuaXianClick}
            style={getButtonStyle('huaXian', false)}
            onMouseDown={() => handleMouseDown('huaXian')}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              borderRadius: '0.25rem', 
              backgroundColor: '#000000',
              border: `2px solid ${darkMode ? '#ffffff' : '#000000'}`
            }} />
            划线
          </button>
        </div>

        <div style={{ padding: '0.5rem', borderTop: '1px solid #444444' }}>
            <input
              type="text"
              value={beiZhu}
              onChange={(e) => setBeiZhu(e.target.value)}
              placeholder="添加备注（可选）"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #555555',
                backgroundColor: 'rgba(34, 34, 34, 0.8)',
                color: '#ffffff',
                fontSize: '0.75rem',
                outline: 'none',
              }}
            />
            <button
              onClick={handleHuaXianClick}
              onMouseDown={() => handleMouseDown('save')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                backgroundColor: activeButton === 'save' ? '#2563eb' : '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeButton === 'save' ? 'scale(0.97)' : 'scale(1)',
                boxShadow: activeButton === 'save' ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {beiZhu ? '保存备注' : '保存划线'}
            </button>
          </div>

          {showCaretUp ? (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '-8px',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '10px solid rgba(51, 51, 51, 0.95)',
          }} />
          ) : (
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-10px',
            zIndex: 10000,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid rgba(51, 51, 51, 0.95)',
          }} />
          )}
        </div>

        {showSubMenu && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '0.5rem',
          backgroundColor: 'rgba(51, 51, 51, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '0.75rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          minWidth: '8rem',
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
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#ffffff',
                cursor: generating ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#444444')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {generating ? '生成中...' : type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
