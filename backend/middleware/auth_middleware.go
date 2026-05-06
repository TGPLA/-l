// @审计已完成
// 认证中间件 - JWT Token 验证
package middleware

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/models"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTClaims struct {
	UserId   string `json:"id"`
	Username string `json:"username"`
	JTI      string `json:"jti"`
	jwt.RegisteredClaims
}

func GenerateToken(userId, username string) (string, error) {
	claims := JWTClaims{
		UserId:   userId,
		Username: username,
		JTI:      uuid.New().String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.GetJWTSecret()))
}

func parseToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.GetJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string
		
		// 先尝试从 Authorization header 获取
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}
		
		// 如果 header 中没有，尝试从 URL 参数获取
		if tokenString == "" {
			tokenString = c.Query("token")
		}
		
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "未授权：缺少认证信息",
			})
			c.Abort()
			return
		}

		claims, err := parseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "未授权：Token 无效或已过期",
			})
			c.Abort()
			return
		}

		// 检查 token 是否已被加入黑名单（登出后失效）
		db := config.GetDB()
		var blacklisted models.TokenBlacklist
		if err := db.Where("jti = ?", claims.JTI).First(&blacklisted).Error; err == nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "未授权：Token 已失效",
			})
			c.Abort()
			return
		}

		var user models.User
		result := db.Select("id").First(&user, "id = ?", claims.UserId)
		if result.Error != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "未授权：用户不存在或已被删除",
			})
			c.Abort()
			return
		}

		c.Set("userId", claims.UserId)
		c.Set("username", claims.Username)
		c.Set("jti", claims.JTI)
		c.Next()
	}
}

func GetUserId(c *gin.Context) string {
	userId, exists := c.Get("userId")
	if !exists {
		return ""
	}
	return userId.(string)
}

func GetJTI(c *gin.Context) string {
	jti, exists := c.Get("jti")
	if !exists {
		return ""
	}
	return jti.(string)
}
