// @审计已完成
// 后端健康检查服务

const API_BASE = '/api';

export interface HealthStatus {
  isHealthy: boolean;
  isBackendAvailable: boolean;
  errorMessage?: string;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        isHealthy: true,
        isBackendAvailable: true,
      };
    } else if (response.status === 404) {
      return {
        isHealthy: false,
        isBackendAvailable: false,
        errorMessage: '后端健康检查端点不存在（404）',
      };
    } else {
      return {
        isHealthy: false,
        isBackendAvailable: true,
        errorMessage: `后端服务响应异常：${response.status}`,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isHealthy: false,
          isBackendAvailable: false,
          errorMessage: '后端服务响应超时（5 秒）',
        };
      }
      
      if (error.message.includes('Failed to fetch')) {
        return {
          isHealthy: false,
          isBackendAvailable: false,
          errorMessage: '无法连接到后端服务',
        };
      }
    }
    
    return {
      isHealthy: false,
      isBackendAvailable: false,
      errorMessage: error instanceof Error ? error.message : '未知错误',
    };
  }
}
