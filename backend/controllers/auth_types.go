// @审计已完成
// 认证控制器 - 请求结构体定义
package controllers

type RegisterRequest struct {
	Username       string `json:"username" binding:"required,min=4,max=16"`
	Password       string `json:"password" binding:"required,min=6"`
	Nickname       string `json:"nickname"`
	RecoveryPhrase string `json:"recovery_phrase"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required,min=4,max=16"`
	Password string `json:"password" binding:"required,min=6"`
}

type UpdatePasswordRequest struct {
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

type ForgotPasswordRequest struct {
	Username       string `json:"username" binding:"required,min=4,max=16"`
	RecoveryPhrase string `json:"recovery_phrase" binding:"required"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

type SignOutRequest struct {
	// 不需要请求体，token 从 Authorization header 获取
}
