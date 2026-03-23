// @审计已完成
// 提示词编辑组件 - 创建和编辑自定义提示词
import { useState } from 'react';
import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';
import { promptService } from '@shared/services/promptService';

const TI_XING: QuestionTypeEnum[] = ['名词解释', '意图理解', '生活应用'];

interface TiShiCiBianJiProps {
  questionType?: QuestionTypeEnum;
  template?: PromptTemplate;
  onClose: () => void;
  onSave: (template: PromptTemplate) => void;
}

export function TiShiCiBianJi({ questionType: initialQuestionType, template, onClose, onSave }: TiShiCiBianJiProps) {
  const [name, setName] = useState(template?.name || '');
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionTypeEnum>(
    template?.questionType || initialQuestionType || '名词解释'
  );
  const [content, setContent] = useState(template?.content || '');
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return;

    setSaving(true);

    if (template) {
      const { template: updated, error } = await promptService.updatePromptTemplate(template.id, {
        name: name.trim(),
        content: content.trim(),
        isDefault,
      });
      setSaving(false);
      if (error || !updated) {
        alert(error?.message || '保存失败');
        return;
      }
      onSave(updated);
    } else {
      const { template: created, error } = await promptService.createPromptTemplate({
        name: name.trim(),
        questionType: selectedQuestionType,
        content: content.trim(),
        isDefault,
      });
      setSaving(false);
      if (error || !created) {
        alert(error?.message || '创建失败');
        return;
      }
      onSave(created);
    }
  };

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
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              {template ? '编辑提示词' : '创建自定义提示词'}
            </h2>
            <button onClick={onClose} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              模板名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：深度理解模板"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              题型
            </label>
            {initialQuestionType ? (
              <input
                type="text"
                value={initialQuestionType}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {TI_XING.map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: selectedQuestionType === type ? '#eff6ff' : '#f9fafb',
                      border: selectedQuestionType === type ? '2px solid #3b82f6' : '2px solid transparent',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="questionType"
                      value={type}
                      checked={selectedQuestionType === type}
                      onChange={() => setSelectedQuestionType(type)}
                      style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              提示词内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入提示词内容，使用 {{content}} 作为段落内容占位符..."
              style={{
                width: '100%',
                minHeight: '12rem',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              提示：使用 {'{{content}}'} 作为段落内容的占位符
            </p>
          </div>

          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ width: '1rem', height: '1rem' }}
            />
            <label htmlFor="isDefault" style={{ fontSize: '0.875rem', color: '#374151' }}>
              设为该题型的默认模板
            </label>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim() || saving}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !name.trim() || !content.trim() || saving ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: !name.trim() || !content.trim() || saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
