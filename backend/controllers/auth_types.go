// @审计已完成
// 认证控制器 - 请求结构体定义
package controllers

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=4,max=16"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdatePasswordRequest struct {
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}
