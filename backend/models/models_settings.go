// @审计已完成
// 数据模型 - 设置与练习记录
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Settings struct {
	ID                    string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserId                string    `gorm:"type:char(36);uniqueIndex;not null" json:"user_id"`
	DarkMode              bool      `gorm:"default:false" json:"dark_mode"`
	ZhipuAPIKey           string    `gorm:"type:varchar(255)" json:"zhipu_api_key"`
	ZhipuModel            string    `gorm:"type:varchar(100);default:'glm-4-flash'" json:"zhipu_model"`
	DifyAPIKey            string    `gorm:"type:varchar(255)" json:"dify_api_key"`
	QuestionWorkflowUrl   string    `gorm:"type:varchar(512)" json:"question_workflow_url"`
	CorrectionWorkflowUrl string    `gorm:"type:varchar(512)" json:"correction_workflow_url"`
	CreatedAt             time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (s *Settings) TableName() string {
	return "user_settings"
}

func (s *Settings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}

type PracticeRecord struct {
	ID           string     `gorm:"type:char(36);primaryKey" json:"id"`
	UserId       string     `gorm:"type:char(36);not null;index" json:"user_id"`
	QuestionId   string     `gorm:"type:char(36);not null;index" json:"question_id"`
	UserAnswer   string     `gorm:"type:text" json:"user_answer"`
	IsCorrect    *bool      `gorm:"type:tinyint(1)" json:"is_correct"`
	AIEvaluation string     `gorm:"type:text" json:"ai_evaluation"`
	PracticeAt   time.Time  `gorm:"autoCreateTime" json:"practice_at"`
	Question     *Question  `gorm:"foreignKey:QuestionId" json:"question,omitempty"`
}

func (r *PracticeRecord) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}
