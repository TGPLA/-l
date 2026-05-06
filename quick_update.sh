#!/bin/bash
# 快速更新后端认证中间件

set -e

echo "========================================"
echo "  更新后端认证中间件"
echo "========================================"
echo ""

# 1. 在服务器上查找后端代码位置
echo "[1/4] 查找后端代码位置..."
BACKEND_DIR=""

for dir in "/opt/readrecall/backend" "/root/readrecall/backend" "/opt/1panel/apps/readrecall/backend"; do
    if [ -d "$dir" ] && [ -f "$dir/middleware/auth_middleware.go" ]; then
        BACKEND_DIR="$dir"
        break
    fi
done

if [ -z "$BACKEND_DIR" ]; then
    echo "未找到后端代码目录，正在搜索..."
    BACKEND_DIR=$(find / -name "auth_middleware.go" -type f 2>/dev/null | head -1 | xargs dirname 2>/dev/null | xargs dirname 2>/dev/null)
fi

if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
    echo "错误：未找到后端代码目录"
    exit 1
fi

echo "找到后端目录: $BACKEND_DIR"
cd "$BACKEND_DIR"

# 2. 更新 auth_middleware.go
echo "[2/4] 更新认证中间件..."
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

echo "认证中间件已更新"

# 3. 停止并删除旧容器
echo "[3/4] 重新部署后端容器..."
docker stop readrecall-backend 2>/dev/null || true
docker rm readrecall-backend 2>/dev/null || true

# 4. 重新构建并启动
echo "[4/4] 构建并启动新容器..."
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
echo "  更新完成！"
echo "========================================"
echo ""
echo "等待容器启动..."
sleep 5

if docker ps --format '{{.Names}}' | grep -q readrecall-backend; then
    echo "✓ 后端容器运行正常"
    echo ""
    echo "全部部署完成！现在可以访问 https://linyubo.top 测试功能。"
else
    echo "✗ 容器启动可能有问题，请检查日志："
    docker logs readrecall-backend --tail 50
fi
