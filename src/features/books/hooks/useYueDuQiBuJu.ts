// @审计已完成
// 阅读器布局状态管理 Hook - 书名/作者/目录/抽屉面板控制
import { useState, useEffect, useCallback, useRef } from 'react';
import type { NavItem } from 'epubjs';
interface UseYueDuQiBuJuProps {
  book: any;
  renditionRef: React.RefObject<any>;
  highlights: Array<{ id: string; cfiRange: string }>;
  handleDeleteHighlight: (id: string) => void;
}
export function useYueDuQiBuJu({ book, highlights, handleDeleteHighlight }: UseYueDuQiBuJuProps) {
  const [shuMing, setShuMing] = useState('加载中...');
  const [zuoZhe, setZuoZhe] = useState('');
  const [zhangJieLieBiao, setZhangJieLieBiao] = useState<NavItem[]>([]);
  const [daKaiDeChouTi, setDaKaiDeChouTi] = useState<'mulu' | 'chazhao' | 'huaxian' | null>(null);
  const bookShangYiGeRef = useRef<any>(null);

  useEffect(() => {
    if (!book || book === bookShangYiGeRef.current) return;
    bookShangYiGeRef.current = book;
    setShuMing('加载中...');
    setZuoZhe('');
    setZhangJieLieBiao([]);
    book.loaded.metadata.then((meta: any) => {
      if (meta?.title) setShuMing(meta.title);
      if (meta?.creator) setZuoZhe(meta.creator);
    });
    book.loaded.navigation.then((nav: any) => {
      if (nav?.toc) setZhangJieLieBiao(nav.toc);
    });
  }, [book]);

  const qieHuanChouTi = useCallback((leiXing: string) => {
    setDaKaiDeChouTi(prev => prev === leiXing ? null : (leiXing as 'mulu' | 'chazhao' | 'huaxian'));
  }, []);

  return {
    shuMing, zuoZhe, zhangJieLieBiao, daKaiDeChouTi,
    qieHuanChouTi, setDaKaiDeChouTi,
    highlights, handleDeleteHighlight,
  };
}