// @审计已完成
// 提示词模板控制器 - 更新操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdatePromptTemplate(c *gin.Context) {
	userId := middleware.GetUserId(c)
	templateId := c.Param("id")
	var req UpdatePromptTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var template models.PromptTemplate
	result := db.Where("id = ? AND user_id = ?", templateId, userId).First(&template)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "模板不存在或无权限修改"})
		return
	}

	if template.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "系统模板不可修改"})
		return
	}

	template.Name = req.Name
	template.Content = req.Content
	template.IsDefault = req.IsDefault

	if req.IsDefault {
		db.Model(&models.PromptTemplate{}).
			Where("user_id = ? AND question_type = ? AND id != ?", userId, template.QuestionType, templateId).
			Update("is_default", false)
	}

	if err := db.Save(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": template})
}
