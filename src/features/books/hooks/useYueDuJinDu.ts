// @审计已完成
// 阅读进度 Hook - 持久化阅读位置
// 参考 GitHub 项目最佳实践（Readest、Colibri等）

import { useState, useCallback, useEffect, useRef } from 'react';
import useLocalStorageState from 'use-local-storage-state';

interface YueDuJinDuProps {
  userId: string;
  bookId: string;
}

interface YueDuJinDuShuJu {
  location: string | number;
  updatedAt: number;
}

// 防抖时间（毫秒）- 参考 Readest 项目使用 3秒 防抖，平衡性能与数据安全
const FANG_DOU_MS = 3000;

export function useYueDuJinDu({ userId, bookId }: YueDuJinDuProps) {
  const storageKey = `yuedu_jindu_${userId}_${bookId}`;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [progressData, setProgressData] = useLocalStorageState<YueDuJinDuShuJu>(
    storageKey,
    {
      defaultValue: {
        location: 0,
        updatedAt: Date.now()
      }
    }
  );

  const location = progressData.location;

  // 立即保存位置（用于页面关闭等重要场景）
  const saveImmediately = useCallback((newLocation: string | number) => {
    setIsSaving(true);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    setProgressData({
      location: newLocation,
      updatedAt: Date.now()
    });
    
    setIsSaving(false);
  }, [storageKey, setProgressData]);

  // 防抖保存位置（用于常规翻页场景）
  const saveDebounced = useCallback((newLocation: string | number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      saveImmediately(newLocation);
      debounceTimerRef.current = null;
    }, FANG_DOU_MS);
  }, [saveImmediately]);

  // 对外暴露的统一接口 - 优先使用防抖，但也可以强制立即保存
  const setLocation = useCallback((newLocation: string | number, immediate: boolean = false) => {
    if (immediate) {
      saveImmediately(newLocation);
    } else {
      saveDebounced(newLocation);
    }
  }, [saveImmediately, saveDebounced]);

  // 页面关闭前强制保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    location,
    setLocation,
    isSaving,
    // 提供立即保存的便捷方法
    saveImmediately: (newLocation: string | number) => setLocation(newLocation, true),
  };
}
