// @审计已完成
// 书籍控制器 - 请求结构体定义
package controllers

type CreateBookRequest struct {
	Title    string `json:"title" binding:"required"`
	Author   string `json:"author" binding:"required"`
	CoverUrl string `json:"cover_url"`
}

type UpdateBookRequest struct {
	Title    string `json:"title" binding:"required"`
	Author   string `json:"author" binding:"required"`
	CoverUrl string `json:"cover_url"`
}
