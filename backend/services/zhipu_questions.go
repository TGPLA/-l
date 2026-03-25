// @审计已完成
// 智谱AI服务 - 出题功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

func (s *ZhipuAIService) GenerateQuestions(content, questionType string, count int) (*GenerateQuestionsResult, error) {
	typePrompts := map[string]string{
		"名词解释": `请针对段落中的重要概念或术语出题。
题目格式：请解释"XXX"的含义
答案应包含：定义、特点、应用场景`,

		"意图理解": `请针对段落的核心思想或作者意图出题。
题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
答案应包含：核心观点、论证逻辑、深层含义`,

		"生活应用": `请将段落知识与实际生活场景结合出题。
题目格式：在生活中，如何应用XXX？/请举一个XXX的实际应用例子
答案应包含：应用场景、具体步骤、注意事项`,
	}

	typePrompt, ok := typePrompts[questionType]
	if !ok {
		typePrompt = typePrompts["名词解释"]
	}

	systemPrompt := `你是一个专业的教育出题专家，擅长基于给定文本内容生成高质量的主动回忆练习题。

重要原则：
1. 只根据用户提供的【章节文本】内容出题
2. 严禁使用任何文本之外的知识或信息
3. 题目必须严谨、准确、贴合文本
4. 所有答案必须能在文本中找到依据`

	userPrompt := fmt.Sprintf(`请根据以下提供的【章节文本】内容，生成 %d 个基于主动回忆原则的练习题。

题型要求：
%s

【章节文本】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。
格式：[{"question": "题目内容", "answer": "答案内容", "knowledge_point": "知识点"}]`, count, typePrompt, content)

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
