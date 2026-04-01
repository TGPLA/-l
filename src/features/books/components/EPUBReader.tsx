// @审计已完成
// EPUB 阅读器组件 - 封装 react-reader，集成所有功能

import React from 'react';
import { EPUBReaderGongJuLan } from './EPUBReaderGongJuLan';
import { EPUBYueDuQuYu } from './EPUBYueDuQuYu';
import { useEPUBReaderHuoChuLi } from '../hooks/useEPUBReaderHuoChuLi';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated }: EPUBReaderProps) {
  const p = useEPUBReaderHuoChuLi({ bookId, chapterId, onParagraphCreated });
  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#111827' : '#ffffff' }}>
      <EPUBReaderGongJuLan
        darkMode={darkMode}
        zhuTi={p.zhuTi}
        onZhuTiBianHua={p.setZhuTi}
        ziTiDaXiao={p.ziTiDaXiao}
        onZiTiDaXiaoBianHua={p.setZiTiDaXiao}
        souSuoCi={p.souSuoCi}
        onSouSuoCiBianHua={p.setSouSuoCi}
        souSuoJieGuoShuLiang={p.souSuoJieGuo.length}
        dangQianJieGuo={p.dangQianJieGuoSuoYin}
        onShangYiGe={p.handleShangYiGeSouSuoJieGuo}
        onXiaYiGe={p.handleXiaYiGeSouSuoJieGuo}
        yeMaXinXi={p.yeMaXinXi}
        onClose={onClose}
        huaCiKaiQi={p.huaCiKaiQi}
        onHuaCiQieHuan={() => p.setHuaCiKaiQi(!p.huaCiKaiQi)}
      />
      <EPUBYueDuQuYu
        url={url}
        location={p.location}
        onLocationChanged={p.handleLocationChanged}
        onGetRendition={p.handleRendition}
        souSuoCi={p.souSuoCi}
        onSouSuoJieGuo={p.handleSouSuoJieGuo}
        fanYeAnNiuKeJian={!!p.renditionRef.current}
        onShangYiYe={p.handlePrevPage}
        onXiaYiYe={p.handleNextPage}
        selectedText={p.selectedText}
        showMenu={p.showMenu}
        selectionRect={p.selectionRect}
        generating={p.generating}
        onCancel={p.handleCancel}
        onGenerateQuestion={p.handleGenerateQuestion}
        onHighlight={p.handleHighlight}
        onCopy={p.handleCopy}
      />
    </div>
  );
}
