// @审计已完成
// 智谱AI服务 - 错误翻译
package services

import (
	"fmt"
	"strings"
)

func translateErrorToChinese(errMsg string) error {
	if errMsg == "" {
		return nil
	}

	errorTranslations := map[string]string{
		"timeout":                 "网络超时，请检查网络连接后重试",
		"deadline exceeded":       "请求超时，请稍后重试",
		"connection refused":      "连接被拒绝，请检查网络设置",
		"connection reset by peer": "连接已断开，请重试",
		"no such host":            "无法连接到服务器，请检查网络",
		"tls handshake timeout":   "安全连接超时，请重试",
		"content too long":        "内容过长，请精简章节文本后重试",
		"too many tokens":         "文本内容过长，请减少文本长度",
		"rate limit exceeded":     "请求过于频繁，请稍候再试",
		"quota exceeded":          "API 配额已用完，请检查您的账户",
		"invalid api key":         "API 密钥无效，请检查设置",
		"unauthorized":            "未授权，请检查 API 密钥",
		"internal server error":   "服务器内部错误，请稍后重试",
		"service unavailable":     "服务暂时不可用，请稍后重试",
		"bad gateway":             "网关错误，请稍后重试",
		"API 错误":               "AI 服务返回错误，请稍后重试",
		"API 返回空响应":         "AI 服务未返回内容，请重试",
	}

	for keyword, translation := range errorTranslations {
		if containsIgnoreCase(errMsg, keyword) {
			return fmt.Errorf(translation)
		}
	}

	return fmt.Errorf("发生错误：%s，请稍后重试", errMsg)
}

func containsIgnoreCase(s, substr string) bool {
	if len(s) < len(substr) {
		return false
	}
	if len(substr) == 0 {
		return true
	}
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}
