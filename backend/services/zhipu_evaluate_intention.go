// @审计已完成
// 智谱AI服务 - 意图理解点评功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

type IntentionEvaluationResult struct {
	Correct   string `json:"correct"`
	Incorrect string `json:"incorrect"`
	Incomplete string `json:"incomplete"`
}

func (s *ZhipuAIService) EvaluateIntention(paragraph, userAnswer string) (*IntentionEvaluationResult, error) {
	systemPrompt := `你是一位专业的阅读理解点评专家，擅长评价学习者对作者意图的理解程度。

重要原则：
1. 评价必须基于原文，不能添加原文之外的理解
2. 客观指出学习者说得对、不对、不到位的部分
3. 使用温和、鼓励性的语言`

	userPrompt := fmt.Sprintf(`请评价学习者对以下文本作者意图的理解。

【原文】：
%s

【学习者回答】：
%s

请分别评价：
1. 学习者说得对的地方（correct）
2. 学习者说得不对的地方（incorrect）
3. 学习者说得不够到位或不够深入的地方（incomplete）

请输出纯 JSON 格式，不要包含其他文字或解释。
格式：{"correct": "对的地方", "incorrect": "不对的地方", "incomplete": "不到位的地方"}`, paragraph, userAnswer)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 2000)
	if err != nil {
		return nil, err
	}

	result := s.parseIntentionEvaluation(responseContent)
	if result == nil {
		return nil, fmt.Errorf("无法解析 AI 返回的评价，请重试")
	}

	return result, nil
}

func (s *ZhipuAIService) parseIntentionEvaluation(content string) *IntentionEvaluationResult {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\{[\s\S]*\}`).FindString(content)
	if match == "" {
		return nil
	}

	var result IntentionEvaluationResult
	if err := json.Unmarshal([]byte(match), &result); err != nil {
		return nil
	}

	return &result
}
