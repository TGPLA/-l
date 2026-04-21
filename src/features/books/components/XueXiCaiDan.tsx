// @审计已完成
// 智能学习菜单组件 - 简化版：AI智能理解选中内容

import { useState, useEffect, useRef } from 'react';
import { Brain, X } from 'lucide-react';

interface XueXiCaiDanProps {
  show: boolean;
  position: { top: number; left: number };
  startPosition?: { top: number; left: number } | null;
  text: string;
  chapterId?: string;
  darkMode?: boolean;
  onClose: () => void;
  onExplain: (text: string) => void;
  onZiJiHuaFuShu: (text: string) => void;
}

export function XueXiCaiDan({
  show, position, startPosition, text, onClose, onExplain,
}: XueXiCaiDanProps) {
  const [animatedPosition, setAnimatedPosition] = useState(position);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (show && startPosition) {
      setAnimatedPosition(startPosition);
      startTimeRef.current = performance.now();
      const duation = 300;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duation, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const currentTop = startPosition.top + (position.top - startPosition.top) * eased;
        const currentLeft = startPosition.left + (position.left - startPosition.left) * eased;
        
        setAnimatedPosition({ top: currentTop, left: currentLeft });
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setAnimatedPosition(position);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [show, startPosition, position.top, position.left]);

  useEffect(() => {
    if (!startPosition) {
      setAnimatedPosition(position);
    }
  }, [position.top, position.left]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (show) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  const handleXueXi = () => {
    onExplain(text);
    onClose();
  };

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${animatedPosition.top}px`,
    left: `${animatedPosition.left}px`,
    zIndex: 9999,
    transform: 'translate(-50%, -100%)',
    transition: 'opacity 0.2s ease',
    opacity: show ? 1 : 0,
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(51, 51, 51, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '0.75rem',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
    padding: '0.75rem',
    minWidth: '200px',
    position: 'relative',
  };

  const titleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    textAlign: 'center' as const,
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    width: '100%',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={containerStyle}>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={closeButtonStyle}
        >
          <X size={16} />
        </button>
        <div style={titleStyle}>智能学习</div>
        <button
          onClick={(e) => { e.stopPropagation(); handleXueXi(); }}
          style={buttonStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#7c3aed'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#8b5cf6'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
        >
          <Brain size={18} />
          AI理解 & 解释
        </button>
      </div>
    </div>
  );
}
