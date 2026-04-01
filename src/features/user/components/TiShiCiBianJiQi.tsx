// @审计已完成
// 提示词编辑器组件 - 创建/编辑表单

import { useState, useEffect } from 'react';
import type { QuestionTypeEnum } from '@infrastructure/types';

const TI_SHI_CI_GUI_ZHAN = `提示词支持以下占位符：
- {{content}} - 原文内容（必填，段落文本）
- {{title}} - 书籍章节标题
- {{author}} - 书籍作者

示例（名词解释）：
请根据以下内容出一个名词解释题，要求题目简洁、答案准确。
原文：{{content}}
书名：《{{title}}》
作者：{{author}}`;

interface TiShiCiBianJiQiProps {
  template: { name: string; content: string } | null;
  questionType: QuestionTypeEnum;
  darkMode: boolean;
  onClose: () => void;
  onSave: (data: { name: string; content: string }) => void;
}

export function TiShiCiBianJiQi({ template, questionType, darkMode, onClose, onSave }: TiShiCiBianJiQiProps) {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [showHelp, setShowHelp] = useState(!template);

  useEffect(() => {
    setName(template?.name || '');
    setContent(template?.content || '');
    setShowHelp(!template);
  }, [template]);

  const isValid = name.trim() && content.trim();

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', maxWidth: '36rem', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>{template ? '编辑模板' : '新建模板'} - {questionType}</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>模板名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入模板名称" style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>
              提示词内容
              <button onClick={() => setShowHelp(!showHelp)} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showHelp ? '收起说明' : '查看占位符说明'}
              </button>
            </label>
            {showHelp && (
              <div style={{ padding: '0.75rem', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {TI_SHI_CI_GUI_ZHAN}
              </div>
            )}
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="输入提示词内容，可使用 {{content}} 作为内容占位符" rows={8} style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827', resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', backgroundColor: darkMode ? '#374151' : '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer' }}>取消</button>
          <button onClick={() => onSave({ name, content })} disabled={!isValid} style={{ padding: '0.5rem 1rem', backgroundColor: isValid ? '#3b82f6' : '#9ca3af', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: isValid ? 'pointer' : 'not-allowed' }}>保存</button>
        </div>
      </div>
    </div>
  );
}
