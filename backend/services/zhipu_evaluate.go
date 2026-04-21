// @审计已完成
// 智谱AI服务 - 评价功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

func (s *ZhipuAIService) EvaluateAnswer(content, question, userAnswer string) (*EvaluateAnswerResult, error) {
	systemPrompt := `你是一位专业的教育评估专家，擅长评价学生对文本内容的理解程度。

## 核心任务
* 评价重点：用户是否真正领会了作者的意图
* 表达评估：用户是否能用自己的话（非死记硬背）清晰地表达出来
* 知识翻译：将专业概念转化为通俗易懂的语言

输出格式必须是纯 JSON 对象，不要有任何其他文字、解释或标记。`

	userPrompt := fmt.Sprintf(`请评估以下答案：

文本片段：
%s

题目：%s
学生答案：%s

请按照要求的 JSON 格式输出评价和补充说明。`, content, question, userAnswer)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 2000)
	if err != nil {
		return nil, err
	}

	result := s.parseEvaluationJSON(responseContent)
	if result == nil {
		return nil, fmt.Errorf("无法解析 AI 返回的评价")
	}

	return result, nil
}

func (s *ZhipuAIService) parseEvaluationJSON(content string) *EvaluateAnswerResult {
	cleaned := strings.TrimSpace(content)
	cleaned = regexp.MustCompile("```json\\s*").ReplaceAllString(cleaned, "")
	cleaned = regexp.MustCompile("```\\s*").ReplaceAllString(cleaned, "")

	match := regexp.MustCompile(`\{[\s\S]*\}`).FindString(cleaned)
	if match != "" {
		var result EvaluateAnswerResult
		if err := json.Unmarshal([]byte(match), &result); err == nil {
			return &result
		}
	}

	// 容错处理：如果解析 JSON 失败，就把所有内容都放到 evaluation 字段
	return &EvaluateAnswerResult{
		Evaluation: cleaned,
		Supplement: "",
	}
}
