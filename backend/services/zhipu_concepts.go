// @审计已完成
// 智谱AI服务 - 概念提取功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

type ConceptData struct {
	Concept     string `json:"concept"`
	Explanation string `json:"explanation"`
}

type ExtractConceptsResult struct {
	Concepts []ConceptData `json:"concepts"`
}

func (s *ZhipuAIService) ExtractConcepts(content string) (*ExtractConceptsResult, error) {
	systemPrompt := `你是一个专业的教育专家，擅长从文本中提取重要概念和术语。

重要原则：
1. 只提取用户提供的【文本】中的重要概念和术语
2. 严谨、准确，不引入文本之外的知识
3. 每个概念的解释要清晰、简洁`

	userPrompt := fmt.Sprintf(`请从以下【文本】中提取所有重要概念和术语，并为每个概念提供专业解释。

要求：
1. 概念应该是文本中的核心知识点、关键术语或重要定义
2. 解释应该来自文本内容，准确反映原文中该概念的含义
3. 输出所有发现的概念，不要遗漏

【文本】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。
格式：[{"concept": "概念名称", "explanation": "专业解释"}]`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 4000)
	if err != nil {
		return nil, err
	}

	concepts := s.parseConceptsJSON(responseContent)
	if len(concepts) == 0 {
		return nil, fmt.Errorf("无法解析 AI 返回的概念，请重试")
	}

	return &ExtractConceptsResult{Concepts: concepts}, nil
}

func (s *ZhipuAIService) parseConceptsJSON(content string) []ConceptData {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\[[\s\S]*\]`).FindString(content)
	if match == "" {
		return nil
	}

	var concepts []ConceptData
	if err := json.Unmarshal([]byte(match), &concepts); err != nil {
		return nil
	}

	return concepts
}
