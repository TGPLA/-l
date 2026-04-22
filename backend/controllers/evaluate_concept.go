// @审计已完成
// AI控制器 - 概念点评
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"reading-reflection/services"

	"github.com/gin-gonic/gin"
)

func AIEvaluateConcept(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req struct {
		Concept     string `json:"concept"`
		Explanation string `json:"explanation"`
		UserAnswer  string `json:"user_answer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	var userSettings models.Settings
	db := config.GetDB()
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey()
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "系统未配置智谱 AI API Key"})
		return
	}

	model := config.AppConfig.ZhipuModel

	aiService := services.NewZhipuAIService(apiKey, model)
	result, err := aiService.EvaluateConcept(req.Concept, req.Explanation, req.UserAnswer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 评价失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

func AIEvaluateIntention(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req struct {
		Paragraph  string `json:"paragraph"`
		UserAnswer string `json:"user_answer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	var userSettings models.Settings
	db := config.GetDB()
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey()
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "系统未配置智谱 AI API Key"})
		return
	}

	model := config.AppConfig.ZhipuModel

	aiService := services.NewZhipuAIService(apiKey, model)
	result, err := aiService.EvaluateIntention(req.Paragraph, req.UserAnswer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 评价失败：" + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}
