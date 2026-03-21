// @审计已完成
// 书籍控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetBooks(c *gin.Context) {
	userId := middleware.GetUserId(c)
	db := config.GetDB()

	var books []models.Book
	result := db.Where("user_id = ?", userId).Order("updated_at DESC").Find(&books)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取书籍列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": books})
}

func GetBookDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("id")
	db := config.GetDB()

	var book models.Book
	result := db.Where("id = ? AND user_id = ?", bookId, userId).
		Preload("Chapters", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		First(&book)

	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": book})
}
