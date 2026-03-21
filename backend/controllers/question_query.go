// @审计已完成
// 题目控制器 - 查询操作
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetQuestionsByChapter(c *gin.Context) {
	userId := middleware.GetUserId(c)
	chapterId := c.Param("chapter_id")
	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", chapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	var questions []models.Question
	db.Where("chapter_id = ?", chapterId).Order("created_at DESC").Find(&questions)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": questions})
}

func GetQuestionDetail(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionId := c.Param("id")
	db := config.GetDB()

	var question models.Question
	result := db.Where("id = ? AND user_id = ?", questionId, userId).First(&question)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "题目不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": question})
}

func GetQuestionsByBook(c *gin.Context) {
	userId := middleware.GetUserId(c)
	bookId := c.Param("book_id")
	db := config.GetDB()

	var questions []models.Question
	result := db.Where("book_id = ? AND user_id = ?", bookId, userId).Order("created_at DESC").Find(&questions)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取题目列表失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": questions})
}

func GetPracticeRecords(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionId := c.Param("id")
	db := config.GetDB()

	var question models.Question
	result := db.Where("id = ? AND user_id = ?", questionId, userId).First(&question)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "题目不存在"})
		return
	}

	var records []models.PracticeRecord
	db.Where("question_id = ?", questionId).Order("practice_at DESC").Find(&records)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": records})
}
