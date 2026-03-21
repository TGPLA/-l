// @审计已完成
// 统一错误类型定义

export type CuoWuDengJi = 'network' | 'auth' | 'business' | 'system' | 'unknown';

export interface CuoWuXinXi {
  dengJi: CuoWuDengJi;
  daiMa?: string;
  xiaoXi: string;
  yuanShiCuoWu?: unknown;
}

export class YingYongCuoWu extends Error {
  public readonly dengJi: CuoWuDengJi;
  public readonly daiMa?: string;
  public readonly yuanShiCuoWu?: unknown;

  constructor(xinXi: CuoWuXinXi) {
    super(xinXi.xiaoXi);
    this.name = 'YingYongCuoWu';
    this.dengJi = xinXi.dengJi;
    this.daiMa = xinXi.daiMa;
    this.yuanShiCuoWu = xinXi.yuanShiCuoWu;
  }

  static wangLuo(xiaoXi: string, yuanShi?: unknown): YingYongCuoWu {
    return new YingYongCuoWu({ dengJi: 'network', xiaoXi, yuanShiCuoWu: yuanShi });
  }

  static renZheng(xiaoXi: string, daiMa?: string): YingYongCuoWu {
    return new YingYongCuoWu({ dengJi: 'auth', xiaoXi, daiMa });
  }

  static yeWu(xiaoXi: string, daiMa?: string): YingYongCuoWu {
    return new YingYongCuoWu({ dengJi: 'business', xiaoXi, daiMa });
  }

  static xiTong(xiaoXi: string, yuanShi?: unknown): YingYongCuoWu {
    return new YingYongCuoWu({ dengJi: 'system', xiaoXi, yuanShiCuoWu: yuanShi });
  }
}

export function shiBieCuoWu(cuoWu: unknown): CuoWuXinXi {
  if (cuoWu instanceof YingYongCuoWu) {
    return {
      dengJi: cuoWu.dengJi,
      daiMa: cuoWu.daiMa,
      xiaoXi: cuoWu.message,
      yuanShiCuoWu: cuoWu.yuanShiCuoWu,
    };
  }

  if (cuoWu instanceof Error) {
    const xiaoXi = cuoWu.message.toLowerCase();
    
    if (xiaoXi.includes('network') || xiaoXi.includes('fetch') || xiaoXi.includes('timeout')) {
      return { dengJi: 'network', xiaoXi: '网络连接失败，请检查网络设置', yuanShiCuoWu: cuoWu };
    }
    
    if (xiaoXi.includes('unauthorized') || xiaoXi.includes('forbidden') || xiaoXi.includes('token')) {
      return { dengJi: 'auth', xiaoXi: '登录已过期，请重新登录', yuanShiCuoWu: cuoWu };
    }

    return { dengJi: 'unknown', xiaoXi: cuoWu.message, yuanShiCuoWu: cuoWu };
  }

  if (typeof cuoWu === 'string') {
    return { dengJi: 'unknown', xiaoXi: cuoWu };
  }

  return { dengJi: 'unknown', xiaoXi: '发生未知错误' };
}
