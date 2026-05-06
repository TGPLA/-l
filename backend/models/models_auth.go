package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TokenBlacklist 存储已失效的 JWT token，实现登出功能
type TokenBlacklist struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	JTI       string    `gorm:"type:char(36);uniqueIndex;not null" json:"jti"`
	ExpiresAt time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (t *TokenBlacklist) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

// PasswordResetToken 存储密码重置验证码
type PasswordResetToken struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId    string    `gorm:"type:char(36);index;not null" json:"user_id"`
	Token     string    `gorm:"type:varchar(64);uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (t *PasswordResetToken) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}
