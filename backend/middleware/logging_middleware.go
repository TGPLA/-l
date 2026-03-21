package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

func 请求日志中间件() gin.HandlerFunc {
	return func(c *gin.Context) {
		开始时间 := time.Now()
		c.Next()
		耗时 := time.Since(开始时间)
		状态码 := c.Writer.Status()
		方法 := c.Request.Method
		路径 := c.Request.URL.Path
		
		gin.DefaultWriter.Write([]byte(
			"[" + time.Now().Format("2006-01-02 15:04:05") + "] " +
			方法 + " " + 路径 + " " +
			string(rune(状态码)) + " " +
			耗时.String() + "\n",
		))
	}
}
