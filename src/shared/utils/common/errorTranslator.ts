export const errorTranslationMap: Record<string, string> = {
  'Network request failed': '网络请求失败，请检查网络连接',
  'Failed to fetch': '网络连接失败，请检查网络设置',
  'Unauthorized': '未授权，API Key 可能无效或已过期',
  'Forbidden': '权限不足，请检查 API Key 配置',
  'Not Found': '资源不存在，请检查 API 地址',
  'Internal Server Error': '服务器内部错误，请稍后重试',
  'Bad Request': '请求参数错误，请检查输入内容',
  'Timeout': '请求超时，请稍后重试',
  'Rate Limit': '请求频率超限，请稍后再试',
  'Invalid API Key': 'API Key 无效，请检查配置',
  'insufficient_quota': 'API 配额不足，请充值或更换账号',
  'model_not_found': '模型不存在，请检查模型名称',
  'context_length_exceeded': '内容长度超出限制，请缩短文本',
  'content too long': '内容太长，请缩短后重试',
  'invalid model': '无效的模型，请检查模型配置',
};

export function translateError(errorMsg: string): string {
  const lowerError = errorMsg.toLowerCase();
  
  for (const [en, zh] of Object.entries(errorTranslationMap)) {
    if (lowerError.includes(en.toLowerCase())) {
      return zh;
    }
  }
  
  if (errorMsg.includes('JSON') || errorMsg.includes('parse')) {
    return 'AI 返回的数据格式异常，请重试';
  }
  
  if (errorMsg.includes('prompt') || errorMsg.includes('提示词')) {
    return '提示词格式错误，请检查自定义配置';
  }
  
  return errorMsg;
}
