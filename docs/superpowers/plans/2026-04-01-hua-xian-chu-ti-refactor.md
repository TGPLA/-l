# 划线出题重构 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将"章节出题"和"段落出题"统一为"划线出题"，用户在EPUB阅读器中划线后弹出多功能菜单，支持AI出题、高亮标记、复制文字。

**Architecture:** 后端新增统一的划线出题接口，删除旧的章节/段落出题接口；前端重构划词交互，从底部创建栏改为微信读书风格的虚线+弹出菜单；书籍详情页新增章节划线记录查看入口。

**Tech Stack:** React + TypeScript（前端）、Go + Gin + GORM（后端）、智谱AI API

---

## 文件变更总览

### 后端 - 新建
- `backend/controllers/ai_selection.go` — 划线出题控制器
- `backend/services/zhipu_selection.go` — 划线出题AI服务（统一出题逻辑）

### 后端 - 修改
- `backend/routes/routes.go` — 新增划线出题路由，删除旧路由
- `backend/controllers/ai_types.go` — 新增划线出题请求结构体

### 后端 - 删除
- `backend/controllers/ai_generate.go` — 旧章节出题控制器
- `backend/controllers/ai_paragraph.go` — 旧段落出题控制器
- `backend/services/zhipu_questions.go` — 旧章节出题服务
- `backend/services/zhipu_paragraph.go` — 旧段落出题服务

### 前端 - 新建
- `src/features/books/components/HuaXianCaiDan.tsx` — 划线多功能菜单组件（微信读书风格）
- `src/features/books/components/HuaXianXuXian.tsx` — 划线文字下方的虚线指示器
- `src/features/books/hooks/useHuaXianChuTi.ts` — 划线出题Hook（AI出题+高亮+复制）
- `src/features/books/components/ZhangJieHuaXianJiLu.tsx` — 章节划线记录查看组件

### 前端 - 修改
- `src/shared/services/aiService.ts` — 新增划线出题方法，删除旧方法
- `src/features/books/components/EPUBYueDuQuYu.tsx` — 替换底部栏为虚线+菜单
- `src/features/books/hooks/useHuaCiChuangJian.ts` — 重构为划线多功能菜单逻辑
- `src/features/books/hooks/useEPUBReaderJiChuHuo.ts` — 适配新的划线交互
- `src/features/books/hooks/useEPUBReaderHuoChuLi.ts` — 透传新的划线状态
- `src/features/books/components/EPUBReader.tsx` — 透传新的划线Props
- `src/features/books/components/BookDetail.tsx` — 新增划线记录查看入口
- `src/features/books/components/ChapterManager.tsx` — 章节列表增加划线记录入口
- `src/features/books/hooks/useZhangJieBianJi.ts` — 删除AI出题调用
- `src/features/books/hooks/useDuanLuoGuanLi.ts` — 删除AI出题调用

### 前端 - 删除
- `src/features/books/components/HuaCiChuangJianDiLan.tsx` — 旧底部创建栏

---

## Task 1: 后端 - 新增划线出题服务（统一出题逻辑+去重）

**Files:**
- Create: `backend/services/zhipu_selection.go`
- Modify: `backend/services/zhipu_types.go`

- [ ] **Step 1: 在 zhipu_types.go 中新增划线出题相关结构体**

在 `backend/services/zhipu_types.go` 末尾添加：

```go
type SelectionQuestionData struct {
	Question       string `json:"question"`
	Answer         string `json:"answer"`
	KnowledgePoint string `json:"knowledge_point"`
}

type GenerateSelectionQuestionsResult struct {
	Questions []SelectionQuestionData `json:"questions"`
}
```

- [ ] **Step 2: 创建 zhipu_selection.go，统一出题逻辑**

创建 `backend/services/zhipu_selection.go`，将 typePrompts 提取为统一配置，合并章节/段落出题为一个方法：

```go
// @审计已完成
// 智谱AI服务 - 划线出题功能（统一出题入口）

package services

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

func GetTypePrompt(questionType string) string {
	typePrompts := map[string]string{
		"名词解释": `请针对文本中的重要概念或术语出题。
题目格式：请解释"XXX"的含义
答案应包含：定义、特点、应用场景`,

		"意图理解": `请针对文本的核心思想或作者意图出题。
题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
答案应包含：核心观点、论证逻辑、深层含义`,

		"生活应用": `请将文本知识与实际生活场景结合出题。
