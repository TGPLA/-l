import { useState } from 'react';
import type { Chapter } from '@infrastructure/types';
import { chapterService } from '@shared/services/chapterService';
import { ZhangJieHuaXianJiLu } from './ZhangJieHuaXianJiLu';

interface ChapterManagerProps {
  bookId: string;
  chapters: Chapter[];
  onChaptersChange: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  darkMode: boolean;
}

export function ChapterManager({ bookId, chapters, onChaptersChange, onSelectChapter, darkMode }: ChapterManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHuaXianJiLu, setShowHuaXianJiLu] = useState<string | null>(null);

  const handleAddChapter = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    const { error } = await chapterService.createChapter({
      bookId,
      title: title.trim(),
      content: content.trim(),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setContent('');
    setShowAddModal(false);
    onChaptersChange();
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !title.trim()) return;
    
    setLoading(true);
    const { error } = await chapterService.updateChapter(editingChapter.id, {
      title: title.trim(),
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setEditingChapter(null);
    onChaptersChange();
  };

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!confirm(`确定要删除章节「${chapterTitle}」吗？\n该章节下的所有题目也会被删除。`)) return;
    
    const { error } = await chapterService.deleteChapter(chapterId);
    if (error) {
      alert(error.message);
      return;
    }
    onChaptersChange();
  };

  const openEditModal = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setTitle(chapter.title);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingChapter(null);
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: darkMode ? '#f9fafb' : '#111827' }}>章节管理</h3>
        <button onClick={() => setShowAddModal(true)} style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          + 添加章节
        </button>
      </div>

      {chapters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280', backgroundColor: darkMode ? '#1f2937' : '#f9fafb', borderRadius: '0.5rem' }}>
          <p>暂无章节，点击上方按钮添加</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chapters.map((chapter, index) => (
            <div key={chapter.id} style={{ padding: '1rem', backgroundColor: darkMode ? '#1f2937' : '#ffffff', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectChapter(chapter)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>第{index + 1}章</span>
                  <span style={{ fontWeight: 500, color: darkMode ? '#f9fafb' : '#111827' }}>{chapter.title}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                  {chapter.questionCount} 道题目 · {chapter.content.length} 字
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowHuaXianJiLu(chapter.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#8b5cf6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>划线</button>
                <button onClick={() => openEditModal(chapter)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#eff6ff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>编辑</button>
                <button onClick={() => handleDeleteChapter(chapter.id, chapter.title)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#dc2626', backgroundColor: darkMode ? '#7f1d1d' : '#fef2f2', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showHuaXianJiLu && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => setShowHuaXianJiLu(null)}>
          <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', maxWidth: '50rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>
                {chapters.find(c => c.id === showHuaXianJiLu)?.title} - 划线记录
              </h2>
              <button onClick={() => setShowHuaXianJiLu(null)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#6b7280', cursor: 'pointer', fontSize: '0.875rem' }}>✕</button>
            </div>
            <ZhangJieHuaXianJiLu bookId={bookId} chapterId={showHuaXianJiLu} chapterTitle={chapters.find(c => c.id === showHuaXianJiLu)?.title || ''} darkMode={darkMode} />
          </div>
        </div>
      )}

      {(showAddModal || editingChapter) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={closeModal}>
          <div style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff', borderRadius: '0.75rem', maxWidth: '42rem', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '1rem' }}>
              {editingChapter ? '编辑章节标题' : '添加章节'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#d1d5db' : '#374151', marginBottom: '0.25rem' }}>章节标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    backgroundColor: darkMode ? '#111827' : '#ffffff',
                    color: darkMode ? '#f9fafb' : '#111827',
                  }}
                  placeholder="例如：第一章 原子习惯的微小力量"
                />
              </div>
              
              {showAddModal && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#d1d5db' : '#374151', marginBottom: '0.25rem' }}>章节内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '12rem',
                      padding: '0.75rem',
                      border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      backgroundColor: darkMode ? '#111827' : '#ffffff',
                      color: darkMode ? '#f9fafb' : '#111827',
                    }}
                    placeholder="粘贴章节文本内容，AI 将基于此内容生成题目..."
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={closeModal} style={{ padding: '0.5rem 1rem', border: `1px solid ${darkMode ? '#374151' : '#d1d5db'}`, borderRadius: '0.5rem', backgroundColor: 'transparent', color: darkMode ? '#9ca3af' : '#374151', cursor: 'pointer' }}>取消</button>
                <button onClick={editingChapter ? handleUpdateChapter : handleAddChapter} disabled={!title.trim() || (showAddModal && !content.trim()) || loading} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: !title.trim() || (showAddModal && !content.trim()) || loading ? (darkMode ? '#4b5563' : '#9ca3af') : '#3b82f6', color: '#ffffff', cursor: !title.trim() || (showAddModal && !content.trim()) || loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
