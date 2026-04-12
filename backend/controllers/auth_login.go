// @审计已完成
// 认证控制器 - 注册与登录
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"regexp"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var usernameRegex = regexp.MustCompile(`^[1-9][0-9]{3,15}$`)

func isValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
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

	newUser := models.User{
		Username:     req.Username,
		PasswordHash: string(passwordHash),
		Nickname:     nickname,
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
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
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
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库查询失败"})
		}
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "用户名或密码错误"})
		return
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

func init() {
	_ = strconv.Itoa(0)
}
