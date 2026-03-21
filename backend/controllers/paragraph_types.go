// @审计已完成
// 段落控制器 - 请求结构体定义
package controllers

type CreateParagraphRequest struct {
	ChapterId  string `json:"chapter_id" binding:"required"`
	Content    string `json:"content" binding:"required"`
	OrderIndex int    `json:"order_index"`
}

type UpdateParagraphRequest struct {
	Content string `json:"content" binding:"required"`
}

type BatchCreateParagraphsRequest struct {
	ChapterId  string   `json:"chapter_id" binding:"required"`
	Contents   []string `json:"contents" binding:"required"`
}
