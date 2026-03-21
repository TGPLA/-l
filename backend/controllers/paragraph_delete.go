// @审计已完成
// 段落控制器 - 删除操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeleteParagraph(c *gin.Context) {
	userId := middleware.GetUserId(c)
	paragraphId := c.Param("id")
	db := config.GetDB()

	var paragraph models.Paragraph
	result := db.Where("id = ? AND user_id = ?", paragraphId, userId).First(&paragraph)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "段落不存在"})
		return
	}

	var chapter models.Chapter
	db.Where("id = ?", paragraph.ChapterId).First(&chapter)

	if err := db.Delete(&paragraph).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除失败"})
		return
	}

	db.Model(&chapter).UpdateColumn("paragraph_count", gorm.Expr("paragraph_count - 1"))

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}
