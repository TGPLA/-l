// @审计已完成
// 数据模型 - 段落
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Paragraph struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	ChapterId     string    `gorm:"type:char(36);not null;index" json:"chapter_id"`
	UserId        string    `gorm:"type:char(36);not null;index" json:"user_id"`
	Content       string    `gorm:"type:text;not null" json:"content"`
	OrderIndex    int       `gorm:"default:0" json:"order_index"`
	QuestionCount int       `gorm:"default:0" json:"question_count"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Chapter       *Chapter  `gorm:"foreignKey:ChapterId" json:"chapter,omitempty"`
	Questions     []Question `gorm:"foreignKey:ParagraphId;constraint:OnDelete:CASCADE" json:"questions,omitempty"`
}

func (p *Paragraph) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}
