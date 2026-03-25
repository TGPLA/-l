// @审计已完成
// 段落列表组件

import type { Paragraph } from '@infrastructure/types';

interface DuanLuoLieBiaoProps {
  paragraphs: Paragraph[];
  onView: (paragraph: Paragraph) => void;
  onDelete: (paragraphId: string) => void;
  deleting: string | null;
}

export function DuanLuoLieBiao({ paragraphs, onView, onDelete, deleting }: DuanLuoLieBiaoProps) {
  if (paragraphs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
        暂无段落，在上方章节内容中选中文字创建
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '16rem', overflowY: 'auto' }}>
      {paragraphs.map((p, i) => (
        <div
          key={p.id}
          style={{
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onView(p)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>段落 {i + 1}</span>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>({p.content.length} 字)</span>
            </div>
            <p style={{
              fontSize: '0.8125rem',
              color: '#4b5563',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {p.content}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onView(p); }}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                color: '#3b82f6',
                backgroundColor: '#eff6ff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              查看
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
              disabled={deleting === p.id}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: deleting === p.id ? 'not-allowed' : 'pointer',
              }}
            >
              {deleting === p.id ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
