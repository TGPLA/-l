// @审计已完成
// 提示词模板控制器 - 创建操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

func CreatePromptTemplate(c *gin.Context) {
	userId := middleware.GetUserId(c)
	var req CreatePromptTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	template := models.PromptTemplate{
		UserId:       &userId,
		Name:         req.Name,
		QuestionType: req.QuestionType,
		Content:      req.Content,
		IsDefault:    req.IsDefault,
		IsSystem:     false,
	}

	if req.IsDefault {
		db.Model(&models.PromptTemplate{}).
			Where("user_id = ? AND question_type = ?", userId, req.QuestionType).
			Update("is_default", false)
	}

	if err := db.Create(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": template})
}
