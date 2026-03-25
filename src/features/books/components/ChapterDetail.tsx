// @审计已完成
// 章节详情组件 - 显示章节内容、划词创建段落、学习模式

import { useEffect, useCallback } from 'react';
import type { Chapter, Paragraph } from '@infrastructure/types';
import { useDuanLuoGuanLi } from '../hooks/useDuanLuoGuanLi';
import { useHuaCiChuangJian } from '../hooks/useHuaCiChuangJian';
import { useZhangJieBianJi } from '../hooks/useZhangJieBianJi';
import { DuanLuoXiangQingTanChuang } from './DuanLuoXiangQingTanChuang';
import { DuanLuoBianJiTanChuang } from './DuanLuoBianJiTanChuang';
import { HuaCiChuangJianDiLan } from './HuaCiChuangJianDiLan';
import { ZhangJieXiangQingZhuShiTu } from './ZhangJieXiangQingZhuShiTu';
import { ZhangJieBianJiTanChuang } from './ZhangJieBianJiTanChuang';
import { TouBuDaoHang } from './TouBuDaoHang';
import { ShanChuQueRenTanChuang } from './ShanChuQueRenTanChuang';

interface ChapterDetailProps {
  chapter: Chapter;
  onBack: () => void;
  onStartConceptLearning: (paragraph: Paragraph) => void;
  onStartIntentionLearning: (paragraph: Paragraph) => void;
}

export function ChapterDetail({ chapter, onBack, onStartConceptLearning, onStartIntentionLearning }: ChapterDetailProps) {
  const {
    paragraphs,
    setParagraphs,
    loadParagraphs,
    showViewModal,
    setShowViewModal,
    showEditModal,
    setShowEditModal,
    showShanChuModal,
    currentParagraph,
    editContent,
    setEditContent,
    saving,
    deleting,
    handleViewParagraph,
    handleEditParagraph,
    handleSaveEdit,
    handleDeleteParagraph,
    confirmDelete,
    cancelDelete,
  } = useDuanLuoGuanLi(chapter.id);

  const {
    selectedText,
    showSelectionBar,
    creating,
    enabled: huaCiEnabled,
    setEnabled: setHuaCiEnabled,
    setTargetElement,
    setShowSelectionBar,
    setSelectedText,
    handleCreateParagraph,
  } = useHuaCiChuangJian(chapter.id, (p) => setParagraphs(prev => [...prev, p]));

  const {
    showEditModal: showZhangJieEditModal,
    setShowEditModal: setShowZhangJieEditModal,
    title,
    setTitle,
    content,
    setContent,
    loading,
    openEditModal,
    closeModal,
    handleSaveEdit: handleSaveZhangJieEdit,
  } = useZhangJieBianJi();

  useEffect(() => {
    loadParagraphs();
  }, [loadParagraphs]);

  useEffect(() => {
    setHuaCiEnabled(!showViewModal && !showEditModal && !showShanChuModal);
  }, [showViewModal, showEditModal, showShanChuModal, setHuaCiEnabled]);

  const handleParagraphCreated = useCallback((paragraph: Paragraph) => {
    setParagraphs(prev => [...prev, paragraph]);
  }, [setParagraphs]);

  const handleContentRef = useCallback((element: HTMLDivElement | null) => {
    setTargetElement(element);
  }, [setTargetElement]);

  const handleEditChapter = useCallback(() => {
    openEditModal(chapter);
  }, [openEditModal, chapter]);

  const handleChapterUpdated = useCallback(() => {
    loadParagraphs();
  }, [loadParagraphs]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <TouBuDaoHang chapter={chapter} onBack={onBack} />

      <ZhangJieXiangQingZhuShiTu
        chapter={chapter}
        paragraphs={paragraphs}
        onViewParagraph={handleViewParagraph}
        onDeleteParagraph={handleDeleteParagraph}
        onStartConceptLearning={onStartConceptLearning}
        onStartIntentionLearning={onStartIntentionLearning}
        onEditChapter={handleEditChapter}
        deleting={deleting}
        onContentRef={handleContentRef}
      />

      {showSelectionBar && selectedText && huaCiEnabled && (
        <HuaCiChuangJianDiLan
          selectedText={selectedText}
          onCancel={() => { setShowSelectionBar(false); setSelectedText(''); }}
          onCreate={handleCreateParagraph}
          creating={creating}
        />
      )}

      {showViewModal && currentParagraph && (
        <DuanLuoXiangQingTanChuang
          paragraph={currentParagraph}
          onClose={() => { setShowViewModal(false); }}
          onEdit={handleEditParagraph}
          onStartConceptLearning={onStartConceptLearning}
          onStartIntentionLearning={onStartIntentionLearning}
        />
      )}

      {showEditModal && currentParagraph && (
        <DuanLuoBianJiTanChuang
          paragraph={currentParagraph}
          editContent={editContent}
          onEditContentChange={setEditContent}
          onClose={() => { setShowEditModal(false); }}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}

      {showShanChuModal && currentParagraph && (
        <ShanChuQueRenTanChuang
          title="删除段落"
          content={`确定要删除「${currentParagraph.content.slice(0, 20)}...」吗？此操作无法撤销。`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showZhangJieEditModal && (
        <ZhangJieBianJiTanChuang
          chapter={chapter}
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onClose={closeModal}
          onSave={() => handleSaveZhangJieEdit(handleChapterUpdated)}
          loading={loading}
        />
      )}
    </div>
  );
}