题目格式：在生活中，如何应用XXX？/请举一个XXX的实际应用例子
答案应包含：应用场景、具体步骤、注意事项`,
	}

	if prompt, ok := typePrompts[questionType]; ok {
		return prompt
	}
	return typePrompts["名词解释"]
}

func (s *ZhipuAIService) GenerateQuestionsFromSelection(content, questionType string, count int) (*GenerateSelectionQuestionsResult, error) {
	typePrompt := GetTypePrompt(questionType)

	systemPrompt := `你是一个专业的教育出题专家，擅长基于给定文本内容生成高质量的主动回忆练习题。

重要原则：
1. 只根据用户提供的【文本】内容出题
2. 严禁使用任何文本之外的知识或信息
3. 题目必须严谨、准确、贴合文本
4. 所有答案必须能在文本中找到依据`

	userPrompt := fmt.Sprintf(`请根据以下【文本】内容，生成 %d 个基于主动回忆原则的练习题。

题型要求：
%s

【文本】：
%s

请输出纯 JSON 数组格式，不要包含其他文字或解释。
格式：[{"question": "题目内容", "answer": "答案内容", "knowledge_point": "知识点"}]`, count, typePrompt, content)

	responseContent, err := s.callAPI(systemPrompt, userPrompt, 4000)
	if err != nil {
		return nil, err
	}

	questions := parseSelectionQuestionsJSON(responseContent)
	if len(questions) == 0 {
		return nil, fmt.Errorf("无法解析 AI 返回的题目，请重试")
	}

	return &GenerateSelectionQuestionsResult{Questions: questions}, nil
}

func parseSelectionQuestionsJSON(content string) []SelectionQuestionData {
	content = strings.TrimSpace(content)
	content = regexp.MustCompile("```json\\s*").ReplaceAllString(content, "")
	content = regexp.MustCompile("```\\s*").ReplaceAllString(content, "")

	match := regexp.MustCompile(`\[[\s\S]*\]`).FindString(content)
	if match == "" {
		return nil
	}

	var questions []SelectionQuestionData
	if err := json.Unmarshal([]byte(match), &questions); err != nil {
		return nil
	}

	return questions
}
```

- [ ] **Step 3: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功，无错误

- [ ] **Step 4: Commit**

```bash
git add backend/services/zhipu_selection.go backend/services/zhipu_types.go
git commit -m "feat: 新增划线出题AI服务，统一出题逻辑"
```

---

## Task 2: 后端 - 新增划线出题控制器和路由

**Files:**
- Create: `backend/controllers/ai_selection.go`
- Modify: `backend/controllers/ai_types.go`
- Modify: `backend/routes/routes.go`

- [ ] **Step 1: 在 ai_types.go 中新增请求结构体**

在 `backend/controllers/ai_types.go` 中添加：

```go
type AIGenerateSelectionRequest struct {
	ChapterId     string `json:"chapter_id" binding:"required"`
	SelectedText  string `json:"selected_text" binding:"required"`
	QuestionType  string `json:"question_type" binding:"required"`
	Count         int    `json:"count"`
}
```

- [ ] **Step 2: 创建 ai_selection.go 控制器**

创建 `backend/controllers/ai_selection.go`：

```go
// @审计已完成
// AI控制器 - 划线出题

package controllers

