// @审计已完成
// EPUB 阅读器翻页和页码 Hook

import { useRef, useState, useCallback } from 'react';
import type { Rendition, NavItem } from 'epubjs';
import { showWarning, showError } from '@shared/utils/common/ToastGongJu';

interface UseEPUBReaderFanYeHeYeMaProps {
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  saveImmediately?: (loc: string | number) => void;
  onFanYeCuoWu?: (cuoWu: string) => void;
  onFanYeJiaZaiZhong?: (jiaZai: boolean) => void;
}

export function useEPUBReaderFanYeHeYeMa({
  setYeMaXinXi,
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
  // 使用 ref 保存翻页加载状态，避免闭包问题
  const fanYeJiaZaiZhongRef = useRef(false);

  const gengXinYeMaXinXi = useCallback(() => {
    if (renditionRef.current && tocRef.current.length > 0) {
      try {
        const location = renditionRef.current.location;
        if (!location?.start) {
          return;
        }
        const { displayed, href } = location.start;
        const currentHrefBase = href.split('#')[0];
        let chapter: NavItem | undefined;
        for (let i = tocRef.current.length - 1; i >= 0; i--) {
          const item = tocRef.current[i];
          const itemHrefBase = item.href.split('#')[0];
          if (currentHrefBase >= itemHrefBase) {
            chapter = item;
            break;
          }
        }
        const chapterName = chapter ? chapter.label.trim() : '未知章节';
        setYeMaXinXi(`第 ${displayed.page} / ${displayed.total} 页 - ${chapterName}`);
      } catch (error) { 
        console.error('更新页码信息出错:', error);
        setYeMaXinXi(''); 
      }
    }
  }, [setYeMaXinXi]);

  const handleNextPage = useCallback(() => {
    console.log('[翻页] handleNextPage 开始执行');
    console.log('[翻页] renditionRef.current:', renditionRef.current);
    console.log('[翻页] externalRenditionRef:', externalRenditionRef?.current);
    console.log('[翻页] renditionJiuXu 状态:', renditionJiuXu);
    const rendition = renditionRef.current;
    if (!rendition) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    // 使用 ref 检查翻页状态，避免闭包问题
    if (fanYeJiaZaiZhongRef.current) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    // 同步更新 ref 和 state
    fanYeJiaZaiZhongRef.current = true;
    setFanYeJiaZaiZhong(true);
    onFanYeJiaZaiZhong?.(true);

    const currentLocation = rendition.location;
    const currentDisplayed = currentLocation?.start?.displayed;
    const currentPage = currentDisplayed?.page;
    const totalPages = currentDisplayed?.total;

    console.log('[翻页] 当前页码:', currentPage, '总页数:', totalPages, '位置:', currentLocation?.start?.href);

    // 统一完成翻页的函数，避免重复代码和状态竞争
    const finishPageTurn = (skipLocationUpdate = false) => {
      const newCfi = rendition.location?.start?.cfi;
      const newHref = rendition.location?.start?.href;
      console.log('[翻页] 完成翻页 - CFI:', newCfi, 'href:', newHref);

      // 先更新页码信息
      gengXinYeMaXinXi();

      // 仅在需要时更新 location，避免与 rendition 内部状态竞争
      // 注意：rendition.next() 已经触发了 relocated 事件，该事件已经调用了 handleLocationChanged -> setLocation
      // 所以这里不需要再次调用 setLocation，除非 skipLocationUpdate 为 false 且位置确实变化了
      if (newCfi && !skipLocationUpdate) {
        // 同步更新 lastSetLocationRef，避免 handleLocationChanged 中的重复检测误判
        lastSetLocationRef.current = newCfi;
        // 使用 setTimeout 延迟到下一个事件循环，确保 rendition 的渲染事件先处理完毕
        setTimeout(() => {
          setLocation(newCfi);
        }, 0);
      }

      // 保存阅读进度
      const currentHref = rendition.location?.start?.href || '';
      if (currentHref && saveImmediately) {
        saveImmediately(currentHref);
      }

      // 最后重置翻页状态
      fanYeJiaZaiZhongRef.current = false;
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
    };

    const handlePageTurnError = (error: any) => {
      console.log('[翻页] 翻页失败:', error);
      fanYeJiaZaiZhongRef.current = false;
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    };

    const fanYeDaoXiaYiZhangJie = () => {
      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        const currentIndex = currentLocation?.start?.index ?? 0;
        const spineItems = spine?.items?.length;

        if (!spine || !spineItems) {
          console.log('[翻页] spine 不存在或为空，尝试 rendition.next()');
          rendition.next().then(() => {
            finishPageTurn();
          }).catch((error) => {
            handlePageTurnError(error);
          });
          return;
        }

        if (currentIndex >= spineItems - 1) {
          console.log('[翻页] 已经是最后一章');
          fanYeJiaZaiZhongRef.current = false;
          setFanYeJiaZaiZhong(false);
          onFanYeJiaZaiZhong?.(false);
          showWarning('已经是最后一页');
          onFanYeCuoWu?.('已经是最后一页');
          return;
        }

        const nextIndex = currentIndex + 1;
        const nextSection = spine.get(nextIndex);

        console.log('[翻页] 跳转到下一章节，索引:', nextIndex, '章节:', nextSection?.href);

        if (nextSection) {
          rendition.display(nextSection.href).then(() => {
            console.log('[翻页] 章节跳转完成，等待渲染...');
            setTimeout(() => {
              const newLoc = rendition.location?.start?.href;
              if (newLoc === currentLocation?.start?.href) {
                rendition.queueVisibilityManager?.visibilities?.forEach?.((v: any) => v.update?.());
              }
              finishPageTurn();
            }, 50);
          }).catch((error) => {
            console.log('[翻页] 章节跳转失败，尝试 rendition.next()', error);
            rendition.next().then(() => {
              setTimeout(() => finishPageTurn(), 50);
            }).catch(handlePageTurnError);
          });
        } else {
          rendition.next().then(() => {
            setTimeout(() => finishPageTurn(), 50);
          }).catch(handlePageTurnError);
        }
      } catch (e) {
        console.log('[翻页] 获取 spine 失败，尝试 rendition.next()', e);
        rendition.next().then(() => {
          setTimeout(() => finishPageTurn(), 50);
        }).catch(handlePageTurnError);
      }
    };

    // 尝试在当前章节内翻页（使用 rendition.next()）
    // 关键：不依赖 Promise resolved 判断翻页成功，而是监听 relocated 事件
    console.log('[翻页] 尝试在当前章节内翻页');
    const fanYeQianLocation = rendition.location?.start;
    console.log('[翻页] 翻页前 location:', JSON.stringify({
      cfi: fanYeQianLocation?.cfi,
      href: fanYeQianLocation?.href,
      page: fanYeQianLocation?.displayed?.page,
      total: fanYeQianLocation?.displayed?.total
    }));

    const fanYeQianCfi = fanYeQianLocation?.cfi;
    const fanYeQianPage = fanYeQianLocation?.displayed?.page;

    let fanYeWanCheng = false;
    let shengYuShiJian = 500;

    const jiLuFangWen = (location: any) => {
      if (fanYeWanCheng) return;
      const xinCfi = location?.start?.cfi;
      const xinPage = location?.start?.displayed?.page;
      console.log('[翻页] relocated 事件触发:', JSON.stringify({
        cfi: xinCfi,
        page: xinPage
      }));

      if (xinCfi !== fanYeQianCfi || xinPage !== fanYeQianPage) {
        console.log('[翻页] relocated 确认翻页成功');
        fanYeWanCheng = true;
        finishPageTurn();
      }
    };

    const jiLuFangWenDao = rendition.on('relocated', jiLuFangWen);

    rendition.next().then(() => {
      console.log('[翻页] rendition.next() Promise resolved');
    }).catch((error) => {
      console.log('[翻页] rendition.next() Promise rejected，尝试跳转到下一章节', error);
      if (fanYeWanCheng) return;
      fanYeWanCheng = true;
      jiLuFangWenDao.remove();
      fanYeDaoXiaYiZhangJie();
    });

    setTimeout(() => {
      if (fanYeWanCheng) return;
      console.log('[翻页] 等待 relocated 事件超时，检查当前状态');
      const dangQianCfi = rendition.location?.start?.cfi;
      const dangQianPage = rendition.location?.start?.displayed?.page;
      console.log('[翻页] 超时后当前 location:', JSON.stringify({
        cfi: dangQianCfi,
        page: dangQianPage
      }));

      if (dangQianCfi === fanYeQianCfi && dangQianPage === fanYeQianPage) {
        console.log('[翻页] 超时后 CFI 和 Page 仍无变化，强制跳转到下一章节');
        fanYeWanCheng = true;
        jiLuFangWenDao.remove();
        fanYeDaoXiaYiZhangJie();
      } else {
        console.log('[翻页] 超时后检测到位置变化（可能是 relocated 延迟触发），完成翻页');
        fanYeWanCheng = true;
        jiLuFangWenDao.remove();
        finishPageTurn();
      }
    }, shengYuShiJian);
  }, [gengXinYeMaXinXi, saveImmediately, onFanYeCuoWu, onFanYeJiaZaiZhong, setLocation]);

  const handlePrevPage = useCallback(() => {
    if (!renditionRef.current) {
      const cuoWu = '书籍正在加载中，请稍后再试';
      console.log('[翻页错误]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    // 使用 ref 检查翻页状态，避免闭包问题
    if (fanYeJiaZaiZhongRef.current) {
      const cuoWu = '正在翻页中，请勿重复点击';
      console.log('[翻页提示]', cuoWu);
      showWarning(cuoWu);
      onFanYeCuoWu?.(cuoWu);
      return;
    }

    const rendition = renditionRef.current;
    const currentLocation = rendition.location;
    const currentDisplayed = currentLocation?.start?.displayed;
    const currentPage = currentDisplayed?.page;
    const totalPages = currentDisplayed?.total;

    // 统一完成上一页翻页的函数
    const finishPrevPageTurn = () => {
      gengXinYeMaXinXi();
      const currentHref = rendition.location?.start?.href || '';
      if (currentHref && saveImmediately) {
        saveImmediately(currentHref);
      }
      fanYeJiaZaiZhongRef.current = false;
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
    };

    const handlePrevPageError = (error: any) => {
      fanYeJiaZaiZhongRef.current = false;
      setFanYeJiaZaiZhong(false);
      onFanYeJiaZaiZhong?.(false);
      const cuoWu = `翻页失败：${error instanceof Error ? error.message : '未知错误'}`;
      console.error('[翻页错误]', cuoWu);
      showError(cuoWu);
      onFanYeCuoWu?.(cuoWu);
    };

    const fanYeDaoZhangJie = () => {
      fanYeJiaZaiZhongRef.current = true;
      setFanYeJiaZaiZhong(true);
      onFanYeJiaZaiZhong?.(true);

      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const prevIndex = currentLocation.start.index - 1;
          const prevSection = spine.get(prevIndex);
          
          if (prevSection) {
            rendition.display(prevSection.href).then(() => {
              finishPrevPageTurn();
            }).catch((err) => {
              handlePrevPageError(err);
            });
          } else {
            fanYeJiaZaiZhongRef.current = false;
            setFanYeJiaZaiZhong(false);
            onFanYeJiaZaiZhong?.(false);
            showWarning('已经是第一页');
            onFanYeCuoWu?.('已经是第一页');
          }
        }
      } catch (e) {
        handlePrevPageError(e);
      }
    };

    if (currentPage === totalPages) {
      fanYeDaoZhangJie();
    } else {
      fanYeJiaZaiZhongRef.current = true;
      setFanYeJiaZaiZhong(true);
      onFanYeJiaZaiZhong?.(true);

      rendition.prev().then(() => {
        finishPrevPageTurn();
      }).catch((error) => {
        handlePrevPageError(error);
      });
    }
  }, [gengXinYeMaXinXi, saveImmediately, onFanYeCuoWu, onFanYeJiaZaiZhong]);

  const handleShangYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoShangYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoShangYiGe, setLocation]);

  const handleXiaYiGeSouSuoJieGuo = useCallback(() => {
    const cfi = tiaoDaoXiaYiGe();
    if (cfi && renditionRef.current) setLocation(cfi);
  }, [tiaoDaoXiaYiGe, setLocation]);

  // 使用 ref 记录最后一次设置的位置，避免重复设置导致闪烁
  const lastSetLocationRef = useRef<string>('');

  const handleLocationChanged = useCallback((epubcfi: string) => {
    // 如果位置没有变化，不重复设置，避免触发重新渲染造成闪烁
    if (lastSetLocationRef.current === epubcfi) {
      console.log('[位置] 位置未变化，跳过 setLocation:', epubcfi);
      gengXinYeMaXinXi();
      return;
    }
    lastSetLocationRef.current = epubcfi;
    setLocation(epubcfi);
    gengXinYeMaXinXi();
  }, [setLocation, gengXinYeMaXinXi]);

  return {
    renditionRef,
    renditionJiuXu,
    setRenditionJiuXu,
    tocRef,
    gengXinYeMaXinXi,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    lastSetLocationRef,
  };
}
