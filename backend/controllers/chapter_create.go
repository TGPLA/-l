// @审计已完成
// 章节控制器 - 创建与更新
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateChapter(c *gin.Context) {
	userId := middleware.GetUserId(c)

	var req CreateChapterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var book models.Book
	result := db.Where("id = ? AND user_id = ?", req.BookId, userId).First(&book)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		return
	}

	orderIndex := req.OrderIndex
	if orderIndex == 0 {
		var maxOrder int
		db.Model(&models.Chapter{}).Where("book_id = ?", req.BookId).
			Select("COALESCE(MAX(order_index), 0)").Scan(&maxOrder)
		orderIndex = maxOrder + 1
	}

	newChapter := models.Chapter{
		BookId:     req.BookId,
		UserId:     userId,
		Title:      req.Title,
		Content:    req.Content,
		OrderIndex: orderIndex,
	}

	if err := db.Create(&newChapter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建章节失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": newChapter})
}

func UpdateChapter(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("id")

	var req UpdateChapterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var chapter models.Chapter
	result := tx.Where("id = ? AND user_id = ?", chapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	updates := map[string]interface{}{
		"title":   req.Title,
		"content": req.Content,
	}

	if err := tx.Model(&chapter).Updates(updates).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新章节失败"})
		return
	}

	if err := tx.Where("user_id = ? AND source_type = ? AND source_id = ?", userId, "chapter", chapterId).Delete(&models.Concept{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除关联概念失败"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "提交失败"})
		return
	}

	db.First(&chapter, chapterId)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": chapter})
}
