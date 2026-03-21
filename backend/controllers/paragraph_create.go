// @审计已完成
// 段落控制器 - 创建操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateParagraph(c *gin.Context) {
	userId := middleware.GetUserId(c)
	var req CreateParagraphRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	paragraph := models.Paragraph{
		ChapterId:  req.ChapterId,
		UserId:     userId,
		Content:    req.Content,
		OrderIndex: req.OrderIndex,
	}

	if err := db.Create(&paragraph).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建失败"})
		return
	}

	db.Model(&chapter).UpdateColumn("paragraph_count", gorm.Expr("paragraph_count + 1"))

	c.JSON(http.StatusOK, gin.H{"success": true, "data": paragraph})
}

func BatchCreateParagraphs(c *gin.Context) {
	userId := middleware.GetUserId(c)
	var req BatchCreateParagraphsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	var paragraphs []models.Paragraph
	for i, content := range req.Contents {
		paragraph := models.Paragraph{
			ChapterId:  req.ChapterId,
			UserId:     userId,
			Content:    content,
			OrderIndex: i,
		}
		paragraphs = append(paragraphs, paragraph)
	}

	if err := db.Create(&paragraphs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "批量创建失败"})
		return
	}

	db.Model(&chapter).UpdateColumn("paragraph_count", len(paragraphs))

	c.JSON(http.StatusOK, gin.H{"success": true, "data": paragraphs})
}
