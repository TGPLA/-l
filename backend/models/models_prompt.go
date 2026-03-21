// @审计已完成
// 数据模型 - 提示词模板
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PromptTemplate struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId       *string   `gorm:"type:char(36);index" json:"user_id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	QuestionType string    `gorm:"type:varchar(50);not null;index" json:"question_type"`
	Content      string    `gorm:"type:text;not null" json:"content"`
	IsDefault    bool      `gorm:"default:false" json:"is_default"`
	IsSystem     bool      `gorm:"default:false" json:"is_system"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	User         *User     `gorm:"foreignKey:UserId" json:"user,omitempty"`
}

func (t *PromptTemplate) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}
