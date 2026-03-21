// @审计已完成
// 题目控制器 - 请求结构体定义
package controllers

type CreateQuestionRequest struct {
	BookId         string  `json:"book_id" binding:"required"`
	ChapterId      string  `json:"chapter_id" binding:"required"`
	ParagraphId    *string `json:"paragraph_id"`
	Question       string  `json:"question" binding:"required"`
	QuestionType   string  `json:"question_type" binding:"required"`
	Category       string  `json:"category"`
	Answer         string  `json:"answer" binding:"required"`
	Options        *string `json:"options"`
	CorrectIndex   *int    `json:"correct_index"`
	Explanation    string  `json:"explanation"`
	Difficulty     string  `json:"difficulty" binding:"required"`
	KnowledgePoint string  `json:"knowledge_point"`
}

type UpdateQuestionRequest struct {
	Question        string  `json:"question"`
	QuestionType    string  `json:"question_type"`
	Answer          string  `json:"answer"`
	Difficulty      string  `json:"difficulty"`
	KnowledgePoint  string  `json:"knowledge_point"`
	MasteryLevel    string  `json:"mastery_level"`
	PracticeCount   *int    `json:"practice_count"`
	LastPracticedAt *string `json:"last_practiced_at"`
}

type RecordPracticeRequest struct {
	UserAnswer   string `json:"user_answer"`
	IsCorrect    *bool  `json:"is_correct"`
	AIEvaluation string `json:"ai_evaluation"`
}
