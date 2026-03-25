// @审计已完成
// 章节编辑弹窗组件

import type { Chapter } from '@infrastructure/types';

interface ZhangJieBianJiTanChuangProps {
  chapter: Chapter;
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export function ZhangJieBianJiTanChuang({ chapter, title, content, onTitleChange, onContentChange, onClose, onSave, loading }: ZhangJieBianJiTanChuangProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={onClose}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', maxWidth: '42rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          编辑章节
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>章节标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem' }}
              placeholder="例如：第一章 原子习惯的微小力量"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>章节内容</label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              style={{ width: '100%', minHeight: '12rem', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical' }}
              placeholder="粘贴章节文本内容，AI 将基于此内容生成题目..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#374151', cursor: 'pointer' }}
            >
              取消
            </button>
            <button
              onClick={onSave}
              disabled={!title.trim() || !content.trim() || loading}
              style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: !title.trim() || !content.trim() || loading ? '#9ca3af' : '#3b82f6', color: '#ffffff', cursor: !title.trim() || !content.trim() || loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
