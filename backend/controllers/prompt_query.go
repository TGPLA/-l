// @审计已完成
// 提示词模板控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPromptTemplates(c *gin.Context) {
	userId := middleware.GetUserId(c)
	db := config.GetDB()

	var templates []models.PromptTemplate
	db.Where("user_id IS NULL OR user_id = ?", userId).
		Order("is_system DESC, created_at ASC").
		Find(&templates)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": templates})
}

func GetPromptTemplatesByType(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionType := c.Param("type")
	db := config.GetDB()

	var templates []models.PromptTemplate
	db.Where("question_type = ? AND (user_id IS NULL OR user_id = ?)", questionType, userId).
		Order("is_system DESC, is_default DESC, created_at ASC").
		Find(&templates)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": templates})
}

func GetPromptTemplateDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	templateId := c.Param("id")
	db := config.GetDB()

	var template models.PromptTemplate
	result := db.Where("id = ? AND (user_id IS NULL OR user_id = ?)", templateId, userId).First(&template)

	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "模板不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": template})
}
