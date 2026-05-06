// @审计已完成
// 阅读器布局状态管理 Hook - 书名/作者/目录/抽屉面板控制

import { useState, useEffect, useCallback } from 'react';
import type { NavItem } from 'epubjs';

interface UseYueDuQiBuJuProps {
  bookRef: React.RefObject<any>;
  renditionRef: React.RefObject<any>;
  highlights: Array<{ id: string; cfiRange: string }>;
  handleDeleteHighlight: (id: string) => void;
}

export function useYueDuQiBuJu({ bookRef, highlights, handleDeleteHighlight }: UseYueDuQiBuJuProps) {
  const [shuMing, setShuMing] = useState('加载中...');
  const [zuoZhe, setZuoZhe] = useState('');
  const [zhangJieLieBiao, setZhangJieLieBiao] = useState<NavItem[]>([]);
  const [daKaiDeChouTi, setDaKaiDeChouTi] = useState<'mulu' | 'chazhao' | 'huaxian' | null>(null);
  const [yiHuoQuShuMing, setYiHuoQuShuMing] = useState(false);

  useEffect(() => {
    if (yiHuoQuShuMing) return;
    
    const checkAndLoad = () => {
      const book = bookRef.current;
      if (!book) return false;
      
      setYiHuoQuShuMing(true);
      Promise.all([
        book.loaded.metadata,
        book.loaded.navigation
      ]).then(([meta, nav]: [any, any]) => {
        if (meta?.title) setShuMing(meta.title);
        if (meta?.creator) setZuoZhe(meta.creator);
        if (nav?.toc) setZhangJieLieBiao(nav.toc);
      }).catch((error) => {
        console.error('加载书籍信息失败:', error);
      });
      
      return true;
    };
    
    // 先立即尝试一次
    const loaded = checkAndLoad();
    if (loaded) return;
    
    // 如果没有立即加载，设置定时器检查
    let attempts = 0;
    const maxAttempts = 50; // 最多检查5秒
    const intervalId = setInterval(() => {
      attempts++;
      const loadedNow = checkAndLoad();
      if (loadedNow || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [bookRef, yiHuoQuShuMing]);

  const qieHuanChouTi = useCallback((leiXing: string) => {
    setDaKaiDeChouTi(prev => prev === leiXing ? null : (leiXing as 'mulu' | 'chazhao' | 'huaxian'));
  }, []);

  return {
    shuMing, zuoZhe, zhangJieLieBiao, daKaiDeChouTi,
    qieHuanChouTi, setDaKaiDeChouTi,
    highlights, handleDeleteHighlight,
  };
}
