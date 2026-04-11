// @审计已完成
// AI控制器 - 请求结构体定义
package controllers

type AIGenerateRequest struct {
	ChapterId   string `json:"chapter_id" binding:"required"`
	QuestionType string `json:"question_type" binding:"required"`
	Count       int    `json:"count" binding:"required,min=1,max=10"`
}

type AIEvaluateRequest struct {
	QuestionId string `json:"question_id" binding:"required"`
	UserAnswer string `json:"user_answer" binding:"required"`
}

type AIGenerateSelectionRequest struct {
	BookId       string `json:"book_id"`
	ChapterId    string `json:"chapter_id"`
	SelectedText string `json:"selected_text" binding:"required"`
	QuestionType  string `json:"question_type" binding:"required"`
	Count         int    `json:"count"`
	AnnotationId  string `json:"annotation_id"`
}

type AIGenerateSelectionAutoRequest struct {
	BookId       string `json:"book_id"`
	ChapterId    string `json:"chapter_id"`
	SelectedText string `json:"selected_text" binding:"required"`
	Count         int    `json:"count"`
	AnnotationId  string `json:"annotation_id"`
}

type AIAnalyzeTextRequest struct {
	Content string `json:"content" binding:"required"`
}

type AIExplainConceptRequest struct {
	Content string `json:"content" binding:"required"`
}

type AIParaphraseTextRequest struct {
	Content string `json:"content" binding:"required"`
}
