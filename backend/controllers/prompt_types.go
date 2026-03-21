// @审计已完成
// 提示词模板控制器 - 请求结构体定义
package controllers

type CreatePromptTemplateRequest struct {
	Name         string `json:"name" binding:"required"`
	QuestionType string `json:"question_type" binding:"required"`
	Content      string `json:"content" binding:"required"`
	IsDefault    bool   `json:"is_default"`
}

type UpdatePromptTemplateRequest struct {
	Name      string `json:"name" binding:"required"`
	Content   string `json:"content" binding:"required"`
	IsDefault bool   `json:"is_default"`
}
