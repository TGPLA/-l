// @审计已完成
// 阅读进度 Hook - 持久化阅读位置

import useLocalStorageState from 'use-local-storage-state';

interface YueDuJinDuProps {
  userId: string;
  bookId: string;
}

export function useYueDuJinDu({ userId, bookId }: YueDuJinDuProps) {
  const storageKey = `yuedu_jindu_${userId}_${bookId}`;
  
  const [location, setLocation] = useLocalStorageState<string | number>(
    storageKey,
    { defaultValue: 0 }
  );

  return {
    location,
    setLocation,
  };
}
