// @审计已完成
// EPUB 阅读区域子组件

import React from 'react';
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
  fanYeAnNiuKeJian: boolean;
  onShangYiYe: () => void;
  onXiaYiYe: () => void;
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  generating: boolean;
  onCancel: () => void;
  onGenerateQuestion: (text: string, type: '名词解释' | '意图理解' | '生活应用') => void;
  onHighlight: (text: string) => void;
  onCopy: (text: string) => void;
}

export function EPUBYueDuQuYu({
  url,
  location,
  onLocationChanged,
  onGetRendition,
  souSuoCi,
  onSouSuoJieGuo,
  fanYeAnNiuKeJian,
  onShangYiYe,
  onXiaYiYe,
  selectedText,
  showMenu,
  selectionRect,
  generating,
  onCancel,
  onGenerateQuestion,
  onHighlight,
  onCopy,
}: EPUBYueDuQuYuProps) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      {url && (
        <ReactReader
          url={url}
          location={location}
          locationChanged={onLocationChanged}
          showToc={true}
          getRendition={onGetRendition}
          searchQuery={souSuoCi}
          onSearchResults={onSouSuoJieGuo}
          contextLength={20}
          epubOptions={{ flow: 'paginated', allowScriptedContent: true }}
        />
      )}
      {fanYeAnNiuKeJian && (
        <>
          <button onClick={onShangYiYe} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>‹</button>
          <button onClick={onXiaYiYe} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>›</button>
        </>
      )}
      {showMenu && selectedText && selectionRect && (
        <HuaXianCaiDan
          selectedText={selectedText}
          position={{ top: selectionRect.top - 8, left: selectionRect.left + selectionRect.width / 2 }}
          generating={generating}
          onGenerateQuestion={onGenerateQuestion}
          onHighlight={onHighlight}
          onCopy={onCopy}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
