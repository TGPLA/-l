// @审计已完成
// 提示词模板组件 - 展示和选择提示词模板
import { useState, useEffect } from 'react';
import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';
import { promptService } from '@shared/services/promptService';

interface TiShiCiMoBanProps {
  questionType: QuestionTypeEnum;
  onSelect: (template: PromptTemplate) => void;
  onCreateCustom: () => void;
}

export function TiShiCiMoBan({ questionType, onSelect, onCreateCustom }: TiShiCiMoBanProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { templates: loaded } = await promptService.getPromptTemplatesByType(questionType);
      if (mounted) {
        setTemplates(loaded);
        const defaultTemplate = loaded.find(t => t.isDefault);
        if (defaultTemplate) {
          setSelectedId(defaultTemplate.id);
        }
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [questionType]);

  const handleSelect = (template: PromptTemplate) => {
    setSelectedId(template.id);
    onSelect(template);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>加载中...</div>;
  }

  const systemTemplates = templates.filter(t => t.isSystem);
  const userTemplates = templates.filter(t => !t.isSystem);

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>
        选择提示词模板 - {questionType}
      </h3>

      {systemTemplates.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.75rem' }}>
            系统预设模板
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {systemTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelect(template)}
                style={{
                  padding: '1rem',
                  backgroundColor: selectedId === template.id ? '#eff6ff' : '#ffffff',
                  border: `2px solid ${selectedId === template.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{template.name}</span>
                  {template.isDefault && (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '0.25rem' }}>
                      默认
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {template.content.substring(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {userTemplates.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.75rem' }}>
            我的模板
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {userTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelect(template)}
                style={{
                  padding: '1rem',
                  backgroundColor: selectedId === template.id ? '#eff6ff' : '#ffffff',
                  border: `2px solid ${selectedId === template.id ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{template.name}</span>
                  {template.isDefault && (
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '0.25rem' }}>
                      默认
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {template.content.substring(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '2px dashed #d1d5db' }}>
        <button
          onClick={onCreateCustom}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: '#374151',
          }}
        >
          + 创建自定义模板
        </button>
      </div>
    </div>
  );
}