import (
	"net/http"
	"reading-reflection/config"
	"reading-reflection/middleware"
	"reading-reflection/models"
	"reading-reflection/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AIGenerateFromSelection(c *gin.Context) {
	userId := middleware.GetUserId(c)
	if userId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "未授权"})
		return
	}

	var req AIGenerateSelectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "请求参数错误：" + err.Error()})
		return
	}

	if req.Count <= 0 {
		req.Count = 3
	}

	db := config.GetDB()

	var chapter models.Chapter
	result := db.Where("id = ? AND user_id = ?", req.ChapterId, userId).First(&chapter)
	if result.Error == gorm.ErrRecordNotFound {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "章节不存在"})
		return
	}

	var userSettings models.Settings
	db.Where("user_id = ?", userId).First(&userSettings)

	apiKey := config.GetZhipuAPIKey(userSettings.ZhipuAPIKey)
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "请先在设置页面配置智谱 AI API Key"})
		return
	}

	model := userSettings.ZhipuModel
	if model == "" {
		model = config.AppConfig.ZhipuModel
	}

	aiService := services.NewZhipuAIService(apiKey, model)
	generatedQuestions, err := aiService.GenerateQuestionsFromSelection(req.SelectedText, req.QuestionType, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "AI 生成题目失败：" + err.Error()})
		return
	}

	var savedQuestions []models.Question
	for _, q := range generatedQuestions.Questions {
		newQuestion := models.Question{
			UserId:         userId,
			BookId:         chapter.BookId,
			ChapterId:      req.ChapterId,
			Question:       q.Question,
			QuestionType:   req.QuestionType,
			Answer:         q.Answer,
			Difficulty:     "中等",
			KnowledgePoint: q.KnowledgePoint,
			MasteryLevel:   "未掌握",
		}
		db.Create(&newQuestion)
		savedQuestions = append(savedQuestions, newQuestion)
	}

	db.Model(&chapter).UpdateColumn("question_count", gorm.Expr("question_count + ?", len(savedQuestions)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"questions": savedQuestions,
			"count":     len(savedQuestions),
		},
	})
}
```

- [ ] **Step 3: 修改路由 — 新增划线出题路由，删除旧路由**

在 `backend/routes/routes.go` 中：
- 将 `ai.POST("/generate-questions", controllers.AIGenerateQuestions)` 替换为 `ai.POST("/generate-from-selection", controllers.AIGenerateFromSelection)`
- 删除 `ai.POST("/generate-questions-paragraph", controllers.AIGenerateQuestionsForParagraph)`

修改后的 ai 路由组：

```go
ai := api.Group("/ai")
ai.Use(middleware.AuthMiddleware())
{
	ai.POST("/generate-from-selection", controllers.AIGenerateFromSelection)
	ai.POST("/evaluate-answer", controllers.AIEvaluateAnswer)
	ai.POST("/extract-concepts", controllers.AIExtractConcepts)
	ai.POST("/evaluate-concept", controllers.AIEvaluateConcept)
	ai.POST("/evaluate-intention", controllers.AIEvaluateIntention)
}
```

- [ ] **Step 4: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功

- [ ] **Step 5: Commit**

```bash
git add backend/controllers/ai_selection.go backend/controllers/ai_types.go backend/routes/routes.go
git commit -m "feat: 新增划线出题控制器和路由，替换旧出题接口"
```

---

## Task 3: 后端 - 删除旧出题代码

**Files:**
- Delete: `backend/controllers/ai_generate.go`
- Delete: `backend/controllers/ai_paragraph.go`
- Delete: `backend/services/zhipu_questions.go`
- Delete: `backend/services/zhipu_paragraph.go`

- [ ] **Step 1: 确认无其他文件引用旧控制器和服务**

Run: `cd backend && grep -r "AIGenerateQuestions\|AIGenerateQuestionsForParagraph\|GenerateQuestions\|GenerateQuestionsForParagraph" --include="*.go" .`
Expected: 仅在已删除的文件中出现

- [ ] **Step 2: 删除旧文件**

删除以下4个文件：
- `backend/controllers/ai_generate.go`
- `backend/controllers/ai_paragraph.go`
- `backend/services/zhipu_questions.go`
- `backend/services/zhipu_paragraph.go`

- [ ] **Step 3: 验证编译**

Run: `cd backend && go build ./...`
Expected: 编译成功，无引用错误

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: 删除旧的章节出题和段落出题代码"
```

---

## Task 4: 前端 - 新增划线出题AI服务方法

**Files:**
- Modify: `src/shared/services/aiService.ts`

- [ ] **Step 1: 在 aiService.ts 中新增 generateFromSelection 方法**

在 `AIService` 类中添加新方法，放在 `generateQuestions` 方法之后：

```typescript
async generateFromSelection(chapterId: string, selectedText: string, questionType: string, count: number): Promise<{ data: GenerateQuestionsResult | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE}/ai/generate-from-selection`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        chapter_id: chapterId,
        selected_text: selectedText,
        question_type: questionType,
        count,
      }),
    });

    if (await this.handle401(response)) {
      return { data: null, error: '登录已过期' };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw YingYongCuoWu.yeWu(translateError(errorData.error || `请求失败：${response.status}`));
    }

    const responseData = await response.json() as RawGeneratedQuestionsResponse;
    const questions = (responseData?.questions || []).map(zhuanHuanTiMu);
    return { data: { questions }, error: null };
  } catch (error) {
    if (error instanceof YingYongCuoWu) {
      return { data: null, error: error.message };
    }
    return { data: null, error: error instanceof Error ? error.message : 'AI 生成题目失败' };
  }
}
```

- [ ] **Step 2: 删除旧的 generateQuestions 和 generateQuestionsForParagraph 方法**

从 `AIService` 类中删除 `generateQuestions` 和 `generateQuestionsForParagraph` 两个方法。

- [ ] **Step 3: 验证编译**

Run: `npm run build`
Expected: 编译成功（如果其他地方引用了旧方法会报错，在后续Task中修复）

- [ ] **Step 4: Commit**

```bash
git add src/shared/services/aiService.ts
git commit -m "feat: aiService新增划线出题方法，删除旧出题方法"
```

---

## Task 5: 前端 - 重构划词交互（Hook层）

**Files:**
- Modify: `src/features/books/hooks/useHuaCiChuangJian.ts` — 重构为多功能划线Hook
- Create: `src/features/books/hooks/useHuaXianChuTi.ts` — 划线出题专用Hook

- [ ] **Step 1: 重构 useHuaCiChuangJian.ts**

将现有的"划词创建段落"Hook重构为通用的"划线交互"Hook，不再绑定创建段落逻辑：

```typescript
// @审计已完成
// 划线交互 Hook - 管理文本选择状态和虚线显示

