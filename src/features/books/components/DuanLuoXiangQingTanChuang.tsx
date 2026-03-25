// @审计已完成
// 段落详情查看模态框

import type { Paragraph } from '@infrastructure/types';

interface LearningSource {
  chapterId?: string;
  paragraphId?: string;
  content: string;
}

interface DuanLuoXiangQingTanChuangProps {
  paragraph: Paragraph;
  onClose: () => void;
  onEdit: (paragraph: Paragraph) => void;
  onStartConceptLearning: (source: LearningSource) => void;
  onStartIntentionLearning: (source: LearningSource) => void;
}

export function DuanLuoXiangQingTanChuang({ paragraph, onClose, onEdit, onStartConceptLearning, onStartIntentionLearning }: DuanLuoXiangQingTanChuangProps) {
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>段落详情</h2>
          <button onClick={onClose} style={{
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}>
            关闭
          </button>
        </div>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          color: '#374151',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
        }}>
          {paragraph.content}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { onClose(); onEdit(paragraph); }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            编辑段落
          </button>
          <button
            onClick={() => { onClose(); onStartConceptLearning({ paragraphId: paragraph.id, content: paragraph.content }); }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            名词解释学习
          </button>
          <button
            onClick={() => { onClose(); onStartIntentionLearning({ paragraphId: paragraph.id, content: paragraph.content }); }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            意图理解学习
          </button>
        </div>
      </div>
    </div>
  );
}
