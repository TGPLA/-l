// 认证控制器 - 注册与登录
package controllers

import (
	"fmt"
	"log"
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var usernameRegex = regexp.MustCompile(`^[1-9][0-9]{3,15}$`)

const (
	maxLoginAttempts = 5
	lockoutDuration  = 15 * time.Minute
)

func isValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数格式错误"})
		return
	}

	if !isValidUsername(req.Username) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "用户名必须是4-16位数字，且首位不能为0"})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	var existingUser models.User
	result := db.Where("username = ?", req.Username).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "该用户名已被注册"})
		return
	}
	if result.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库查询失败"})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "密码加密失败"})
		return
	}

	nickname := req.Nickname
	if nickname == "" {
		nickname = "用户" + req.Username
	}

	recoveryPhrase := req.RecoveryPhrase
	if recoveryPhrase != "" {
		recoveryHash, err := bcrypt.GenerateFromPassword([]byte(recoveryPhrase), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "恢复短语加密失败"})
			return
		}
		recoveryPhrase = string(recoveryHash)
	}

	newUser := models.User{
		Username:       req.Username,
		PasswordHash:   string(passwordHash),
		Nickname:       nickname,
		RecoveryPhrase: recoveryPhrase,
	}

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建用户失败"})
		return
	}

	userSettings := models.Settings{UserId: newUser.ID, ZhipuModel: "glm-4-flash"}
	db.Create(&userSettings)

	token, err := middleware.GenerateToken(newUser.ID, newUser.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "生成 Token 失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user":  gin.H{"id": newUser.ID, "username": newUser.Username, "nickname": newUser.Nickname},
			"token": token,
		},
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数格式错误"})
		return
	}

	if !isValidUsername(req.Username) {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "用户名或密码错误"})
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
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "用户名或密码错误"})
		} else {
			log.Printf("数据库查询失败")
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error": "数据库查询失败",
			})
		}
		return
	}

	// 检查账户是否被锁定
	if user.LockedUntil != nil && time.Now().Before(*user.LockedUntil) {
		remaining := user.LockedUntil.Sub(time.Now())
		minutes := int(remaining.Minutes()) + 1
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"error":   fmt.Sprintf("账户已被锁定，请在 %d 分钟后重试", minutes),
		})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		// 增加登录失败计数
		user.LoginAttempts++
		updates := map[string]interface{}{"login_attempts": user.LoginAttempts}
		if user.LoginAttempts >= maxLoginAttempts {
			lockedUntil := time.Now().Add(lockoutDuration)
			user.LockedUntil = &lockedUntil
			updates["locked_until"] = lockedUntil
		}
		db.Model(&user).Updates(updates)
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "用户名或密码错误"})
		return
	}

	// 登录成功，重置失败计数
	if user.LoginAttempts > 0 || user.LockedUntil != nil {
		db.Model(&user).Updates(map[string]interface{}{
			"login_attempts": 0,
			"locked_until":   nil,
		})
	}

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "生成 Token 失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user":  gin.H{"id": user.ID, "username": user.Username, "nickname": user.Nickname},
			"token": token,
		},
	})
}