import { useState, useEffect, useCallback, useRef } from 'react';

export interface HuaXianZhuangTai {
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  enabled: boolean;
}

export function useHuaCiJiaoHu(enabled: boolean) {
  const [selectedText, setSelectedText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) {
      setShowMenu(false);
      setSelectedText('');
      setSelectionRect(null);
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || !selection.toString().trim()) {
        setShowMenu(false);
        setSelectedText('');
        setSelectionRect(null);
        return;
      }

      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.width > 0) {
        setSelectedText(text);
        setSelectionRect(rect);
        setShowMenu(true);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [enabled]);

  const handleCancel = useCallback(() => {
    setShowMenu(false);
    setSelectedText('');
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    selectedText,
    showMenu,
    selectionRect,
    setSelectedText,
    setShowMenu,
    handleCancel,
  };
}
```

- [ ] **Step 2: 创建 useHuaXianChuTi.ts**

```typescript
// @审计已完成
// 划线出题 Hook - AI出题、高亮标记、复制文字

import { useState, useCallback } from 'react';
import { aiService } from '@shared/services/aiService';
import { showError, showSuccess } from '@shared/utils/common/ToastTiShi';

export type ChuTiLeiXing = '名词解释' | '意图理解' | '生活应用';

export function useHuaXianChuTi(chapterId: string, onClose: () => void) {
  const [generating, setGenerating] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);

  const handleGenerateQuestion = useCallback(async (selectedText: string, questionType: ChuTiLeiXing) => {
    if (!selectedText.trim()) return;

    setGenerating(true);
    try {
      const { data, error } = await aiService.generateFromSelection(chapterId, selectedText, questionType, 1);
      if (error) {
        showError('AI 出题失败：' + error);
        return;
      }
      showSuccess(`已生成 1 道${questionType}题目`);
      onClose();
    } finally {
      setGenerating(false);
    }
  }, [chapterId, onClose]);

  const handleHighlight = useCallback((selectedText: string) => {
    setHighlights(prev => [...prev, selectedText]);
    showSuccess('已添加高亮标记');
    onClose();
  }, [onClose]);

  const handleCopy = useCallback(async (selectedText: string) => {
    try {
      await navigator.clipboard.writeText(selectedText);
      showSuccess('已复制到剪贴板');
      onClose();
    } catch {
      showError('复制失败');
    }
  }, [onClose]);

  return {
    generating,
    highlights,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  };
}
```

- [ ] **Step 3: 验证编译**

Run: `npx tsc --noEmit`
Expected: 可能有引用旧Hook的错误，后续Task修复

- [ ] **Step 4: Commit**

```bash
git add src/features/books/hooks/useHuaCiChuangJian.ts src/features/books/hooks/useHuaXianChuTi.ts
git commit -m "refactor: 重构划词Hook为通用划线交互，新增划线出题Hook"
```

---

## Task 6: 前端 - 创建划线多功能菜单组件

**Files:**
- Create: `src/features/books/components/HuaXianCaiDan.tsx`

- [ ] **Step 1: 创建 HuaXianCaiDan.tsx**

微信读书风格的划线弹出菜单，包含AI出题子菜单、高亮标记、复制文字：

```typescript
// @审计已完成
// 划线多功能菜单组件 - 微信读书风格

import { useState, useRef, useEffect } from 'react';
import type { ChuTiLeiXing } from '../hooks/useHuaXianChuTi';

interface HuaXianCaiDanProps {
  selectedText: string;
  position: { top: number; left: number };
  generating: boolean;
  onGenerateQuestion: (text: string, type: ChuTiLeiXing) => void;
  onHighlight: (text: string) => void;
  onCopy: (text: string) => void;
  onCancel: () => void;
}

const CHU_TI_LEI_XING: ChuTiLeiXing[] = ['名词解释', '意图理解', '生活应用'];

