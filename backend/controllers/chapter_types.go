// @审计已完成
// 章节控制器 - 请求结构体定义
package controllers

type CreateChapterRequest struct {
	BookId     string `json:"book_id" binding:"required"`
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content" binding:"required"`
	OrderIndex int    `json:"order_index"`
}

type UpdateChapterRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
}

type UpdateChapterOrderRequest struct {
	OrderIndex int `json:"order_index" binding:"required"`
}
