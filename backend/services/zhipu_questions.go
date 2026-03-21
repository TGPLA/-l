// @审计已完成
// 智谱AI服务 - 出题功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

func (s *ZhipuAIService) GenerateQuestions(content, difficulty string, count int) (*GenerateQuestionsResult, error) {
	systemPrompt := `你是一个专业的教育出题专家，擅长基于给定文本内容生成高质量的主动回忆练习题。

重要原则：
1. 只根据用户提供的【章节文本】内容出题
2. 严禁使用任何文本之外的知识或信息
3. 题目必须严谨、准确、贴合文本
4. 所有答案必须能在提供的文本中找到依据
5. 不要编造或推断文本中没有明确说明的内容`

	userPrompt := fmt.Sprintf(`请根据以下提供的【章节文本】内容，生成 5 个基于主动回忆原则的练习题。

要求：
1. 问题必须严谨贴合文本，不要引入文本之外的信息
2. 题目类型应为简答题，促进用户主动思考和回忆
3. 每道题都要有详细的答案，答案必须来自文本内容
4. 涵盖文本中的核心概念和重要观点

【章节文本】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。`, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 4000)
	if err != nil {
		return nil, err
	}

	questions := s.parseQuestionsJSON(responseContent)
	if len(questions) == 0 {
		return nil, fmt.Errorf("无法解析 AI 返回的题目，请重试")
	}

	return &GenerateQuestionsResult{Questions: questions}, nil
}

func (s *ZhipuAIService) parseQuestionsJSON(content string) []QuestionData {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\[[\s\S]*\]`).FindString(content)
	if match == "" {
		return nil
	}

	var questions []QuestionData
	if err := json.Unmarshal([]byte(match), &questions); err != nil {
		return nil
	}

	return questions
}
