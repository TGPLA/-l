package routes

import (
	"os"
	"reading-reflection/controllers"
	"reading-reflection/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRoutes() *gin.Engine {
	router := gin.Default()

	allowOrigins := []string{"http://localhost:5173", "http://localhost:3000", "https://linyubo.top"}
	
	if os.Getenv("CORS_ALLOW_ALL") == "true" {
		allowOrigins = []string{"*"}
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	router.Static("/uploads", "./uploads")

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/signup", controllers.Register)
			auth.POST("/signin", controllers.Login)
			auth.POST("/signout", controllers.Logout)
			auth.POST("/reset-password", controllers.ResetPassword)
			auth.POST("/update-password", middleware.AuthMiddleware(), controllers.UpdatePassword)
		}

		books := api.Group("/books")
		books.Use(middleware.AuthMiddleware())
		{
			books.GET("", controllers.GetBooks)
			books.POST("", controllers.CreateBook)
			books.PUT("/:id", controllers.UpdateBook)
			books.DELETE("/:id", controllers.DeleteBook)
			books.GET("/:id", controllers.GetBookDetail)
			books.POST("/:id/upload-epub", controllers.UploadEPUB)
			books.GET("/:id/epub", controllers.DownloadEPUB)
		}

		questions := api.Group("/questions")
		questions.Use(middleware.AuthMiddleware())
		{
			questions.GET("/book/:book_id", controllers.GetQuestionsByBook)
			questions.POST("", controllers.CreateQuestion)
			questions.GET("/:id", controllers.GetQuestionDetail)
			questions.PUT("/:id", controllers.UpdateQuestion)
			questions.DELETE("/:id", controllers.DeleteQuestion)
			questions.GET("/:id/records", controllers.GetPracticeRecords)
			questions.POST("/:id/practice", controllers.RecordPractice)
		}

		ai := api.Group("/ai")
		ai.Use(middleware.AuthMiddleware())
		{
			ai.POST("/generate-from-selection", controllers.AIGenerateFromSelection)
			ai.POST("/generate-from-selection-auto", controllers.AIGenerateFromSelectionAuto)
			ai.POST("/analyze-text", controllers.AIAnalyzeText)
			ai.POST("/explain-concept", controllers.AIExplainConcept)
			ai.POST("/paraphrase-text", controllers.AIParaphraseText)
			ai.POST("/chapter-understanding", controllers.AIChapterUnderstanding)
			ai.POST("/evaluate-answer", controllers.AIEvaluateAnswer)
			ai.POST("/extract-concepts", controllers.AIExtractConcepts)
			ai.POST("/evaluate-concept", controllers.AIEvaluateConcept)
			ai.POST("/evaluate-intention", controllers.AIEvaluateIntention)
		}

		concepts := api.Group("/concepts")
		concepts.Use(middleware.AuthMiddleware())
		{
			concepts.GET("/:source_type/:source_id", controllers.GetConcepts)
			concepts.POST("/:id/practice", controllers.CreateConceptPracticeRecord)
		}

		settings := api.Group("/settings")
		settings.Use(middleware.AuthMiddleware())
		{
			settings.GET("", controllers.GetSettings)
			settings.PUT("", controllers.UpdateSettings)
		}

		annotations := api.Group("/annotations")
		annotations.Use(middleware.AuthMiddleware())
		{
			annotations.GET("/book/:book_id", controllers.GetAnnotationsByBook)
			annotations.POST("", controllers.CreateAnnotation)
			annotations.GET("/:id", controllers.GetAnnotationDetail)
			annotations.PUT("/:id", controllers.UpdateAnnotation)
			annotations.DELETE("/:id", controllers.DeleteAnnotation)
			annotations.DELETE("/all-markers", controllers.DeleteAllMarkers)
		}

		statistics := api.Group("/statistics")
		statistics.Use(middleware.AuthMiddleware())
		{
			statistics.GET("", controllers.GetStatistics)
		}

		paraphrases := api.Group("/paraphrases")
		paraphrases.Use(middleware.AuthMiddleware())
		{
			paraphrases.POST("", controllers.CreateParaphrase)
			paraphrases.GET("", controllers.GetParaphrasesByBook)
			paraphrases.DELETE("/:id", controllers.DeleteParaphrase)
		}
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "阅读回响后端服务运行正常",
		})
	})
	
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "阅读回响后端服务运行正常",
		})
	})

	return router
}
