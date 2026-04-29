// @审计已完成
// EPUB 阅读器翻页和页码 Hook

import { useRef, useState, useCallback } from 'react';
import type { Rendition, NavItem } from 'epubjs';

interface UseEPUBReaderFanYeHeYeMaProps {
  setYeMaXinXi: (val: string) => void;
  setLocation: (loc: string | number) => void;
  tiaoDaoShangYiGe: () => string | undefined;
  tiaoDaoXiaYiGe: () => string | undefined;
  externalRenditionRef?: React.RefObject<Rendition | undefined>;
  saveImmediately?: (loc: string | number) => void;
}

export function useEPUBReaderFanYeHeYeMa({
  setYeMaXinXi,
  setLocation,
  tiaoDaoShangYiGe,
  tiaoDaoXiaYiGe,
  externalRenditionRef,
  saveImmediately,
}: UseEPUBReaderFanYeHeYeMaProps) {
  const _renditionRef = useRef<Rendition | undefined>(undefined);
  const renditionRef = externalRenditionRef || _renditionRef;
  const tocRef = useRef<NavItem[]>([]);
  const [renditionJiuXu, setRenditionJiuXu] = useState(false);

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
    console.log('[调试] handleNextPage 被调用');
    const rendition = renditionRef.current;
    if (!rendition) {
      console.log('[调试] handleNextPage: rendition 不存在');
      return;
    }
    
    console.log('[调试] handleNextPage: rendition 存在，开始处理翻页');
    const currentLocation = rendition.location;
    console.log('[调试] handleNextPage: 当前位置', currentLocation);
    
    if (!currentLocation) {
      console.log('[调试] handleNextPage: currentLocation 不存在，使用 rendition.next()');
      rendition.next().then(() => {
        console.log('[调试] handleNextPage: 下一页成功');
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => { 
        console.error('[调试] handleNextPage: 下一页出错:', error); 
      });
      return;
    }
    
    const currentDisplayed = currentLocation?.start?.displayed;
    console.log('[调试] handleNextPage: 当前页码信息', currentDisplayed);
    
    const currentPage = currentDisplayed?.page;
    const currentHref = currentLocation?.start?.href;
    
    console.log('[调试] handleNextPage: 当前页码', currentPage, 'href', currentHref);
    
    if (currentPage === 1) {
      console.log('[调试] handleNextPage: 是章节第一页，直接跳转到下一章节');
      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const nextIndex = currentLocation.start.index + 1;
          const nextSection = spine.get(nextIndex);
          console.log('[调试] handleNextPage: 下一章节索引', nextIndex, '章节信息', nextSection);
          console.log('[调试] handleNextPage: nextSection.href=', nextSection?.href);
          console.log('[调试] handleNextPage: nextSection.href 属性', nextSection ? nextSection.href : 'undefined');
          
          if (nextSection && nextSection.href) {
            const targetHref = nextSection.href;
            console.log('[调试] handleNextPage: 跳转到下一章节', targetHref);
            
            rendition.display(targetHref).then(() => {
              console.log('[调试] handleNextPage: 跳转到下一章节成功，准备强制刷新');
              console.log('[调试] handleNextPage: 刷新前 rendition.location', rendition.location);
              console.log('[调试] handleNextPage: 刷新前 location.start.href', rendition.location?.start?.href);
              
              const contents = rendition.getContents();
              console.log('[调试] handleNextPage: contents 数量', contents ? contents.length : 0);
              
              setTimeout(() => {
                console.log('[调试] handleNextPage: setTimeout 延迟刷新');
                rendition.resize();
                const views = rendition.views();
                console.log('[调试] handleNextPage: views 数量', views ? views.length : 0);
                
                const newLocation = rendition.location;
                console.log('[调试] handleNextPage: 刷新后 location', newLocation);
                console.log('[调试] handleNextPage: 刷新后 location.href', newLocation?.start?.href);
                
                if (contents && contents.length > 0) {
                  const content = contents[0];
                  console.log('[调试] handleNextPage: content iframe', content?.iframe);
                  if (content?.iframe && content.iframe.contentWindow) {
                    const iframeWindow = content.iframe.contentWindow;
                    console.log('[调试] handleNextPage: iframe 加载的文档', iframeWindow?.document?.URL);
                  }
                }
                
                gengXinYeMaXinXi();
                const currentHref = rendition.location?.start?.href || '';
                if (currentHref && saveImmediately) {
                  saveImmediately(currentHref);
                }
              }, 50);
            }).catch((err) => {
              console.error('[调试] handleNextPage: 跳转到下一章节失败', err);
            });
          } else {
            console.log('[调试] handleNextPage: 已经是最后一章了');
          }
        }
      } catch (e) {
        console.error('[调试] handleNextPage: 尝试跳转到下一章节出错', e);
      }
    } else {
      console.log('[调试] handleNextPage: 不是第一页，正常翻页');
      rendition.next().then(() => {
        console.log('[调试] handleNextPage: 翻页成功');
        gengXinYeMaXinXi();
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => { 
        console.error('[调试] handleNextPage: 下一页出错:', error); 
      });
    }
  }, [gengXinYeMaXinXi, saveImmediately]);

  const handlePrevPage = useCallback(() => {
    console.log('[调试] handlePrevPage 被调用');
    if (!renditionRef.current) {
      console.log('[调试] handlePrevPage: rendition 不存在');
      return;
    }
    const rendition = renditionRef.current;
    
    const currentLocation = rendition.location;
    console.log('[调试] handlePrevPage: 当前位置', currentLocation);
    
    const currentDisplayed = currentLocation?.start?.displayed;
    console.log('[调试] handlePrevPage: 当前页码信息', currentDisplayed);
    
    const currentPage = currentDisplayed?.page;
    const currentHref = currentLocation?.start?.href;
    
    console.log('[调试] handlePrevPage: 当前页码', currentPage, 'href', currentHref);
    
    const totalPages = currentDisplayed?.total;
    
    if (currentPage === totalPages) {
      console.log('[调试] handlePrevPage: 是章节最后一页，直接跳转到上一章节');
      try {
        const book = (rendition as any).book;
        const spine = book?.spine;
        if (spine && currentLocation?.start?.index !== undefined) {
          const prevIndex = currentLocation.start.index - 1;
          const prevSection = spine.get(prevIndex);
          console.log('[调试] handlePrevPage: 上一章节索引', prevIndex, '章节信息', prevSection);
          
          if (prevSection) {
            console.log('[调试] handlePrevPage: 跳转到上一章节', prevSection.href);
            rendition.display(prevSection.href).then(() => {
              console.log('[调试] handlePrevPage: 跳转到上一章节成功');
              gengXinYeMaXinXi();
              const currentHref = rendition.location?.start?.href || '';
              if (currentHref && saveImmediately) {
                saveImmediately(currentHref);
              }
            }).catch((err) => {
              console.error('[调试] handlePrevPage: 跳转到上一章节失败', err);
            });
          } else {
            console.log('[调试] handlePrevPage: 已经是第一章了');
          }
        }
      } catch (e) {
        console.error('[调试] handlePrevPage: 尝试跳转到上一章节出错', e);
      }
    } else {
      console.log('[调试] handlePrevPage: 不是最后一页，正常翻页');
      rendition.prev().then(() => {
        console.log('[调试] handlePrevPage: 翻页成功');
        gengXinYeMaXinXi();
        const currentHref = rendition.location?.start?.href || '';
        if (currentHref && saveImmediately) {
          saveImmediately(currentHref);
        }
      }).catch((error) => { 
        console.error('[调试] handlePrevPage: 上一页出错:', error); 
      });
    }
  }, [gengXinYeMaXinXi, saveImmediately]);

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
  };
}
