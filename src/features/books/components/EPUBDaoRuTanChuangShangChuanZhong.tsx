// @审计已完成
// EPUB 导入弹窗 - 上传中子组件

import { JiaZaiZhuangTai } from '@shared/utils/common/JiaZaiZhuangTai';

interface EPUBDaoRuTanChuangShangChuanZhongProps {
  darkMode: boolean;
}

export function EPUBDaoRuTanChuangShangChuanZhong({ darkMode }: EPUBDaoRuTanChuangShangChuanZhongProps) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <JiaZaiZhuangTai chiCun="large" />
      <p style={{ marginTop: '1rem', color: darkMode ? '#d1d5db' : '#374151', fontWeight: 500 }}>
        正在上传 EPUB 文件...
      </p>
    </div>
  );
}
