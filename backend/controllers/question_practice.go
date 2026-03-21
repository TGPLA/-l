// @审计已完成
// 题目控制器 - 删除与练习记录
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func DeleteQuestion(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionId := c.Param("id")
	db := config.GetDB()

	var question models.Question
	result := db.Where("id = ? AND user_id = ?", questionId, userId).First(&question)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "题目不存在"})
		return
	}

	if err := db.Delete(&question).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除题目失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "题目删除成功"})
}

func RecordPractice(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionId := c.Param("id")

	var req RecordPracticeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var question models.Question
	result := db.Where("id = ? AND user_id = ?", questionId, userId).First(&question)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "题目不存在"})
		return
	}

	record := models.PracticeRecord{
		UserId:       userId,
		QuestionId:   questionId,
		UserAnswer:   req.UserAnswer,
		IsCorrect:    req.IsCorrect,
		AIEvaluation: req.AIEvaluation,
	}

	if err := db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "记录练习失败"})
		return
	}

	now := time.Now()
	db.Model(&question).Updates(map[string]interface{}{
		"practice_count":     gorm.Expr("practice_count + 1"),
		"last_practiced_at": now,
	})

	c.JSON(http.StatusOK, gin.H{"success": true, "data": record})
}
