// @审计已完成
// 阅读区域 - 微信读书风格：超大圆角卡片 + 双栏 + 内嵌翻页按钮

import React, { useEffect, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition } from 'epubjs';
import { HuaXianCaiDan } from './HuaXianCaiDan';

interface EPUBYueDuQuYuProps {
  url: string;
  location: string | number;
  onLocationChanged: (epubcfi: string) => void;
  onGetRendition: (rendition: Rendition) => void;
  souSuoCi: string;
  onSouSuoJieGuo: (jieGuo: any[]) => void;
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  generating: boolean;
  onCancel: () => void;
  onGenerateQuestion: (text: string, type: '名词解释' | '意图理解' | '生活应用') => void;
  onHighlight: (text: string) => void;
  onCopy: (text: string) => void;
  onShangYiYe?: () => void;
  onXiaYiYe?: () => void;
  keJian?: boolean;
  darkMode?: boolean;
}

const BAO_CHI_QI_YANG_SHI: React.CSSProperties = {
  flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', overflow: 'hidden',
  padding: '32px 24px', maxWidth: '1250px', width: '100%', margin: '0 auto', boxSizing: 'border-box',
};

const KA_PIAN_YANG_SHI: React.CSSProperties = {
  width: '100%', height: '100%', backgroundColor: 'var(--zhi-zhen-bei-jing)',
  borderRadius: '12px', overflow: 'hidden', position: 'relative',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
};

function ShuangLanPaiBan({ rendition }: { rendition: Rendition | undefined }) {
  useEffect(() => {
    if (!rendition) return;
    rendition.themes.register('default', {});
    rendition.themes.default('body', {
      'background-color': 'var(--zhi-zhen-bei-jing) !important',
      'background': 'var(--zhi-zhen-bei-jing) !important',
      'padding': '48px 56px !important', 'column-count': '2 !important',
      'column-gap': '56px !important', 'column-rule': '1px solid rgba(255,255,255,0.05) !important',
      'max-width': 'none !important', 'height': '100% !important', 'box-sizing': 'border-box !important',
      'overflow-y': 'auto !important', 'color': 'var(--zheng-wen-yan-se) !important',
    });
    rendition.themes.default('p, li, div, span', { 'max-width': 'none !important', 'break-inside': 'avoid !important', 'orphans': '3 !important', 'widows': '3 !important' });
    rendition.themes.default('*', { 'max-width': 'none !important' });
    (rendition as any).spread = () => true;
  }, [rendition]);
  return null;
}

function QingChuKuNeiBuBianJu({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const qingChu = () => {
      const el = containerRef.current;
      if (!el) return;
      const juBu = el.querySelectorAll<HTMLElement>('div[style*="inset"]');
      juBu.forEach(d => { d.style.top = '0'; d.style.left = '0'; d.style.right = '0'; d.style.bottom = '0'; d.style.inset = '0'; });
      const areaList = el.querySelectorAll<HTMLElement>('.readerArea');
      areaList.forEach(d => { (d as any).style.backgroundColor = ''; });
      const jianTou = el.querySelectorAll<HTMLElement>('.arrow, .prev, .next');
      jianTou.forEach(d => { d.style.display = 'none'; });
      const anNiuJianTou = el.querySelectorAll<HTMLButtonElement>('button[style*="position: absolute"]');
      anNiuJianTou.forEach(d => { d.style.display = 'none'; d.style.visibility = 'hidden'; });
    };
    qingChu();
    const timer = setInterval(qingChu, 500);
    setTimeout(() => clearInterval(timer), 8000);
    return () => clearInterval(timer);
  }, [containerRef]);
  return null;
}

