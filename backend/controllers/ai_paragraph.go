// @审计已完成
// AI控制器 - 段落出题
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"reading-reflection/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AIGenerateParagraphRequest struct {
	ParagraphId  string `json:"paragraph_id" binding:"required"`
	QuestionType string `json:"question_type" binding:"required"`
	Count        int    `json:"count"`
}

func AIGenerateQuestionsForParagraph(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req AIGenerateParagraphRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误"})
		return
	}

	if req.Count <= 0 {
		req.Count = 3
	}

	db := config.GetDB()

	var paragraph models.Paragraph
	result := db.Where("id = ? AND user_id = ?", req.ParagraphId, userId).First(&paragraph)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "段落不存在"})
		return
	}

	var chapter models.Chapter
	db.Where("id = ?", paragraph.ChapterId).First(&chapter)

	var userSettings models.Settings
	db.Where("user_id = ?", userId).First(&userSettings)

	if userSettings.ZhipuAPIKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "请先在设置页面配置智谱 AI API Key"})
		return
	}

	aiService := services.NewZhipuAIService(userSettings.ZhipuAPIKey, userSettings.ZhipuModel)
	generatedQuestions, err := aiService.GenerateQuestionsForParagraph(paragraph.Content, req.QuestionType, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 生成题目失败：" + err.Error()})
		return
	}

	var savedQuestions []models.Question
	for _, q := range generatedQuestions.Questions {
		newQuestion := models.Question{
			UserId:         userId,
			BookId:         chapter.BookId,
			ChapterId:      paragraph.ChapterId,
			ParagraphId:    &paragraph.ID,
			Question:       q.Question,
			QuestionType:   req.QuestionType,
			Answer:         q.Answer,
			Difficulty:     "中等",
			KnowledgePoint: q.KnowledgePoint,
			MasteryLevel:   "未掌握",
		}
		db.Create(&newQuestion)
		savedQuestions = append(savedQuestions, newQuestion)
	}

	db.Model(&paragraph).UpdateColumn("question_count", gorm.Expr("question_count + ?", len(savedQuestions)))
	db.Model(&chapter).UpdateColumn("question_count", gorm.Expr("question_count + ?", len(savedQuestions)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"questions": savedQuestions,
			"count":     len(savedQuestions),
		},
	})
}
