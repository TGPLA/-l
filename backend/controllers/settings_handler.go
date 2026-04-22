package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UpdateSettingsRequest struct {
	DarkMode              *bool   `json:"dark_mode"`
	ZhipuModel            *string `json:"zhipu_model"`
	DifyAPIKey            *string `json:"dify_api_key"`
	QuestionWorkflowUrl   *string `json:"question_workflow_url"`
	CorrectionWorkflowUrl *string `json:"correction_workflow_url"`
}

func GetSettings(c *gin.Context) {
	userId := middleware.GetUserId(c)

	db := config.GetDB()

	var settings models.Settings
	result := db.Where("user_id = ?", userId).First(&settings)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "用户设置不存在"})
		return
	}

	builtInApiKey := config.GetZhipuAPIKey()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":                        settings.ID,
			"user_id":                   settings.UserId,
			"dark_mode":                 settings.DarkMode,
			"zhipu_model":              settings.ZhipuModel,
			"dify_api_key":              settings.DifyAPIKey,
			"question_workflow_url":      settings.QuestionWorkflowUrl,
			"correction_workflow_url":   settings.CorrectionWorkflowUrl,
			"created_at":                settings.CreatedAt,
			"updated_at":                settings.UpdatedAt,
		},
		"builtInApiKey": builtInApiKey,
		"hasBuiltInKey": builtInApiKey != "",
	})
}

func UpdateSettings(c *gin.Context) {
	userId := middleware.GetUserId(c)

	var req UpdateSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var settings models.Settings
	result := db.Where("user_id = ?", userId).First(&settings)
	if result.Error == gorm.ErrRecordNotFound {
		zhipuModel := "glm-4-flash"
		if req.ZhipuModel != nil {
			zhipuModel = *req.ZhipuModel
		}
		settings = models.Settings{
			UserId:                userId,
			ZhipuModel:            zhipuModel,
		}
		if req.DarkMode != nil {
			settings.DarkMode = *req.DarkMode
		}
		if req.DifyAPIKey != nil {
			settings.DifyAPIKey = *req.DifyAPIKey
		}
		if req.QuestionWorkflowUrl != nil {
			settings.QuestionWorkflowUrl = *req.QuestionWorkflowUrl
		}
		if req.CorrectionWorkflowUrl != nil {
			settings.CorrectionWorkflowUrl = *req.CorrectionWorkflowUrl
		}
		db.Create(&settings)
	} else {
		updates := map[string]interface{}{}

		if req.DarkMode != nil {
			updates["dark_mode"] = *req.DarkMode
		}
		if req.ZhipuModel != nil {
			updates["zhipu_model"] = *req.ZhipuModel
		}
		if req.DifyAPIKey != nil {
			updates["dify_api_key"] = *req.DifyAPIKey
		}
		if req.QuestionWorkflowUrl != nil {
			updates["question_workflow_url"] = *req.QuestionWorkflowUrl
		}
		if req.CorrectionWorkflowUrl != nil {
			updates["correction_workflow_url"] = *req.CorrectionWorkflowUrl
		}

		if len(updates) > 0 {
			db.Model(&settings).Updates(updates)
		}
	}

	db.Where("user_id = ?", userId).First(&settings)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": settings})
}
