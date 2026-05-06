// IP 频率限制中间件
package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateEntry struct {
	count    int
	resetAt  time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	entries  map[string]*rateEntry
	maxReqs  int
	window   time.Duration
}

func NewRateLimiter(maxReqs int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		entries: make(map[string]*rateEntry),
		maxReqs: maxReqs,
		window:  window,
	}
	// 定期清理过期条目
	go func() {
		for {
			time.Sleep(window)
			rl.cleanup()
		}
	}()
	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	for ip, entry := range rl.entries {
		if now.After(entry.resetAt) {
			delete(rl.entries, ip)
		}
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		rl.mu.Lock()
		entry, exists := rl.entries[ip]
		now := time.Now()

		if !exists || now.After(entry.resetAt) {
			rl.entries[ip] = &rateEntry{count: 1, resetAt: now.Add(rl.window)}
			rl.mu.Unlock()
			c.Next()
			return
		}

		entry.count++
		if entry.count > rl.maxReqs {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "请求过于频繁，请稍后重试",
			})
			c.Abort()
			return
		}
		rl.mu.Unlock()
		c.Next()
	}
}

// AuthRateLimiter 专门用于认证接口的频率限制（更严格）
var AuthRateLimiter = NewRateLimiter(20, 1*time.Minute) // 每分钟最多20次请求

// StrictRateLimiter 用于密码重置等敏感操作（更严格）
var StrictRateLimiter = NewRateLimiter(5, 1*time.Minute) // 每分钟最多5次请求
