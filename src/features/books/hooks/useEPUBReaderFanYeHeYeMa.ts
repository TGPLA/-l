// @审计已完成
// EPUB 阅读器翻页和页码 Hook

import { useRef, useState, useCallback } from 'react';
import type { Rendition, NavItem } from 'epubjs';
import { showWarning, showError } from '@shared/utils/common/ToastGongJu';

interface UseEPUBReaderFanYeHeYeMaProps {
  setLocation: (loc: string | number) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  saveImmediately?: (loc: string | number) => void;
  onFanYeCuoWu?: (cuoWu: string) => void;
  onFanYeJiaZaiZhong?: (jiaZai: boolean) => void;
}

export function useEPUBReaderFanYeHeYeMa({
  setLocation,
  tiaoDaoShangYiGe,
  tiaoDaoXiaYiGe,
  externalRenditionRef,
  saveImmediately,
  onFanYeCuoWu,
  onFanYeJiaZaiZhong,
}: UseEPUBReaderFanYeHeYeMaProps) {
  const _renditionRef = useRef<Rendition | undefined>(undefined);
  const renditionRef = externalRenditionRef || _renditionRef;
  const tocRef = useRef<NavItem[]>([]);
  const [renditionJiuXu, setRenditionJiuXu] = useState(false);
  const [fanYeJiaZaiZhong, setFanYeJiaZaiZhong] = useState(false);

  // 等待 rendition.location 更新（多帧轮询，最多等约 160ms）
  const waitForLocationChange = useCallback((
    rendition: Rendition,
    prevHref: string,
    prevCfi: string,
    maxFrames: number = 5,
  ): Promise<{ changed: boolean; href?: string }> => {
    return new Promise((resolve) => {
      let frames = 0;
      const check = () => {
        frames++;
        const loc = rendition.location;
        const newHref = loc?.start?.href || '';
        const newCfi = loc?.start?.cfi || '';

        if (newHref !== prevHref || newCfi !== prevCfi) {
          console.log(`[翻页] 位置已变更（第${frames}帧）`);
          resolve({ changed: true, href: newHref });
        } else if (frames >= maxFrames) {
          console.log(`[翻页] ${maxFrames}帧后位置仍未变更`);
          resolve({ changed: false });
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });
  }, []);

  // 跳转到下一章节
  const jumpToNextSection = useCallback((rendition: Rendition, currentIndex?: number) => {
    try {
      const book = (rendition as any).book;
      const spine = book?.spine;
      const spineItems = spine?.items?.length;
      const index = currentIndex ?? rendition.location?.start?.index ?? 0;

      if (!spine || !spineItems) {
        console.log('[翻页] spine 不存在，已经是最后一章');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是最后一页');
        onFanYeCuoWu?.('已经是最后一页');
        return;
      }

      if (index >= spineItems - 1) {
        console.log('[翻页] 已经是最后一章');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是最后一页');
        onFanYeCuoWu?.('已经是最后一页');
        return;
      }

      const nextIndex = index + 1;
      const nextSection = spine.get(nextIndex);

      console.log('[翻页] 下一章节索引:', nextIndex, '总章节数:', spineItems, '章节:', nextSection?.href);

      if (nextSection) {
        rendition.display(nextSection.href).then(() => {
          console.log('[翻页] 跳转下一章节完成:', nextSection.href);
          setFanYeJiaZaiZhong(false);
          onFanYeJiaZaiZhong?.(false);
        }).catch((error: any) => {
          console.log('[翻页] 跳转下一章节失败:', error);
          setFanYeJiaZaiZhong(false);
          onFanYeJiaZaiZhong?.(false);
          const cuoWu = `跳转下一章节失败：${error instanceof Error ? error.message : '未知错误'}`;
          showError(cuoWu);
          onFanYeCuoWu?.(cuoWu);
        });
      } else {
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是最后一页');
        onFanYeCuoWu?.('已经是最后一页');
      }
    } catch (e) {
      console.log('[翻页] 获取 spine 失败:', e);
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `跳转下一章节失败：${e instanceof Error ? e.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    }
  }, [saveImmediately, onFanYeCuoWu, onFanYeJiaZaiZhong]);

  // 跳转到上一章节
  const jumpToPrevSection = useCallback((rendition: Rendition, currentIndex?: number) => {
    try {
      const book = (rendition as any).book;
      const spine = book?.spine;
      const index = currentIndex ?? rendition.location?.start?.index ?? 0;

      if (!spine) {
        console.log('[翻页] spine 不存在，已经是第一章');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是第一页');
        onFanYeCuoWu?.('已经是第一页');
        return;
      }

      if (index <= 0) {
        console.log('[翻页] 已经是第一章');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是第一页');
        onFanYeCuoWu?.('已经是第一页');
        return;
      }

      const prevIndex = index - 1;
      const prevSection = spine.get(prevIndex);

      console.log('[翻页] 上一章节索引:', prevIndex, '章节:', prevSection?.href);

      if (prevSection) {
        rendition.display(prevSection.href).then(() => {
          console.log('[翻页] 跳转上一章节完成:', prevSection.href);
          setFanYeJiaZaiZhong(false);
          onFanYeJiaZaiZhong?.(false);
        }).catch((err: any) => {
          console.log('[翻页] 跳转上一章节失败:', err);
          setFanYeJiaZaiZhong(false);
          onFanYeJiaZaiZhong?.(false);
          const cuoWu = `跳转上一章节失败：${err instanceof Error ? err.message : '未知错误'}`;
          showError(cuoWu);
          onFanYeCuoWu?.(cuoWu);
        });
      } else {
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
        showWarning('已经是第一页');
        onFanYeCuoWu?.('已经是第一页');
      }
    } catch (e) {
      console.log('[翻页] 跳转上一章节失败:', e);
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `跳转上一章节失败：${e instanceof Error ? e.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    }
  }, [saveImmediately, onFanYeCuoWu, onFanYeJiaZaiZhong]);

  const handleNextPage = useCallback(() => {
    console.log('[翻页] handleNextPage 开始执行');
    const rendition = renditionRef.current;
    if (!rendition) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    if (fanYeJiaZaiZhong) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    const prevLocation = rendition.location;
    const prevHref = prevLocation?.start?.href || '';
    const prevIndex = prevLocation?.start?.index ?? 0;
    const prevCfi = prevLocation?.start?.cfi || '';
    console.log('[翻页] 当前 - cfi:', prevCfi?.substring(0, 25), '章节:', prevHref);

    // 记录滚动位置，用于判断 rendition.next() 是否真正发生了滚动
    const manager = (rendition as any).manager;
    const container = manager?.container;
    const scrollLeftBefore = container?.scrollLeft ?? 0;

    setFanYeJiaZaiZhong(true);
    onFanYeJiaZaiZhong?.(true);

    rendition.next().then(() => {
      // 检查滚动位置是否变化——这是最可靠的边界检测方式
      const scrollLeftAfter = container?.scrollLeft ?? 0;
      if (scrollLeftAfter === scrollLeftBefore) {
        // 滚动未发生，但 epubjs 可能已通过 append() 完成了跨章节导航
        // 等一帧让 reportLocation 的 RAF 更新 rendition.location，再判断
        requestAnimationFrame(() => {
          const newHref = rendition.location?.start?.href || '';
          const newCfi = rendition.location?.start?.cfi || '';
          if ((newHref && newHref !== prevHref) || (newCfi && newCfi !== prevCfi)) {
            console.log('[翻页] epubjs 已跨章节导航，翻页成功');
            setFanYeJiaZaiZhong(false);
            onFanYeJiaZaiZhong?.(false);
          } else {
            console.log('[翻页] 滚动位置未变且位置相同，直接跳转下一章节');
            jumpToNextSection(rendition, prevIndex);
          }
        });
        return;
      }
      // 发生了滚动，用轮询确认位置已更新
      return waitForLocationChange(rendition, prevHref, prevCfi, 5);
    }).then((result: any) => {
      if (!result) return; // jumpToNextSection 或 epubjs 已处理
      if (result.changed) {
        console.log('[翻页] 翻页成功');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
      } else {
        console.log('[翻页] 位置未变，跳转下一章节');
        jumpToNextSection(rendition, prevIndex);
      }
    }).catch((error: any) => {
      console.log('[翻页] rendition.next() 失败:', error);
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    });
  }, [saveImmediately, fanYeJiaZaiZhong, onFanYeCuoWu, onFanYeJiaZaiZhong, waitForLocationChange, jumpToNextSection]);

  const handlePrevPage = useCallback(() => {
    console.log('[翻页] handlePrevPage 开始执行');
    const rendition = renditionRef.current;
    if (!rendition) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    if (fanYeJiaZaiZhong) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    const prevLocation = rendition.location;
    const prevHref = prevLocation?.start?.href || '';
    const prevIndex = prevLocation?.start?.index ?? 0;
    const prevCfi = prevLocation?.start?.cfi || '';
    console.log('[翻页] 当前 - cfi:', prevCfi?.substring(0, 25), '章节:', prevHref);

    const manager = (rendition as any).manager;
    const container = manager?.container;
    const scrollLeftBefore = container?.scrollLeft ?? 0;

    setFanYeJiaZaiZhong(true);
    onFanYeJiaZaiZhong?.(true);

    rendition.prev().then(() => {
      const scrollLeftAfter = container?.scrollLeft ?? 0;
      if (scrollLeftAfter === scrollLeftBefore) {
        requestAnimationFrame(() => {
          const newHref = rendition.location?.start?.href || '';
          const newCfi = rendition.location?.start?.cfi || '';
          if ((newHref && newHref !== prevHref) || (newCfi && newCfi !== prevCfi)) {
            console.log('[翻页] epubjs 已跨章节导航，翻页成功');
            setFanYeJiaZaiZhong(false);
            onFanYeJiaZaiZhong?.(false);
          } else {
            console.log('[翻页] 滚动位置未变且位置相同，直接跳转上一章节');
            jumpToPrevSection(rendition, prevIndex);
          }
        });
        return;
      }
      return waitForLocationChange(rendition, prevHref, prevCfi, 5);
    }).then((result: any) => {
      if (!result) return;
      if (result.changed) {
        console.log('[翻页] 翻页成功');
        setFanYeJiaZaiZhong(false);
        onFanYeJiaZaiZhong?.(false);
      } else {
        console.log('[翻页] 位置未变，跳转上一章节');
        jumpToPrevSection(rendition, prevIndex);
      }
    }).catch((error: any) => {
      console.log('[翻页] rendition.prev() 失败:', error);
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    });
  }, [saveImmediately, fanYeJiaZaiZhong, onFanYeCuoWu, onFanYeJiaZaiZhong, waitForLocationChange, jumpToPrevSection]);

  const handleShangYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoShangYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoShangYiGe, setLocation]);

  const handleXiaYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoXiaYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoXiaYiGe, setLocation]);

  const handleLocationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi);
  }, [setLocation]);

  return {
    renditionRef,
    renditionJiuXu,
    setRenditionJiuXu,
    tocRef,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
  };
}
