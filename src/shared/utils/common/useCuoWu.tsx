// @审计已完成
// 错误处理 Hook - 统一的错误处理逻辑

import { useState, useCallback } from 'react';
import { shiBieCuoWu, type CuoWuXinXi } from './CuoWuDingYi';
import { showError } from './ToastTiShi';

export interface UseCuoWuFanHui {
  cuoWu: CuoWuXinXi | null;
  jiaZai: boolean;
  chuLiCuoWu: (cuoWu: unknown) => void;
  qingChuCuoWu: () => void;
  zhiXing: <T>(caoZuo: () => Promise<T>) => Promise<T | null>;
}

export function useCuoWu(): UseCuoWuFanHui {
  const [cuoWu, setCuoWu] = useState<CuoWuXinXi | null>(null);
  const [jiaZai, setJiaZai] = useState(false);

  const chuLiCuoWu = useCallback((error: unknown) => {
    const cuoWuXinXi = shiBieCuoWu(error);
    setCuoWu(cuoWuXinXi);
    showError(cuoWuXinXi.xiaoXi);
  }, []);

  const qingChuCuoWu = useCallback(() => {
    setCuoWu(null);
  }, []);

  const zhiXing = useCallback(async <T,>(caoZuo: () => Promise<T>): Promise<T | null> => {
    setJiaZai(true);
    setCuoWu(null);

    try {
      const result = await caoZuo();
      return result;
    } catch (error) {
      chuLiCuoWu(error);
      return null;
    } finally {
      setJiaZai(false);
    }
  }, [chuLiCuoWu]);

  return { cuoWu, jiaZai, chuLiCuoWu, qingChuCuoWu, zhiXing };
}