export function EPUBYueDuQuYu({
  url, location, onLocationChanged, onGetRendition,
  souSuoCi, onSouSuoJieGuo, selectedText, showMenu,
  selectionRect, generating, onCancel, onGenerateQuestion,
  onHighlight, onCopy, onShangYiYe, onXiaYiYe, keJian, darkMode,
}: EPUBYueDuQuYuProps) {
  const renditionRef = useRef<Rendition>();
  const rongQiRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleGetRendition = (rendition: Rendition) => {
    renditionRef.current = rendition;
    onGetRendition(rendition);
    setIsLoading(false);
  };

  const handleLocationChanged = (epubcfi: string) => {
    setIsLoading(false);
    onLocationChanged(epubcfi);
  };

  const anNiuYangShi: React.CSSProperties = {
    padding: '6px 14px', border: 'none', borderRadius: '6px',
    backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--ci-yao-wen-zi)',
    cursor: 'pointer', fontSize: '13px', opacity: 0.7, transition: 'all 0.2s ease',
    userSelect: 'none' as const, fontFamily: 'inherit',
  };

  return (
    <div style={BAO_CHI_QI_YANG_SHI} ref={rongQiRef}>
      <QingChuKuNeiBuBianJu containerRef={rongQiRef} />
      <div style={KA_PIAN_YANG_SHI}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ShuangLanPaiBan rendition={renditionRef.current} />
          {url && (
            <ReactReader
              url={url}
              location={location}
              locationChanged={handleLocationChanged}
              showToc={false}
              getRendition={handleGetRendition}
              searchQuery={souSuoCi}
              onSearchResults={onSouSuoJieGuo}
              contextLength={20}
              epubOptions={{
                flow: 'paginated',
                allowScriptedContent: true,
                width: '100%',
                height: '100%',
                styles: {
                  body: { 'background-color': '#222228', 'color': '#BBBBc4' },
                  '*': { 'background-color': '#222228', 'color': '#BBBBc4' },
                },
              }}
            />
          )}
          {isLoading && url && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--zhi-zhen-bei-jing)', zIndex: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: 'var(--ci-yao-wen-zi)', fontSize: '14px' }}>正在加载书籍内容...</p>
              </div>
            </div>
          )}
          {showMenu && selectedText && selectionRect && (
            (() => {
              const rect = selectionRect;
              const menuWidth = 200;
              const menuHeight = 250;
              const safeMargin = 20;
              
              const selectionCenterY = rect.top + rect.height / 2;
              const selectionCenterX = rect.left + rect.width / 2;
              
              // 四象限定位算法
              // 1. 初始尝试放选区上方
              let menuTop = selectionCenterY - menuHeight / 2 - 15;
              let showCaretUp = true;
              
              // 2. 选区太大则放到下方
              if (rect.height > menuHeight / 2) {
                menuTop = rect.bottom + 20;
                showCaretUp = true;
              }
              
              // 3. 上方空间检测
              const menuBottomAfterTop = menuTop + menuHeight;
              const canShowAbove = menuTop >= safeMargin && 
                                   menuBottomAfterTop <= window.innerHeight - safeMargin;
              
              if (canShowAbove) {
                // 上方空间充足，直接显示
              } else {
                // 4. 切换到下方尝试
                menuTop = selectionCenterY + 15;
                showCaretUp = false;
                
                const menuBottomAfterBottom = menuTop + menuHeight;
                const canShowBelow = menuTop >= safeMargin &&
                                     menuBottomAfterBottom <= window.innerHeight - safeMargin;
                
                if (!canShowBelow) {
                  // 5. 边界约束：贴边 + 判断箭头方向
                  menuTop = Math.max(safeMargin, window.innerHeight - safeMargin - menuHeight);
                  showCaretUp = selectionCenterY > menuTop + menuHeight / 2;
                }
              }
              
              // 6. 左右边界检测
              let menuLeft = selectionCenterX;
              if (menuLeft - menuWidth / 2 < safeMargin) {
                menuLeft = safeMargin + menuWidth / 2;
              } else if (menuLeft + menuWidth / 2 > window.innerWidth - safeMargin) {
                menuLeft = window.innerWidth - safeMargin - menuWidth / 2;
              }
              
              return (
                <HuaXianCaiDan
                  selectedText={selectedText}
                  showMenu={showMenu}
                  position={{ top: menuTop, left: menuLeft }}
                  showCaretUp={showCaretUp}
                  generating={generating}
                  darkMode={darkMode}
                  onGenerateQuestion={onGenerateQuestion}
                  onHuaXian={onHighlight}
                  onCopy={onCopy}
                  onCancel={onCancel}
                />
              );
            })()
          )}
        </div>

        {keJian && (onShangYiYe || onXiaYiYe) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', flexShrink: 0 }}>
            {onShangYiYe && (
              <button onClick={onShangYiYe} style={anNiuYangShi}
                onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}>
                ← 上一页
              </button>
            )}
            <div />
            {onXiaYiYe && (
              <button onClick={onXiaYiYe} style={anNiuYangShi}
                onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}>
                下一页 →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
