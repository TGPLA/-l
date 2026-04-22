// @审计已完成
// AI控制器 - 答案评价
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

func AIEvaluateAnswer(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req AIEvaluateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var question models.Question
	result := db.Where("id = ? AND user_id = ?", req.QuestionId, userId).Preload("Chapter").First(&question)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "题目不存在"})
		return
	}

	var userSettings models.Settings
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey()
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "系统未配置智谱 AI API Key"})
		return
	}

	model := config.AppConfig.ZhipuModel

	aiService := services.NewZhipuAIService(apiKey, model)
	evaluation, err := aiService.EvaluateAnswer(question.Chapter.Content, question.Question, req.UserAnswer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 评估答案失败：" + err.Error()})
		return
	}

	record := models.PracticeRecord{
		UserId:       userId,
		QuestionId:   req.QuestionId,
		UserAnswer:   req.UserAnswer,
		AIEvaluation: evaluation.Evaluation,
	}
	db.Create(&record)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": evaluation})
}
