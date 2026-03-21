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
	DarkMode              *bool  `json:"dark_mode"`
	ZhipuAPIKey           string `json:"zhipu_api_key"`
	ZhipuModel            string `json:"zhipu_model"`
	DifyAPIKey            string `json:"dify_api_key"`
	QuestionWorkflowUrl   string `json:"question_workflow_url"`
	CorrectionWorkflowUrl string `json:"correction_workflow_url"`
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

	c.JSON(http.StatusOK, gin.H{"success": true, "data": settings})
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
		settings = models.Settings{
			UserId:                userId,
			ZhipuAPIKey:           req.ZhipuAPIKey,
			ZhipuModel:            req.ZhipuModel,
			DifyAPIKey:            req.DifyAPIKey,
			QuestionWorkflowUrl:   req.QuestionWorkflowUrl,
			CorrectionWorkflowUrl: req.CorrectionWorkflowUrl,
		}
		if req.DarkMode != nil {
			settings.DarkMode = *req.DarkMode
		}
		db.Create(&settings)
	} else {
		updates := map[string]interface{}{}

		if req.DarkMode != nil {
			updates["dark_mode"] = *req.DarkMode
		}
		if req.ZhipuAPIKey != "" {
			updates["zhipu_api_key"] = req.ZhipuAPIKey
		}
		if req.ZhipuModel != "" {
			updates["zhipu_model"] = req.ZhipuModel
		}
		if req.DifyAPIKey != "" {
			updates["dify_api_key"] = req.DifyAPIKey
		}
		if req.QuestionWorkflowUrl != "" {
			updates["question_workflow_url"] = req.QuestionWorkflowUrl
		}
		if req.CorrectionWorkflowUrl != "" {
			updates["correction_workflow_url"] = req.CorrectionWorkflowUrl
		}

		if len(updates) > 0 {
			db.Model(&settings).Updates(updates)
		}
	}

	db.Where("user_id = ?", userId).First(&settings)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": settings})
}
