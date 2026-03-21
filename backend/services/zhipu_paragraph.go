// @审计已完成
// 智谱AI服务 - 段落出题功能
package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

type ParagraphQuestionData struct {
	Question       string `json:"question"`
	Answer         string `json:"answer"`
	KnowledgePoint string `json:"knowledge_point"`
}

type GenerateParagraphQuestionsResult struct {
	Questions []ParagraphQuestionData `json:"questions"`
}

func (s *ZhipuAIService) GenerateQuestionsForParagraph(content, questionType string, count int) (*GenerateParagraphQuestionsResult, error) {
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

	systemPrompt := `你是一个专业的教育出题专家，擅长基于给定段落内容生成高质量的练习题。

重要原则：
1. 只根据用户提供的【段落内容】出题
2. 严禁使用任何段落之外的知识或信息
3. 题目必须严谨、准确、贴合段落内容
4. 所有答案必须能在段落中找到依据`

	userPrompt := fmt.Sprintf(`请根据以下【段落内容】，生成 %d 道题目。

题型要求：
%s

【段落内容】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。
格式：[{"question": "题目内容", "answer": "答案内容", "knowledge_point": "知识点"}]`, count, typePrompt, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 4000)
	if err != nil {
		return nil, err
	}

	questions := s.parseParagraphQuestionsJSON(responseContent)
	if len(questions) == 0 {
		return nil, fmt.Errorf("无法解析 AI 返回的题目")
	}

	return &GenerateParagraphQuestionsResult{Questions: questions}, nil
}

func (s *ZhipuAIService) parseParagraphQuestionsJSON(content string) []ParagraphQuestionData {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\[[\s\S]*\]`).FindString(content)
	if match == "" {
		return nil
	}

	var questions []ParagraphQuestionData
	if err := json.Unmarshal([]byte(match), &questions); err != nil {
		return nil
	}

	return questions
}
