// @审计已完成
// 段落控制器 - 更新操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UpdateParagraph(c *gin.Context) {
	userId := middleware.GetUserId(c)
	paragraphId := c.Param("id")
	var req UpdateParagraphRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var paragraph models.Paragraph
	result := db.Where("id = ? AND user_id = ?", paragraphId, userId).First(&paragraph)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "段落不存在"})
		return
	}

	paragraph.Content = req.Content
	if err := db.Save(&paragraph).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": paragraph})
}
