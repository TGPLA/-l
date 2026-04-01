// @审计已完成
// EPUB 阅读器基础 Hooks

import { useState, useCallback } from 'react';
import { useHuaCiJiaoHu } from './useHuaCiChuangJian';
import { useHuaXianChuTi } from './useHuaXianChuTi';
import { useYueDuJinDu } from './useYueDuJinDu';
import { useZhuTi } from './useZhuTi';
import { useSouSuo } from './useSouSuo';
import { authService } from '../../../shared/services/auth';

interface UseEPUBReaderJiChuHuoProps {
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function useEPUBReaderJiChuHuo({ 
  bookId, 
  chapterId, 
  onParagraphCreated 
}: UseEPUBReaderJiChuHuoProps) {
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || 'guest';

  const { location, setLocation } = useYueDuJinDu({ userId, bookId });
  const { zhuTi, setZhuTi, yingYongZhuTi } = useZhuTi({ userId, bookId });
  const {
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
  } = useSouSuo();

  const [yeMaXinXi, setYeMaXinXi] = useState('');
  const [ziTiDaXiao, setZiTiDaXiao] = useState(100);
  const [huaCiKaiQi, setHuaCiKaiQi] = useState(true);

  const {
    selectedText,
    showMenu,
    selectionRect,
    setSelectedText,
    setShowMenu,
    setSelectionRect,
    handleCancel,
  } = useHuaCiJiaoHu(huaCiKaiQi);

  const {
    generating,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  } = useHuaXianChuTi(chapterId, handleCancel);

  return {
    location,
    setLocation,
    zhuTi,
    setZhuTi,
    yingYongZhuTi,
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
    yeMaXinXi,
    setYeMaXinXi,
    ziTiDaXiao,
    setZiTiDaXiao,
    selectedText,
    showMenu,
    selectionRect,
    generating,
    huaCiKaiQi,
    setHuaCiKaiQi,
    setSelectedText,
    setShowMenu,
    setSelectionRect,
    handleCancel,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  };
}
