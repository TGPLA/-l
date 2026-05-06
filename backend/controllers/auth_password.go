// 认证控制器 - 登出与密码管理
package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Logout(c *gin.Context) {
	jti := middleware.GetJTI(c)
	if jti == "" {
		// 没有 JTI 说明没走 AuthMiddleware，可能是无 token 的登出请求
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "已登出"})
		return
	}

	// 将 token JTI 加入黑名单
	// 过期时间取 token 原始过期时间（最多7天）
	db := config.GetDB()
	blacklist := models.TokenBlacklist{
		JTI:       jti,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if err := db.Create(&blacklist).Error; err != nil {
		log.Printf("token 黑名单记录失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "登出失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "已登出"})
}

func ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数格式错误"})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	var user models.User
	result := db.Where("username = ?", req.Username).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "用户名不存在"})
		return
	}

	// 验证恢复短语
	if user.RecoveryPhrase == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "该账户未设置恢复短语，无法重置密码。请联系管理员",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.RecoveryPhrase), []byte(req.RecoveryPhrase)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "恢复短语不正确"})
		return
	}

	// 清理旧的未使用 token
	db.Where("user_id = ? AND used = ? AND expires_at < ?", user.ID, false, time.Now()).Delete(&models.PasswordResetToken{})

	// 检查是否已有有效的重置 token（防止重复生成）
	var existingToken models.PasswordResetToken
	if err := db.Where("user_id = ? AND used = ? AND expires_at > ?", user.ID, false, time.Now()).First(&existingToken).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"reset_token": existingToken.Token,
				"expires_in":  int(time.Until(existingToken.ExpiresAt).Seconds()),
			},
			"message": "已存在有效的重置码，请使用该码重置密码",
		})
		return
	}

	// 生成新的重置 token
	tokenBytes := make([]byte, 16)
	rand.Read(tokenBytes)
	resetToken := hex.EncodeToString(tokenBytes)

	resetRecord := models.PasswordResetToken{
		UserId:    user.ID,
		Token:     resetToken,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}
	if err := db.Create(&resetRecord).Error; err != nil {
		log.Printf("创建密码重置 token 失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "生成重置码失败，请重试"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"reset_token": resetToken,
			"expires_in":  900,
		},
		"message": "重置码已生成，请在15分钟内使用",
	})
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数格式错误"})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	var resetRecord models.PasswordResetToken
	if err := db.Where("token = ? AND used = ?", req.Token, false).First(&resetRecord).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "重置码无效或已被使用"})
		return
	}

	if time.Now().After(resetRecord.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "重置码已过期，请重新获取"})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "密码加密失败"})
		return
	}

	tx := db.Begin()

	// 标记重置 token 为已使用
	if err := tx.Model(&resetRecord).Update("used", true).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "重置失败"})
		return
	}

	// 更新密码，同时清除锁定状态
	if err := tx.Model(&models.User{}).Where("id = ?", resetRecord.UserId).Updates(map[string]interface{}{
		"password_hash":  string(passwordHash),
		"login_attempts": 0,
		"locked_until":   nil,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "重置密码失败"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "密码重置成功，请重新登录"})
}

func UpdatePassword(c *gin.Context) {
	userId := middleware.GetUserId(c)

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数格式错误"})
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

	// 使当前 token 失效
	jti := middleware.GetJTI(c)
	if jti != "" {
		db.Create(&models.TokenBlacklist{
			JTI:       jti,
			ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
		})
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "密码更新成功，请重新登录"})
}

// 定期清理过期的黑名单记录
func CleanExpiredBlacklist() {
	db := config.GetDB()
	if db == nil {
		return
	}
	result := db.Where("expires_at < ?", time.Now()).Delete(&models.TokenBlacklist{})
	if result.Error != nil {
		log.Printf("清理过期黑名单失败: %v", result.Error)
	}
}

func init() {
	// 每30分钟清理一次过期黑名单
	go func() {
		for {
			time.Sleep(30 * time.Minute)
			CleanExpiredBlacklist()
		}
	}()
}
