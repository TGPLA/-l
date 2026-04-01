// @审计已完成
// 提示词分类组件 - 题型标签页和模板列表展示

import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';

const TI_XING: QuestionTypeEnum[] = ['名词解释', '意图理解', '生活应用'];

interface TiShiCiFenLeiProps {
  activeType: QuestionTypeEnum;
  templates: PromptTemplate[];
  loading: boolean;
  darkMode: boolean;
  onTypeChange: (type: QuestionTypeEnum) => void;
  onSetDefault: (template: PromptTemplate) => void;
  onEdit: (template: PromptTemplate) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function TiShiCiFenLei({ activeType, templates, loading, darkMode, onTypeChange, onSetDefault, onEdit, onDelete, onCreate }: TiShiCiFenLeiProps) {
  const currentTemplates = templates.filter(t => t.questionType === activeType);
  const systemTemplates = currentTemplates.filter(t => t.isSystem);
  const userTemplates = currentTemplates.filter(t => !t.isSystem);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>加载中...</div>;

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TI_XING.map(type => (
          <button key={type} onClick={() => onTypeChange(type)} style={{ padding: '0.5rem 1rem', backgroundColor: activeType === type ? '#3b82f6' : 'transparent', color: activeType === type ? '#ffffff' : darkMode ? '#9ca3af' : '#6b7280', border: activeType === type ? 'none' : `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>{type}</button>
        ))}
      </div>

      <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>系统预设模板</h2>
        {systemTemplates.length === 0 ? (
          <p style={{ color: darkMode ? '#6b7280' : '#9ca3af', fontSize: '0.875rem' }}>暂无系统模板</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {systemTemplates.map(t => <MoBanKaPian key={t.id} template={t} darkMode={darkMode} onSetDefault={() => onSetDefault(t)} />)}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>我的模板</h2>
          <button onClick={onCreate} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>+ 新建模板</button>
        </div>
        {userTemplates.length === 0 ? (
          <p style={{ color: darkMode ? '#6b7280' : '#9ca3af', fontSize: '0.875rem' }}>暂无自定义模板，点击上方按钮创建</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userTemplates.map(t => <MoBanKaPian key={t.id} template={t} darkMode={darkMode} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} onSetDefault={() => onSetDefault(t)} />)}
          </div>
        )}
      </div>
    </>
  );
}

function MoBanKaPian({ template, darkMode, onEdit, onDelete, onSetDefault }: { template: PromptTemplate; darkMode: boolean; onEdit?: () => void; onDelete?: () => void; onSetDefault: () => void }) {
  return (
    <div style={{ padding: '1rem', backgroundColor: darkMode ? '#374151' : '#f9fafb', borderRadius: '0.5rem', border: template.isDefault ? `2px solid #3b82f6` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ fontWeight: 500, color: darkMode ? '#f9fafb' : '#111827' }}>{template.name}</span>
          {template.isDefault && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '0.25rem' }}>默认</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!template.isDefault && <button onClick={onSetDefault} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>设为默认</button>}
          {onEdit && <button onClick={onEdit} style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>编辑</button>}
          {onDelete && <button onClick={onDelete} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>删除</button>}
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.5, maxHeight: '3rem', overflow: 'hidden' }}>{template.content.substring(0, 150)}...</p>
    </div>
  );
}
