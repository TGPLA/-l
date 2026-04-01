// @审计已完成
// EPUB 工具栏控制区域组件

import React from 'react';
import type { ZhuTiLeiXing } from '../hooks/useZhuTi';
import { EPUBGongJuLanZiTiZhuTiQu } from './EPUBGongJuLanZiTiZhuTiQu';
import { EPUBGongJuLanQiTaAnNiu } from './EPUBGongJuLanQiTaAnNiu';

interface EPUBGongJuLanKongZhiQuProps {
  darkMode: boolean;
  zhuTi: ZhuTiLeiXing;
  onZhuTiBianHua: (zhuTi: ZhuTiLeiXing) => void;
  ziTiDaXiao: number;
  onZiTiDaXiaoBianHua: (daXiao: number) => void;
  huaCiKaiQi: boolean;
  onHuaCiQieHuan: () => void;
  onClose: () => void;
}

export function EPUBGongJuLanKongZhiQu({
  darkMode,
  zhuTi,
  onZhuTiBianHua,
  ziTiDaXiao,
  onZiTiDaXiaoBianHua,
  huaCiKaiQi,
  onHuaCiQieHuan,
  onClose,
}: EPUBGongJuLanKongZhiQuProps) {
  return (
    <>
      <EPUBGongJuLanZiTiZhuTiQu
        darkMode={darkMode}
        zhuTi={zhuTi}
        onZhuTiBianHua={onZhuTiBianHua}
        ziTiDaXiao={ziTiDaXiao}
        onZiTiDaXiaoBianHua={onZiTiDaXiaoBianHua}
      />
      <EPUBGongJuLanQiTaAnNiu
        darkMode={darkMode}
        huaCiKaiQi={huaCiKaiQi}
        onHuaCiQieHuan={onHuaCiQieHuan}
        onClose={onClose}
      />
    </>
  );
}
