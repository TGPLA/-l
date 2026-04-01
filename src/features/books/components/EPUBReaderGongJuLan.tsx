// @审计已完成
// EPUB 阅读器工具栏组件

import React from 'react';
import type { ZhuTiLeiXing } from '../hooks/useZhuTi';
import { EPUBGongJuLanBiaoTiQu } from './EPUBGongJuLanBiaoTiQu';
import { EPUBGongJuLanSouSuoQu } from './EPUBGongJuLanSouSuoQu';
import { EPUBGongJuLanKongZhiQu } from './EPUBGongJuLanKongZhiQu';

interface EPUBReaderGongJuLanProps {
  darkMode: boolean;
  zhuTi: ZhuTiLeiXing;
  onZhuTiBianHua: (zhuTi: ZhuTiLeiXing) => void;
  ziTiDaXiao: number;
  onZiTiDaXiaoBianHua: (daXiao: number) => void;
  souSuoCi: string;
  onSouSuoCiBianHua: (ci: string) => void;
  souSuoJieGuoShuLiang: number;
  dangQianJieGuo: number;
  onShangYiGe: () => void;
  onXiaYiGe: () => void;
  yeMaXinXi: string;
  onClose: () => void;
  huaCiKaiQi: boolean;
  onHuaCiQieHuan: () => void;
}

export function EPUBReaderGongJuLan({ 
  darkMode, 
  zhuTi, 
  onZhuTiBianHua,
  ziTiDaXiao,
  onZiTiDaXiaoBianHua,
  souSuoCi,
  onSouSuoCiBianHua,
  souSuoJieGuoShuLiang,
  dangQianJieGuo,
  onShangYiGe,
  onXiaYiGe,
  yeMaXinXi,
  onClose,
  huaCiKaiQi,
  onHuaCiQieHuan,
}: EPUBReaderGongJuLanProps) {
  return (
    <div style={{ 
      padding: '1rem', 
      display: 'flex', 
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
      alignItems: 'center',
      gap: '0.5rem',
      borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
      zIndex: 1000
    }}>
      <EPUBGongJuLanBiaoTiQu darkMode={darkMode} yeMaXinXi={yeMaXinXi} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <EPUBGongJuLanSouSuoQu
          darkMode={darkMode}
          souSuoCi={souSuoCi}
          onSouSuoCiBianHua={onSouSuoCiBianHua}
          souSuoJieGuoShuLiang={souSuoJieGuoShuLiang}
          dangQianJieGuo={dangQianJieGuo}
          onShangYiGe={onShangYiGe}
          onXiaYiGe={onXiaYiGe}
        />
        <EPUBGongJuLanKongZhiQu
          darkMode={darkMode}
          zhuTi={zhuTi}
          onZhuTiBianHua={onZhuTiBianHua}
          ziTiDaXiao={ziTiDaXiao}
          onZiTiDaXiaoBianHua={onZiTiDaXiaoBianHua}
          huaCiKaiQi={huaCiKaiQi}
          onHuaCiQieHuan={onHuaCiQieHuan}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
