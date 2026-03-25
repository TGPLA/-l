// @审计已完成
// 段落编辑模态框

import type { Paragraph } from '@infrastructure/types';

interface DuanLuoBianJiTanChuangProps {
  paragraph: Paragraph;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}

export function DuanLuoBianJiTanChuang({ paragraph, editContent, onEditContentChange, onClose, onSave, saving }: DuanLuoBianJiTanChuangProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '1.5rem',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>编辑段落</h2>
          <button onClick={onClose} style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}>
            取消
          </button>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => onEditContentChange(e.target.value)}
          style={{
            width: '100%',
            minHeight: '12rem',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            color: '#374151',
            lineHeight: 1.6,
            resize: 'vertical',
          }}
          placeholder="输入段落内容..."
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={!editContent.trim() || saving}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: (!editContent.trim() || saving) ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: (!editContent.trim() || saving) ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
