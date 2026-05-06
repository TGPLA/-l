#!/bin/bash
# 临时后端部署脚本 - 阅读回响

set -e

echo "========================================"
echo "  开始部署后端..."
echo "========================================"
echo ""

# 1. 创建临时目录
TMP_DIR="/tmp/readrecall_backend_$(date +%s)"
mkdir -p $TMP_DIR
cd $TMP_DIR

echo "[1/5] 创建临时目录: $TMP_DIR"

# 2. 创建修改后的 auth_middleware.go
cat > middleware/auth_middleware.go << 'EOF'
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
)

type JWTClaims struct {
	UserId   string `json:"id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(userId, username string) (string, error) {
	claims := JWTClaims{
		UserId:   userId,
		Username: username,
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

		db := config.GetDB()
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
EOF

echo "[2/5] 创建修改后的认证中间件完成"

# 3. 创建完整的后端目录结构（复制其他必要文件）
# 先检查是否有现有后端代码
if [ -d "/opt/readrecall/backend" ]; then
    echo "[3/5] 找到现有后端代码，正在更新..."
    cp -f middleware/auth_middleware.go /opt/readrecall/backend/middleware/
    cd /opt/readrecall/backend
else
    echo "[3/5] 未找到现有后端代码，尝试从容器中获取..."
    # 如果没有，我们需要其他方式
    echo "警告：未找到现有后端代码目录"
    echo "请确保后端代码位于 /opt/readrecall/backend"
    exit 1
fi

# 4. 停止旧容器
echo "[4/5] 停止旧容器..."
docker stop readrecall-backend || true
docker rm readrecall-backend || true

# 5. 重新构建并启动
echo "[5/5] 重新构建并启动容器..."
docker build -t readrecall-backend:latest .
docker run -d --name readrecall-backend \
  --network readrecall-network \
  --network 1panel-network \
  -p 8080:8080 \
  -e SERVER_PORT=8080 \
  -e DB_HOST=1Panel-mysql-OHb5 \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=mysql_h8TCKC \
  -e DB_NAME=reading_reflection \
  -e JWT_SECRET=readrecall-jwt-secret-2024 \
  -e ZHIPU_API_KEY=dc9bf8defa2e47dd95a612fd16e9b3f0.hy4T83eTbaVcWKtY \
  -e ZHIPU_MODEL=glm-4-flash \
  -v /data/readrecall/uploads:/app/uploads \
  --restart unless-stopped \
  readrecall-backend:latest

echo ""
echo "========================================"
echo "  后端部署完成！"
echo "========================================"
echo ""
echo "等待容器启动..."
sleep 5

# 检查容器状态
if docker ps | grep -q readrecall-backend; then
    echo "✓ 容器运行正常"
    echo ""
    echo "现在可以访问 https://linyubo.top 测试功能了！"
else
    echo "✗ 容器启动失败，请检查日志："
    docker logs readrecall-backend
fi
