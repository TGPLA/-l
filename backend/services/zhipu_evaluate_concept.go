// @审计已完成
// 智谱AI服务 - 概念点评功能
package services

import (
	"encoding/json"
	"fmt"
	"log"
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
3. 使用温和、鼓励性的语言
4. 必须严格只输出纯 JSON 格式，evaluation 字段必须是一个纯文本字符串，不要使用嵌套对象！`

	userPrompt := fmt.Sprintf(`请评价学习者对以下概念的复述表达。

【概念】：%s
【专业解释】：%s
【学习者复述】：%s

请评价学习者的表达清晰度：
1. 学习者是否用自己的话表达（而非死记硬背）
2. 学习者是否抓住了概念的核心要点
3. 学习者的表达是否清晰易懂

重要：你必须严格只输出纯 JSON 格式！
- evaluation 字段必须是纯文本字符串！
- 不要使用嵌套对象！
- 不要包含任何其他文字或markdown标记！

格式示例：{"evaluation": "你用自己的话表达了晕轮效应的核心思想，表达很清晰！但可以更详细一些。"}`, concept, explanation, userAnswer)

	log.Printf("[DEBUG] EvaluateConcept called")
	log.Printf("[DEBUG] Concept: %s", concept)
	log.Printf("[DEBUG] Explanation: %s", explanation)
	log.Printf("[DEBUG] User Answer: %s", userAnswer)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 1500)
	if err != nil {
		log.Printf("[ERROR] callAPI failed: %v", err)
		return nil, err
	}

	log.Printf("[DEBUG] AI Raw Response: %s", responseContent)

	result := s.parseConceptEvaluation(responseContent)
	if result == nil {
		log.Printf("[ERROR] Failed to parse evaluation")
		return nil, fmt.Errorf("无法解析 AI 返回的评价，请重试")
	}

	log.Printf("[DEBUG] Parsed Result: %+v", result)

	return result, nil
}

func (s *ZhipuAIService) parseConceptEvaluation(content string) *ConceptEvaluationResult {
	log.Printf("[DEBUG] parseConceptEvaluation called with content: %s", content)
	
	// 第一步：清除 markdown 标记
	cleaned := strings.TrimSpace(content)
	log.Printf("[DEBUG] Step 1 - Trimmed content: %s", cleaned)
	
	cleaned = regexp.MustCompile("```json\\s*").ReplaceAllString(cleaned, "")
	log.Printf("[DEBUG] Step 2 - Removed ```json: %s", cleaned)
	
	cleaned = regexp.MustCompile("```\\s*").ReplaceAllString(cleaned, "")
	log.Printf("[DEBUG] Step 3 - Removed ```: %s", cleaned)

	// 第二步：尝试找到 JSON 对象
	match := regexp.MustCompile(`\{[\s\S]*\}`).FindString(cleaned)
	log.Printf("[DEBUG] Step 4 - Found JSON match: %s", match)
	
	if match != "" {
		var result ConceptEvaluationResult
		if err := json.Unmarshal([]byte(match), &result); err == nil {
			log.Printf("[DEBUG] Step 5 - JSON unmarshal success! Result: %+v", result)
			return &result
		} else {
			log.Printf("[DEBUG] Step 5 - JSON unmarshal failed: %v", err)
		}
	}

	// 第三步：尝试从非 JSON 格式中提取，假设整个内容就是评价
	log.Printf("[DEBUG] Step 6 - Falling back to raw content")
	if cleaned != "" {
		result := &ConceptEvaluationResult{
			Evaluation: cleaned,
		}
		log.Printf("[DEBUG] Step 7 - Returning fallback result: %+v", result)
		return result
	}

	log.Printf("[DEBUG] Step 8 - All attempts failed, returning nil")
	return nil
}
