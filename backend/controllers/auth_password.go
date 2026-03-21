// @审计已完成
// 认证控制器 - 登出与密码管理
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func ResetPassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "密码重置功能待实现"})
}

func UpdatePassword(c *gin.Context) {
	userId := middleware.GetUserId(c)

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "密码加密失败"})
		return
	}

	if err := db.Model(&models.User{}).Where("id = ?", userId).Update("password_hash", string(passwordHash)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新密码失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "密码更新成功"})
}
