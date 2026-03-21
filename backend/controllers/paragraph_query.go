// @审计已完成
// 段落控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetParagraphsByChapter(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("chapter_id")
	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", chapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	var paragraphs []models.Paragraph
	db.Where("chapter_id = ?", chapterId).Order("order_index ASC").Find(&paragraphs)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": paragraphs})
}

func GetParagraphDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	paragraphId := c.Param("id")
	db := config.GetDB()

	var paragraph models.Paragraph
	result := db.Where("id = ? AND user_id = ?", paragraphId, userId).
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		First(&paragraph)

	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "段落不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": paragraph})
}
