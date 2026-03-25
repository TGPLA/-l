// @审计已完成
// 章节详情头部导航

import type { Chapter } from '@infrastructure/types';

interface TouBuDaoHangProps {
  chapter: Chapter;
  onBack: () => void;
}

export function TouBuDaoHang({ chapter, onBack }: TouBuDaoHangProps) {
  return (
    <div style={{ backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', border: 'none', background: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回章节列表
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginTop: '0.5rem' }}>{chapter.title}</h1>
      </div>
    </div>
  );
}
