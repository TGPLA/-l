// @审计已完成
// 智谱AI服务 - 概念点评功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

type ConceptEvaluationResult struct {
	Evaluation string `json:"evaluation"`
}

func (s *ZhipuAIService) EvaluateConcept(concept, explanation, userAnswer string) (*ConceptEvaluationResult, error) {
	systemPrompt := `你是一位专业的教育点评专家，擅长评价学习者对概念的理解和表达能力。

重要原则：
1. 评价聚焦于"表达清晰度"，即用户是否能用自己的话清晰准确地解释概念
2. 指出用户表达中的优点和不足
3. 使用温和、鼓励性的语言`

	userPrompt := fmt.Sprintf(`请评价学习者对以下概念的复述表达。

【概念】：%s
【专业解释】：%s
【学习者复述】：%s

请评价学习者的表达清晰度：
1. 学习者是否用自己的话表达（而非死记硬背）
2. 学习者是否抓住了概念的核心要点
3. 学习者的表达是否清晰易懂

请输出纯 JSON 格式，不要包含其他文字或解释。
格式：{"evaluation": "评价内容"}`, concept, explanation, userAnswer)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 1500)
	if err != nil {
		return nil, err
	}

	result := s.parseConceptEvaluation(responseContent)
	if result == nil {
		return nil, fmt.Errorf("无法解析 AI 返回的评价，请重试")
	}

	return result, nil
}

func (s *ZhipuAIService) parseConceptEvaluation(content string) *ConceptEvaluationResult {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\{[\s\S]*\}`).FindString(content)
	if match == "" {
		return nil
	}

	var result ConceptEvaluationResult
	if err := json.Unmarshal([]byte(match), &result); err != nil {
		return nil
	}

	return &result
}
