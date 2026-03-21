// @审计已完成
// 智谱AI服务 - 核心服务
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type ZhipuAIService struct {
	APIKey string
	Model  string
}

func NewZhipuAIService(apiKey, model string) *ZhipuAIService {
	return &ZhipuAIService{
		APIKey: apiKey,
		Model:  model,
	}
}

func (s *ZhipuAIService) callAPI(systemPrompt, userPrompt string, maxTokens int) (string, error) {
	requestBody := ZhipuRequest{
		Model: s.Model,
		Messages: []ZhipuMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		Temperature: 0.7,
		MaxTokens:   maxTokens,
	}

	jsonData, _ := json.Marshal(requestBody)
	req, err := http.NewRequest("POST", "https://open.bigmodel.cn/api/paas/v4/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("创建请求失败：%w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("网络请求失败：%w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var zhipuResp ZhipuResponse
	if err := json.Unmarshal(body, &zhipuResp); err != nil {
		return "", fmt.Errorf("解析响应失败：%w，原始响应：%s", err, string(body))
	}

	if zhipuResp.Error != nil {
		return "", translateErrorToChinese(zhipuResp.Error.Message)
	}

	if len(zhipuResp.Choices) == 0 {
		return "", translateErrorToChinese("API 返回空响应")
	}

	return zhipuResp.Choices[0].Message.Content, nil
}
