package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

type UserStatistics struct {
	TotalBooks     int64 `json:"total_books"`
	TotalChapters  int64 `json:"total_chapters"`
	TotalQuestions int64 `json:"total_questions"`
	MasteredCount  int64 `json:"mastered_questions"`
	TotalPractices int64 `json:"total_practices"`
}

func GetStatistics(c *gin.Context) {
	userId := middleware.GetUserId(c)

	db := config.GetDB()

	var stats UserStatistics

	db.Model(&models.Book{}).Where("user_id = ?", userId).Count(&stats.TotalBooks)
	db.Model(&models.Chapter{}).Where("user_id = ?", userId).Count(&stats.TotalChapters)
	db.Model(&models.Question{}).Where("user_id = ?", userId).Count(&stats.TotalQuestions)
	db.Model(&models.Question{}).Where("user_id = ? AND mastery_level = ?", userId, "已掌握").Count(&stats.MasteredCount)
	db.Model(&models.PracticeRecord{}).Where("user_id = ?", userId).Count(&stats.TotalPractices)

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}
