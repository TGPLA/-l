// @审计已完成
// 题目控制器 - 创建与更新
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateQuestion(c *gin.Context) {
	userId := middleware.GetUserId(c)

	var req CreateQuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()

	var chapter *models.Chapter
	if req.ChapterId != "" {
		result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
			return
		}
	}

	var chapterId *string
	if req.ChapterId != "" {
		chapterId = &req.ChapterId
	}
	var paragraphId *string
	if req.ParagraphId != nil && *req.ParagraphId != "" {
		paragraphId = req.ParagraphId
	}

	newQuestion := models.Question{
		UserId:         userId,
		BookId:        req.BookId,
		ChapterId:     chapterId,
		ParagraphId:   paragraphId,
		Question:      req.Question,
		QuestionType:  req.QuestionType,
		Category:      req.Category,
		Answer:        req.Answer,
		Options:       req.Options,
		CorrectIndex:   req.CorrectIndex,
		Explanation:   req.Explanation,
		Difficulty:     req.Difficulty,
		KnowledgePoint: req.KnowledgePoint,
		MasteryLevel:  "未掌握",
	}

	if err := db.Create(&newQuestion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "创建题目失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": newQuestion})
}

func UpdateQuestion(c *gin.Context) {
	userId := middleware.GetUserId(c)
	questionId := c.Param("id")

	var req UpdateQuestionRequest
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

	updates := map[string]interface{}{}
	if req.Question != "" {
		updates["question"] = req.Question
	}
	if req.QuestionType != "" {
		updates["question_type"] = req.QuestionType
	}
	if req.Answer != "" {
		updates["answer"] = req.Answer
	}
	if req.Difficulty != "" {
		updates["difficulty"] = req.Difficulty
	}
	if req.MasteryLevel != "" {
		updates["mastery_level"] = req.MasteryLevel
	}

	if len(updates) > 0 {
		if err := db.Model(&question).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "更新题目失败"})
			return
		}
	}

	db.First(&question, questionId)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": question})
}
