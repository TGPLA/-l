// @审计已完成
// 章节控制器 - 删除与排序
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeleteChapter(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("id")
	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", chapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	if err := db.Delete(&chapter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除章节失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "章节删除成功"})
}

func UpdateChapterOrder(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("id")

	var req UpdateChapterOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", chapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	if err := db.Model(&chapter).Update("order_index", req.OrderIndex).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新排序失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "排序更新成功"})
}
