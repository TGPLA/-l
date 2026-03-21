// @审计已完成
// 提示词管理页面 - 管理三类题型的提示词模板
import { useState, useEffect } from 'react';
import { useApp } from '@infrastructure/hooks';
import type { PromptTemplate, QuestionTypeEnum } from '@infrastructure/types';
import { promptService } from '@shared/services/promptService';
import { getResponsiveValue } from '@shared/utils/responsive';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

const TI_XING: QuestionTypeEnum[] = ['名词解释', '意图理解', '生活应用'];

interface TiShiCiGuanLiProps {
  onBack: () => void;
}

export function TiShiCiGuanLi({ onBack }: TiShiCiGuanLiProps) {
  const { settings } = useApp();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<QuestionTypeEnum>('名词解释');
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const { templates: loaded, error } = await promptService.getPromptTemplates();
    if (error) {
      showError(error.message);
    } else {
      setTemplates(loaded);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;
    const { error } = await promptService.deletePromptTemplate(id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('删除成功');
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSetDefault = async (template: PromptTemplate) => {
    const { error } = await promptService.updatePromptTemplate(template.id, { isDefault: true });
    if (error) {
      showError(error.message);
    } else {
      showSuccess('已设为默认');
      setTemplates(prev => prev.map(t => ({
        ...t,
        isDefault: t.id === template.id ? true : (t.questionType === template.questionType ? false : t.isDefault)
      })));
    }
  };

  const handleSave = async (data: { name: string; content: string }) => {
    if (editingTemplate) {
      const { error } = await promptService.updatePromptTemplate(editingTemplate.id, data);
      if (error) {
        showError(error.message);
        return;
      }
      showSuccess('更新成功');
    } else {
      const { error } = await promptService.createPromptTemplate({
        name: data.name,
        content: data.content,
        questionType: activeType,
      });
      if (error) {
        showError(error.message);
        return;
      }
      showSuccess('创建成功');
    }
    setShowEditor(false);
    setEditingTemplate(null);
    loadTemplates();
  };

  const currentTemplates = templates.filter(t => t.questionType === activeType);
  const systemTemplates = currentTemplates.filter(t => t.isSystem);
  const userTemplates = currentTemplates.filter(t => !t.isSystem);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: settings.darkMode ? '#111827' : '#f9fafb', padding: getResponsiveValue({ mobile: '1rem', tablet: '1.5rem' }) }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: settings.darkMode ? '#9ca3af' : '#6b7280', marginBottom: '1rem', border: 'none', background: 'none', cursor: 'pointer' }}>
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回设置
        </button>

        <h1 style={{ fontSize: getResponsiveValue({ mobile: '1.25rem', tablet: '1.5rem' }), fontWeight: 700, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>📝 提示词模板管理</h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TI_XING.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeType === type ? '#3b82f6' : 'transparent',
                color: activeType === type ? '#ffffff' : settings.darkMode ? '#9ca3af' : '#6b7280',
                border: activeType === type ? 'none' : `1px solid ${settings.darkMode ? '#374151' : '#d1d5db'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: settings.darkMode ? '#9ca3af' : '#6b7280' }}>加载中...</div>
        ) : (
          <>
            <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>系统预设模板</h2>
              {systemTemplates.length === 0 ? (
                <p style={{ color: settings.darkMode ? '#6b7280' : '#9ca3af', fontSize: '0.875rem' }}>暂无系统模板</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {systemTemplates.map(t => (
                    <MoBanKaPian key={t.id} template={t} darkMode={settings.darkMode} onSetDefault={() => handleSetDefault(t)} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: settings.darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: settings.darkMode ? '#f9fafb' : '#111827' }}>我的模板</h2>
                <button
                  onClick={() => { setEditingTemplate(null); setShowEditor(true); }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  + 新建模板
                </button>
              </div>
              {userTemplates.length === 0 ? (
                <p style={{ color: settings.darkMode ? '#6b7280' : '#9ca3af', fontSize: '0.875rem' }}>暂无自定义模板，点击上方按钮创建</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userTemplates.map(t => (
                    <MoBanKaPian key={t.id} template={t} darkMode={settings.darkMode} onEdit={() => { setEditingTemplate(t); setShowEditor(true); }} onDelete={() => handleDelete(t.id)} onSetDefault={() => handleSetDefault(t)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showEditor && (
        <BianJiTanChuang
          template={editingTemplate}
          questionType={activeType}
          darkMode={settings.darkMode}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
          onSave={handleSave}
        />
      )}
    </div>
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
          {!template.isDefault && (
            <button onClick={onSetDefault} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>设为默认</button>
          )}
          {onEdit && <button onClick={onEdit} style={{ fontSize: '0.75rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>编辑</button>}
          {onDelete && <button onClick={onDelete} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>删除</button>}
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.5, maxHeight: '3rem', overflow: 'hidden' }}>
        {template.content.substring(0, 150)}...
      </p>
    </div>
  );
}

function BianJiTanChuang({ template, questionType, darkMode, onClose, onSave }: { template: PromptTemplate | null; questionType: QuestionTypeEnum; darkMode: boolean; onClose: () => void; onSave: (data: { name: string; content: string }) => void }) {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', maxWidth: '36rem', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>{template ? '编辑模板' : '新建模板'} - {questionType}</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>模板名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入模板名称"
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#e5e7eb' : '#374151', marginBottom: '0.5rem' }}>提示词内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入提示词内容，可使用 {{content}} 作为内容占位符"
              rows={8}
              style={{ width: '100%', padding: '0.75rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: darkMode ? '#374151' : '#ffffff', color: darkMode ? '#f9fafb' : '#111827', resize: 'vertical' }}
            />
          </div>
        </div>
        <div style={{ padding: '1rem 1.5rem', backgroundColor: darkMode ? '#374151' : '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer' }}>取消</button>
          <button onClick={() => onSave({ name, content })} disabled={!name.trim() || !content.trim()} style={{ padding: '0.5rem 1rem', backgroundColor: !name.trim() || !content.trim() ? '#9ca3af' : '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: !name.trim() || !content.trim() ? 'not-allowed' : 'pointer' }}>保存</button>
        </div>
      </div>
    </div>
  );
}
