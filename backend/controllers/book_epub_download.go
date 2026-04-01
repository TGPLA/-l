// @审计已完成
// 书籍控制器 - EPUB 文件下载
package controllers

import (
	"net/http"
	"path/filepath"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DownloadEPUB(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("id")

	db := config.GetDB()

	var book models.Book
	result := db.Where("id = ? AND user_id = ?", bookId, userId).First(&book)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		return
	}

	if book.EpubFilePath == "" {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "该书籍没有 EPUB 文件"})
		return
	}

	filename := filepath.Base(book.EpubFilePath)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/epub+zip")
	c.File(book.EpubFilePath)
}
