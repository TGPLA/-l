// @审计已完成
// 书籍控制器 - EPUB 文件上传
package controllers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func UploadEPUB(c *gin.Context) {
	log.Println("📥 开始处理 EPUB 上传请求")
	
	userId := middleware.GetUserId(c)
	bookId := c.Param("id")
	log.Printf("📋 参数: userId=%s, bookId=%s", userId, bookId)

	db := config.GetDB()

	var book models.Book
	result := db.Where("id = ? AND user_id = ?", bookId, userId).First(&book)
	if result.Error != nil {
		log.Printf("❌ 查询书籍失败: %v", result.Error)
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "书籍不存在"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "查询书籍失败: " + result.Error.Error()})
		}
		return
	}
	log.Printf("✅ 找到书籍: %s", book.Title)

	file, err := c.FormFile("epub_file")
	if err != nil {
		log.Printf("❌ 获取文件失败: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请选择 EPUB 文件"})
		return
	}
	log.Printf("📁 收到文件: %s, 大小: %d bytes", file.Filename, file.Size)

	if filepath.Ext(file.Filename) != ".epub" {
		log.Printf("❌ 文件格式错误: %s", file.Filename)
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "只支持 .epub 格式文件"})
		return
	}

	uploadDir := "./uploads/epubs"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("❌ 创建目录失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建上传目录失败"})
		return
	}
	log.Printf("📂 上传目录: %s", uploadDir)

	newFilename := fmt.Sprintf("%s_%s.epub", userId, uuid.New().String())
	filePath := filepath.Join(uploadDir, newFilename)
	storedPath := "uploads/epubs/" + newFilename
	log.Printf("📄 文件路径: %s", filePath)

	src, err := file.Open()
	if err != nil {
		log.Printf("❌ 打开文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "打开文件失败"})
		return
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		log.Printf("❌ 创建目标文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建文件失败"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		log.Printf("❌ 保存文件失败: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "保存文件失败"})
		return
	}
	log.Println("✅ 文件保存成功")

	updates := map[string]interface{}{
		"epub_file_path": storedPath,
	}

	if err := db.Model(&book).Updates(updates).Error; err != nil {
		log.Printf("❌ 更新数据库失败: %v", err)
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新书籍信息失败: " + err.Error()})
		return
	}
	log.Println("✅ 数据库更新成功")

	db.First(&book, bookId)
	log.Println("🎉 EPUB 上传完成")
	c.JSON(http.StatusOK, gin.H{"success": true, "data": book})
}
