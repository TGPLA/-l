// @审计已完成
// 复述记录 API - 保存和查询复述记录
package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/models"

	"github.com/gin-gonic/gin"
)

type CreateParaphraseRequest struct {
	BookId          string `json:"book_id" binding:"required"`
	ChapterId       string `json:"chapter_id"`
	Type            string `json:"type" binding:"required,oneof=concept understanding ai_paraphrase"` // 类型：concept 或 understanding
	ConceptName     string `json:"concept_name"`                                                  // 概念名称，仅 type=concept 时必填
	OriginalText    string `json:"original_text" binding:"required"`
	ParaphrasedText string `json:"paraphrased_text" binding:"required"`
	AIEvaluation    string `json:"ai_evaluation"` // AI 评价内容，可选
}

type GetParaphrasesRequest struct {
	BookId string `form:"book_id" binding:"required"`
}

func CreateParaphrase(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未登录"})
		return
	}

	var req CreateParaphraseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	record := models.ParaphraseRecord{
		UserId:          userId.(string),
		BookId:          req.BookId,
		ChapterId:       req.ChapterId,
		Type:            req.Type,
		ConceptName:     req.ConceptName,
		OriginalText:    req.OriginalText,
		ParaphrasedText: req.ParaphrasedText,
		AIEvaluation:    req.AIEvaluation,
	}

	result := db.Create(&record)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "保存失败：" + result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    record,
	})
}

func GetParaphrasesByBook(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未登录"})
		return
	}

	var req GetParaphrasesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	var records []models.ParaphraseRecord
	result := db.Where("user_id = ? AND book_id = ?", userId.(string), req.BookId).
		Order("created_at DESC").
		Find(&records)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "查询失败：" + result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    records,
	})
}

func DeleteParaphrase(c *gin.Context) {
	userId, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未登录"})
		return
	}

	recordId := c.Param("id")
	if recordId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "缺少记录ID"})
		return
	}

	db := config.GetDB()
	if db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "数据库未连接"})
		return
	}

	result := db.Where("id = ? AND user_id = ?", recordId, userId.(string)).Delete(&models.ParaphraseRecord{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "删除失败：" + result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "记录不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
