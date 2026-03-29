// @审计已完成
// EPUB 阅读器组件 - 封装 react-reader

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition, Contents } from 'epubjs';
import { useHuaCiChuangJian } from '../hooks/useHuaCiChuangJian';
import { HuaCiChuangJianDiLan } from './HuaCiChuangJianDiLan';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated }: EPUBReaderProps) {
  const [location, setLocation] = useState<string | number>(0);
  const renditionRef = useRef<Rendition | undefined>(undefined);
  const [bookLoaded, setBookLoaded] = useState(false);
  const tocRef = useRef<any[]>([]);
  const [isAtStart, setIsAtStart] = useState(true);

  console.log('📖 EPUBReader 初始化:', { url, bookId, chapterId });
  console.log('🔗 最终 URL:', url);

  const {
    selectedText,
    showSelectionBar,
    creating,
    enabled,
    setEnabled,
    setShowSelectionBar,
    setSelectedText,
    handleCreateParagraph,
  } = useHuaCiChuangJian(chapterId, () => {
    onParagraphCreated?.();
    setShowSelectionBar(false);
    setSelectedText('');
  });

  const handleCancel = useCallback(() => {
    setShowSelectionBar(false);
    setSelectedText('');
  }, [setShowSelectionBar, setSelectedText]);

  const handleTextSelected = useCallback((cfiRange: string, contents: Contents) => {
    console.log('✏️ 文本被选中:', { cfiRange, enabled });
    if (!renditionRef.current || !enabled) return;

    try {
      const text = renditionRef.current.getRange(cfiRange).toString().trim();
      console.log('📝 选中文本:', text);
      if (text) {
        setSelectedText(text);
        setShowSelectionBar(true);
      }

      const selection = contents.window.getSelection();
      selection?.removeAllRanges();
    } catch (error) {
      console.error('❌ 处理选中文本时出错:', error);
    }
  }, [enabled, setSelectedText, setShowSelectionBar]);

  const handleRendition = useCallback((rendition: Rendition) => {
    console.log('🎨 Rendition 已获取');
    console.log('📚 Rendition 详情:', rendition);
    renditionRef.current = rendition;
    setBookLoaded(true);

    rendition.on('selected', handleTextSelected);

    rendition.book.loaded.navigation.then((nav) => {
      console.log('📖 书籍导航加载完成:', nav);
      tocRef.current = nav.toc || [];
      console.log('💡 提示：点击左上角菜单打开目录，或使用左右箭头翻页');
    });

    rendition.book.loaded.metadata.then((meta) => {
      console.log('📖 书籍元数据加载完成:', meta);
    });
  }, [handleTextSelected]);

  const handleNextPage = useCallback(() => {
    console.log('➡️ 点击下一页', { isAtStart });
    if (renditionRef.current) {
      console.log('📚 Rendition 状态:', {
        hasNext: typeof renditionRef.current.next === 'function',
        hasPrev: typeof renditionRef.current.prev === 'function',
        location: renditionRef.current.location,
        tocCount: tocRef.current.length,
        isAtStart
      });
      
      if (isAtStart && tocRef.current.length > 0) {
        const firstChapterHref = tocRef.current[0].href;
        console.log('📄 跳转到第一个章节:', firstChapterHref);
        renditionRef.current.display(firstChapterHref);
      } else {
        console.log('📄 正常翻页');
        try {
          const result = renditionRef.current.next();
          console.log('✅ next() 调用结果:', result);
        } catch (error) {
          console.error('❌ 下一页出错:', error);
        }
      }
    } else {
      console.log('❌ Rendition 未初始化');
    }
  }, [isAtStart]);

  const handlePrevPage = useCallback(() => {
    console.log('⬅️ 点击上一页');
    if (renditionRef.current) {
      console.log('📚 Rendition 状态:', {
        hasNext: typeof renditionRef.current.next === 'function',
        hasPrev: typeof renditionRef.current.prev === 'function',
        location: renditionRef.current.location
      });
      try {
        const result = renditionRef.current.prev();
        console.log('✅ prev() 调用结果:', result);
      } catch (error) {
        console.error('❌ 上一页出错:', error);
      }
    } else {
      console.log('❌ Rendition 未初始化');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (renditionRef.current) {
        renditionRef.current.off('selected', handleTextSelected);
      }
    };
  }, [handleTextSelected]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#111827' : '#ffffff' }}>
      <div style={{ 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
        zIndex: 1000
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: darkMode ? '#f9fafb' : '#111827' }}>
          EPUB 阅读器
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            划词创建：{enabled ? '开启' : '关闭'}
          </span>
          <button onClick={() => setEnabled(!enabled)} style={{ 
            padding: '0.5rem 1rem', 
            border: 'none', 
            borderRadius: '0.5rem', 
            backgroundColor: enabled ? '#10b981' : '#6b7280', 
            color: '#ffffff', 
            cursor: 'pointer' 
          }}>
            {enabled ? '关闭' : '开启'}
          </button>
          <button onClick={onClose} style={{ 
            padding: '0.5rem 1rem', 
            border: 'none', 
            borderRadius: '0.5rem', 
            backgroundColor: '#3b82f6', 
            color: '#ffffff', 
            cursor: 'pointer' 
          }}>
            关闭
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {url && (
          <ReactReader
            url={url}
            location={location}
            locationChanged={(epubcfi: string) => {
              console.log('📍 位置变化:', epubcfi);
              setLocation(epubcfi);
              setIsAtStart(false);
            }}
            showToc={true}
            getRendition={handleRendition}
          />
        )}
        {bookLoaded && (
          <>
            <button 
              onClick={handlePrevPage}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ‹
            </button>
            <button 
              onClick={handleNextPage}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              ›
            </button>
          </>
        )}
        {showSelectionBar && selectedText && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
            <HuaCiChuangJianDiLan
              selectedText={selectedText}
              onCancel={handleCancel}
              onCreate={handleCreateParagraph}
              creating={creating}
            />
          </div>
        )}
      </div>
    </div>
  );
}