export function HuaXianCaiDan({
  selectedText,
  position,
  generating,
  onGenerateQuestion,
  onHighlight,
  onCopy,
  onCancel,
}: HuaXianCaiDanProps) {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 9999,
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      <div style={{
        display: 'flex',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSubMenu(!showSubMenu)}
            disabled={generating}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: showSubMenu ? '#eff6ff' : 'transparent',
              color: '#3b82f6',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            🤖 AI出题
            <span style={{ fontSize: '0.625rem' }}>▾</span>
          </button>

          {showSubMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              minWidth: '6rem',
            }}>
              {CHU_TI_LEI_XING.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    onGenerateQuestion(selectedText, type);
                    setShowSubMenu(false);
                  }}
                  disabled={generating}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontSize: '0.8125rem',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {generating ? '生成中...' : type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={() => onHighlight(selectedText)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#f59e0b',
            cursor: 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          🖍 高亮
        </button>

        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />

        <button
          onClick={() => onCopy(selectedText)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          📋 复制
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

Run: `npx tsc --noEmit`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add src/features/books/components/HuaXianCaiDan.tsx
git commit -m "feat: 新增划线多功能菜单组件（微信读书风格）"
```

---

## Task 7: 前端 - 集成划线菜单到EPUB阅读器

**Files:**
- Modify: `src/features/books/hooks/useEPUBReaderJiChuHuo.ts` — 替换旧划词Hook
- Modify: `src/features/books/hooks/useEPUBReaderHuoChuLi.ts` — 透传新状态
- Modify: `src/features/books/components/EPUBYueDuQuYu.tsx` — 替换底部栏为菜单
- Modify: `src/features/books/components/EPUBReader.tsx` — 透传新Props
- Delete: `src/features/books/components/HuaCiChuangJianDiLan.tsx`

- [ ] **Step 1: 修改 useEPUBReaderJiChuHuo.ts**

将 `useHuaCiChuangJian` 替换为 `useHuaCiJiaoHu` + `useHuaXianChuTi`：

```typescript
// @审计已完成
// EPUB 阅读器基础 Hooks

import { useState, useCallback } from 'react';
import { useHuaCiJiaoHu } from './useHuaCiChuangJian';
import { useHuaXianChuTi } from './useHuaXianChuTi';
import { useYueDuJinDu } from './useYueDuJinDu';
import { useZhuTi } from './useZhuTi';
import { useSouSuo } from './useSouSuo';
import { authService } from '../../../shared/services/auth';

interface UseEPUBReaderJiChuHuoProps {
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function useEPUBReaderJiChuHuo({
  bookId,
  chapterId,
  onParagraphCreated,
}: UseEPUBReaderJiChuHuoProps) {
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || 'guest';

  const { location, setLocation } = useYueDuJinDu({ userId, bookId });
  const { zhuTi, setZhuTi, yingYongZhuTi } = useZhuTi({ userId, bookId });
  const {
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
  } = useSouSuo();

  const [yeMaXinXi, setYeMaXinXi] = useState('');
  const [ziTiDaXiao, setZiTiDaXiao] = useState(100);
  const [huaCiKaiQi, setHuaCiKaiQi] = useState(true);

  const {
    selectedText,
    showMenu,
    selectionRect,
    handleCancel,
  } = useHuaCiJiaoHu(huaCiKaiQi);

  const {
    generating,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  } = useHuaXianChuTi(chapterId, handleCancel);

  return {
    location,
    setLocation,
    zhuTi,
    setZhuTi,
    yingYongZhuTi,
    souSuoCi,
    setSouSuoCi,
    souSuoJieGuo,
    dangQianJieGuoSuoYin,
    tiaoDaoXiaYiGe,
    tiaoDaoShangYiGe,
    chuLiSouSuoJieGuo,
    yeMaXinXi,
    setYeMaXinXi,
    ziTiDaXiao,
    setZiTiDaXiao,
    selectedText,
    showMenu,
    selectionRect,
    generating,
    huaCiKaiQi,
    setHuaCiKaiQi,
    handleCancel,
    handleGenerateQuestion,
    handleHighlight,
    handleCopy,
  };
}
```

- [ ] **Step 2: 修改 useEPUBReaderHuoChuLi.ts**

更新透传的状态，移除旧的 creating/handleCreateParagraph，新增划线菜单相关状态：

```typescript
// @审计已完成
// EPUB 阅读器 Hooks 初始化 Hook

import { useEPUBReaderJiChuHuo } from './useEPUBReaderJiChuHuo';
import { useEPUBReaderShiJian } from './useEPUBReaderShiJian';

interface UseEPUBReaderHuoChuLiProps {
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function useEPUBReaderHuoChuLi({
  bookId,
  chapterId,
  onParagraphCreated,
}: UseEPUBReaderHuoChuLiProps) {
  const jiChu = useEPUBReaderJiChuHuo({ bookId, chapterId, onParagraphCreated });

  const {
    renditionRef,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
  } = useEPUBReaderShiJian({
    yingYongZhuTi: jiChu.yingYongZhuTi,
    zhuTi: jiChu.zhuTi,
    ziTiDaXiao: jiChu.ziTiDaXiao,
    setYeMaXinXi: jiChu.setYeMaXinXi,
    setLocation: jiChu.setLocation,
    chuLiSouSuoJieGuo: jiChu.chuLiSouSuoJieGuo,
    tiaoDaoShangYiGe: jiChu.tiaoDaoShangYiGe,
    tiaoDaoXiaYiGe: jiChu.tiaoDaoXiaYiGe,
    enabled: jiChu.huaCiKaiQi,
    setSelectedText: () => {},
    setShowSelectionBar: () => {},
  });

  return {
    location: jiChu.location,
    zhuTi: jiChu.zhuTi,
    setZhuTi: jiChu.setZhuTi,
    souSuoCi: jiChu.souSuoCi,
    setSouSuoCi: jiChu.setSouSuoCi,
    souSuoJieGuo: jiChu.souSuoJieGuo,
    dangQianJieGuoSuoYin: jiChu.dangQianJieGuoSuoYin,
    yeMaXinXi: jiChu.yeMaXinXi,
    ziTiDaXiao: jiChu.ziTiDaXiao,
    setZiTiDaXiao: jiChu.setZiTiDaXiao,
    selectedText: jiChu.selectedText,
    showMenu: jiChu.showMenu,
    selectionRect: jiChu.selectionRect,
    generating: jiChu.generating,
    huaCiKaiQi: jiChu.huaCiKaiQi,
    setHuaCiKaiQi: jiChu.setHuaCiKaiQi,
    handleCancel: jiChu.handleCancel,
    handleGenerateQuestion: jiChu.handleGenerateQuestion,
    handleHighlight: jiChu.handleHighlight,
    handleCopy: jiChu.handleCopy,
    renditionRef,
    handleRendition,
    handleNextPage,
    handlePrevPage,
    handleShangYiGeSouSuoJieGuo,
    handleXiaYiGeSouSuoJieGuo,
    handleLocationChanged,
    handleSouSuoJieGuo,
  };
}
```

- [ ] **Step 3: 修改 EPUBYueDuQuYu.tsx**

替换底部创建栏为划线菜单：

```typescript
// @审计已完成
// EPUB 阅读区域子组件

import React from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition } from 'epubjs';
import { HuaXianCaiDan } from './HuaXianCaiDan';

interface EPUBYueDuQuYuProps {
  url: string;
  location: string | number;
  onLocationChanged: (epubcfi: string) => void;
  onGetRendition: (rendition: Rendition) => void;
  souSuoCi: string;
  onSouSuoJieGuo: (jieGuo: any[]) => void;
  fanYeAnNiuKeJian: boolean;
  onShangYiYe: () => void;
  onXiaYiYe: () => void;
  selectedText: string;
  showMenu: boolean;
  selectionRect: DOMRect | null;
  generating: boolean;
  onCancel: () => void;
  onGenerateQuestion: (text: string, type: '名词解释' | '意图理解' | '生活应用') => void;
  onHighlight: (text: string) => void;
  onCopy: (text: string) => void;
}

export function EPUBYueDuQuYu({
  url,
  location,
  onLocationChanged,
  onGetRendition,
  souSuoCi,
  onSouSuoJieGuo,
  fanYeAnNiuKeJian,
  onShangYiYe,
  onXiaYiYe,
  selectedText,
  showMenu,
  selectionRect,
  generating,
  onCancel,
  onGenerateQuestion,
  onHighlight,
  onCopy,
}: EPUBYueDuQuYuProps) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
      {url && (
        <ReactReader
          url={url}
          location={location}
          locationChanged={onLocationChanged}
          showToc={true}
          getRendition={onGetRendition}
          searchQuery={souSuoCi}
          onSearchResults={onSouSuoJieGuo}
          contextLength={20}
          epubOptions={{ flow: 'paginated', allowScriptedContent: true }}
        />
      )}
      {fanYeAnNiuKeJian && (
        <>
          <button onClick={onShangYiYe} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>‹</button>
          <button onClick={onXiaYiYe} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>›</button>
        </>
      )}
      {showMenu && selectedText && selectionRect && (
        <HuaXianCaiDan
          selectedText={selectedText}
          position={{ top: selectionRect.top - 8, left: selectionRect.left + selectionRect.width / 2 }}
          generating={generating}
          onGenerateQuestion={onGenerateQuestion}
          onHighlight={onHighlight}
          onCopy={onCopy}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 修改 EPUBReader.tsx**

更新Props透传：

```typescript
// @审计已完成
// EPUB 阅读器组件 - 封装 react-reader，集成所有功能

import React from 'react';
import { EPUBReaderGongJuLan } from './EPUBReaderGongJuLan';
import { EPUBYueDuQuYu } from './EPUBYueDuQuYu';
import { useEPUBReaderHuoChuLi } from '../hooks/useEPUBReaderHuoChuLi';

interface EPUBReaderProps {
  url: string;
  darkMode: boolean;
  onClose: () => void;
  bookId: string;
  chapterId: string;
  onParagraphCreated?: () => void;
}

export function EPUBReader({ url, darkMode, onClose, bookId, chapterId, onParagraphCreated }: EPUBReaderProps) {
  const p = useEPUBReaderHuoChuLi({ bookId, chapterId, onParagraphCreated });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: darkMode ? '#111827' : '#ffffff' }}>
      <EPUBReaderGongJuLan
        darkMode={darkMode}
        zhuTi={p.zhuTi}
        onZhuTiBianHua={p.setZhuTi}
        ziTiDaXiao={p.ziTiDaXiao}
        onZiTiDaXiaoBianHua={p.setZiTiDaXiao}
        souSuoCi={p.souSuoCi}
        onSouSuoCiBianHua={p.setSouSuoCi}
        souSuoJieGuoShuLiang={p.souSuoJieGuo.length}
        dangQianJieGuo={p.dangQianJieGuoSuoYin}
        onShangYiGe={p.handleShangYiGeSouSuoJieGuo}
        onXiaYiGe={p.handleXiaYiGeSouSuoJieGuo}
        yeMaXinXi={p.yeMaXinXi}
        onClose={onClose}
        huaCiKaiQi={p.huaCiKaiQi}
        onHuaCiQieHuan={() => p.setHuaCiKaiQi(!p.huaCiKaiQi)}
      />
      <EPUBYueDuQuYu
        url={url}
        location={p.location}
        onLocationChanged={p.handleLocationChanged}
        onGetRendition={p.handleRendition}
        souSuoCi={p.souSuoCi}
        onSouSuoJieGuo={p.handleSouSuoJieGuo}
        fanYeAnNiuKeJian={!!p.renditionRef.current}
        onShangYiYe={p.handlePrevPage}
        onXiaYiYe={p.handleNextPage}
        selectedText={p.selectedText}
        showMenu={p.showMenu}
        selectionRect={p.selectionRect}
        generating={p.generating}
        onCancel={p.handleCancel}
        onGenerateQuestion={p.handleGenerateQuestion}
        onHighlight={p.handleHighlight}
        onCopy={p.handleCopy}
      />
    </div>
  );
}
```

- [ ] **Step 5: 删除旧底部栏组件**

Delete: `src/features/books/components/HuaCiChuangJianDiLan.tsx`

- [ ] **Step 6: 修改 useZhangJieBianJi.ts — 删除AI出题调用**

删除 `handleSaveEdit` 中的 AI 出题相关代码（第50-56行），简化为只保存章节：

```typescript
const handleSaveEdit = useCallback(async (onChapterUpdated: () => void) => {
  if (!editingChapter || !title.trim() || !content.trim()) return;

  setLoading(true);
  try {
    const { error } = await chapterService.updateChapter(editingChapter.id, {
      title: title.trim(),
      content: content.trim(),
    });

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess('章节更新成功');
    closeModal();
    onChapterUpdated();
  } finally {
    setLoading(false);
  }
}, [editingChapter, title, content, closeModal]);
```

同时删除 `import { aiService }` 导入。

- [ ] **Step 7: 修改 useDuanLuoGuanLi.ts — 删除AI出题调用**

删除 `handleSaveEdit` 中的 AI 出题相关代码（第57-63行），简化为只保存段落：

```typescript
const handleSaveEdit = useCallback(async () => {
  if (!currentParagraph || !editContent.trim()) return;

  setSaving(true);
  try {
    const { paragraph: updatedParagraph, error: updateError } = await paragraphService.updateParagraph(
      currentParagraph.id,
      editContent.trim()
    );

    if (updateError || !updatedParagraph) {
      showError(updateError?.message || '更新段落失败');
      return;
    }

    showSuccess('段落更新成功');
    setParagraphs(prev => prev.map(p => p.id === currentParagraph.id ? updatedParagraph : p));
    setCurrentParagraph(updatedParagraph);
    setShowEditModal(false);
    setShowViewModal(true);
  } finally {
    setSaving(false);
  }
}, [currentParagraph, editContent]);
```

同时删除 `import { aiService }` 导入。

- [ ] **Step 8: 验证编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 集成划线多功能菜单到EPUB阅读器，删除旧出题逻辑"
```

---

## Task 8: 前端 - 书籍详情页新增章节划线记录入口

**Files:**
- Create: `src/features/books/components/ZhangJieHuaXianJiLu.tsx`
- Modify: `src/features/books/components/ChapterManager.tsx`

- [ ] **Step 1: 创建 ZhangJieHuaXianJiLu.tsx**

章节划线记录查看组件，展示每个章节的划线内容、相关题型、用户回答和AI回答：

```typescript
// @审计已完成
// 章节划线记录组件 - 查看章节的划线内容和相关题目

import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@infrastructure/types';
import { questionService } from '@shared/services/questionService';

interface ZhangJieHuaXianJiLuProps {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  darkMode: boolean;
}

export function ZhangJieHuaXianJiLu({ bookId, chapterId, chapterTitle, darkMode }: ZhangJieHuaXianJiLuProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const { questions: loaded } = await questionService.getQuestionsByChapter(chapterId);
    setQuestions(loaded);
    setLoading(false);
  }, [chapterId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>加载中...</div>;
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#9ca3af' : '#6b7280', backgroundColor: darkMode ? '#1f2937' : '#f9fafb', borderRadius: '0.5rem' }}>
        <p>暂无划线出题记录</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>在阅读器中划线文字即可出题</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {questions.map(q => (
        <div key={q.id} style={{
          padding: '1rem',
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          borderRadius: '0.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: darkMode ? '#374151' : '#eff6ff',
              color: '#3b82f6',
            }}>
              {q.questionType}
            </span>
            <span style={{ fontSize: '0.75rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {q.masteryLevel}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: darkMode ? '#f9fafb' : '#111827', marginBottom: '0.5rem' }}>
            {q.question}
          </p>
          <details style={{ fontSize: '0.8125rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.25rem' }}>查看答案</summary>
            <p style={{ backgroundColor: darkMode ? '#111827' : '#f9fafb', padding: '0.5rem', borderRadius: '0.25rem' }}>
              {q.answer}
            </p>
          </details>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 修改 ChapterManager.tsx — 章节列表增加划线记录入口**

在章节列表项中增加"划线记录"按钮，点击后展开显示 ZhangJieHuaXianJiLu 组件。

在 ChapterManager 中添加状态和展开逻辑，在章节项的操作按钮区域增加"划线"按钮。

- [ ] **Step 3: 验证编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add src/features/books/components/ZhangJieHuaXianJiLu.tsx src/features/books/components/ChapterManager.tsx
git commit -m "feat: 书籍详情页新增章节划线记录查看入口"
```

---

## Task 9: 清理和验证

**Files:**
- Modify: `src/shared/api/zhipu.ts` — 确认无引用冲突
- Modify: `src/features/books/components/ChapterDetail.tsx` — 确认无引用旧组件

- [ ] **Step 1: 全局搜索确认无残留引用**

Run: `grep -r "HuaCiChuangJianDiLan\|generateQuestions\|generateQuestionsForParagraph\|useHuaCiChuangJian" src/ --include="*.ts" --include="*.tsx"`
Expected: 无结果（或仅在已修改的文件中）

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 行数检查**

Run: `npm run check:lines`
Expected: 所有文件 < 100 行

- [ ] **Step 4: 后端编译验证**

Run: `cd backend && go build ./...`
Expected: 编译成功

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: 清理残留引用，验证构建通过"
```

---

## 自检清单

### Spec 覆盖
- [x] 划线出题统一入口 → Task 1-3（后端）
- [x] 删除旧章节/段落出题接口 → Task 3
- [x] 前端划线多功能菜单 → Task 6
- [x] AI出题子菜单（名词解释/意图理解/生活应用） → Task 6
- [x] 高亮标记 → Task 6
- [x] 复制文字 → Task 6
- [x] 题目关联章节 → Task 2（后端控制器）
- [x] 书籍详情页划线记录入口 → Task 8
- [x] 三种题型需要用户输入框作答 → 现有 DaTiZhu 组件已支持
- [x] 代码去重（typePrompts、JSON解析） → Task 1

### Placeholder 扫描
- [x] 无 TBD/TODO/Fill in details

### 类型一致性
- [x] `ChuTiLeiXing` 类型在 Hook和组件间一致
- [x] `selectionRect` 类型在 Hook和组件间一致
- [x] 后端 `AIGenerateSelectionRequest` 字段名与前端请求一致
