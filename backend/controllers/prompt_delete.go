// @审计已完成
// 提示词模板控制器 - 删除操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeletePromptTemplate(c *gin.Context) {
	userId := middleware.GetUserId(c)
	templateId := c.Param("id")
	db := config.GetDB()

	var template models.PromptTemplate
	result := db.Where("id = ? AND user_id = ?", templateId, userId).First(&template)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "模板不存在或无权限删除"})
		return
	}

	if template.IsSystem {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "系统模板不可删除"})
		return
	}

	if err := db.Delete(&template).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}
