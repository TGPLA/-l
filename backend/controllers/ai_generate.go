// @审计已完成
// AI控制器 - 生成题目
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

func AIGenerateQuestions(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req AIGenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	var userSettings models.Settings
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey(userSettings.ZhipuAPIKey)
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "请先在设置页面配置智谱 AI API Key"})
		return
	}

	model := userSettings.ZhipuModel
	if model == "" {
		model = config.AppConfig.ZhipuModel
	}

	aiService := services.NewZhipuAIService(apiKey, model)
	generatedQuestions, err := aiService.GenerateQuestions(chapter.Content, req.QuestionType, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 生成题目失败：" + err.Error()})
		return
	}

	var savedQuestions []models.Question
	for _, q := range generatedQuestions.Questions {
		newQuestion := models.Question{
			UserId:         userId,
			BookId:         chapter.BookId,
			ChapterId:      req.ChapterId,
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"questions": savedQuestions,
			"count":     len(savedQuestions),
		},
	})
}
