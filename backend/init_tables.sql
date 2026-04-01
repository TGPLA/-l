-- 阅读回响应用数据库表结构初始化脚本
-- 仅创建表结构（数据库和用户已创建）

USE reading_reflection;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY COMMENT '用户唯一标识 UUID',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '用户邮箱，用于登录',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值（bcrypt）',
    nickname VARCHAR(100) COMMENT '用户昵称',
    avatar_url VARCHAR(512) COMMENT '头像 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS books (
    id CHAR(36) PRIMARY KEY COMMENT '书籍唯一标识 UUID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID',
    title VARCHAR(255) NOT NULL COMMENT '书名',
    author VARCHAR(255) NOT NULL COMMENT '作者',
    cover_url TEXT COMMENT '封面图片 URL 或 base64 数据',
    description TEXT COMMENT '书籍简介',
    chapter_count INT DEFAULT 0 COMMENT '章节数量',
    question_count INT DEFAULT 0 COMMENT '题目总数',
    mastered_count INT DEFAULT 0 COMMENT '已掌握题目数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_books_user_id (user_id),
    INDEX idx_books_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍表';

CREATE TABLE IF NOT EXISTS chapters (
    id CHAR(36) PRIMARY KEY COMMENT '章节唯一标识 UUID',
    book_id CHAR(36) NOT NULL COMMENT '所属书籍 ID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID（冗余字段，便于查询）',
    title VARCHAR(255) NOT NULL COMMENT '章节标题',
    content TEXT NOT NULL COMMENT '章节文本内容（用于生成题目）',
    order_index INT DEFAULT 0 COMMENT '排序序号（从小到大）',
    question_count INT DEFAULT 0 COMMENT '该章节的题目数量',
    mastered_count INT DEFAULT 0 COMMENT '该章节已掌握题目数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_chapters_book_id (book_id),
    INDEX idx_chapters_user_id (user_id),
    INDEX idx_chapters_order (book_id, order_index),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节表';

CREATE TABLE IF NOT EXISTS questions (
    id CHAR(36) PRIMARY KEY COMMENT '题目唯一标识 UUID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID',
    book_id CHAR(36) NOT NULL COMMENT '所属书籍 ID（冗余字段，便于查询）',
    chapter_id CHAR(36) NOT NULL COMMENT '所属章节 ID',
    question TEXT NOT NULL COMMENT '题目内容',
    question_type VARCHAR(50) NOT NULL COMMENT '题目类型：名词解释/作者意图/生活应用',
    category VARCHAR(50) NOT NULL COMMENT '题目分类',
    answer TEXT NOT NULL COMMENT '答案解析',
    options JSON COMMENT '选项（选择题时使用）',
    correct_index INT COMMENT '正确选项索引（选择题时使用）',
    explanation TEXT COMMENT '详细解释',
    difficulty VARCHAR(50) NOT NULL COMMENT '难度等级：简单/中等/困难',
    knowledge_point VARCHAR(255) COMMENT '相关知识点',
    mastery_level VARCHAR(50) DEFAULT '未掌握' COMMENT '掌握程度：未掌握/学习中/已掌握',
    practice_count INT DEFAULT 0 COMMENT '练习次数',
    last_practiced_at TIMESTAMP NULL COMMENT '最后练习时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_questions_user_id (user_id),
    INDEX idx_questions_book_id (book_id),
    INDEX idx_questions_chapter_id (chapter_id),
    INDEX idx_questions_created_at (created_at DESC),
    INDEX idx_questions_mastery_level (mastery_level),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表';

CREATE TABLE IF NOT EXISTS user_settings (
    id CHAR(36) PRIMARY KEY COMMENT '设置唯一标识 UUID',
    user_id CHAR(36) UNIQUE NOT NULL COMMENT '所属用户 ID',
    dark_mode TINYINT(1) DEFAULT 0 COMMENT '深色模式开关：0-关闭，1-开启',
    zhipu_api_key VARCHAR(255) COMMENT '智谱 AI API Key',
    zhipu_model VARCHAR(100) DEFAULT 'glm-4-flash' COMMENT '智谱 AI 模型名称',
    dify_api_key VARCHAR(255) COMMENT 'Dify API Key',
    question_workflow_url VARCHAR(512) COMMENT 'Dify 问题生成工作流 URL',
    correction_workflow_url VARCHAR(512) COMMENT 'Dify 答案批改工作流 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_settings_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表';

CREATE TABLE IF NOT EXISTS practice_records (
    id CHAR(36) PRIMARY KEY COMMENT '记录唯一标识 UUID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID',
    question_id CHAR(36) NOT NULL COMMENT '题目 ID',
    user_answer TEXT COMMENT '用户答案',
    is_correct TINYINT(1) COMMENT '是否正确：0-错误，1-正确',
    ai_evaluation TEXT COMMENT 'AI 评价内容',
    practice_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '练习时间',
    INDEX idx_practice_user_id (user_id),
    INDEX idx_practice_question_id (question_id),
    INDEX idx_practice_at (practice_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='练习记录表';

CREATE TABLE IF NOT EXISTS concepts (
    id CHAR(36) PRIMARY KEY COMMENT '概念唯一标识 UUID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID',
    source_type VARCHAR(50) NOT NULL COMMENT '来源类型：chapter/paragraph',
    source_id CHAR(36) NOT NULL COMMENT '来源 ID（章节或段落 ID）',
    concept VARCHAR(255) NOT NULL COMMENT '概念名称',
    explanation TEXT NOT NULL COMMENT '概念解释',
    order_index INT DEFAULT 0 COMMENT '排序序号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_concepts_user_id (user_id),
    INDEX idx_concepts_source (source_type, source_id),
    INDEX idx_concepts_created_at (created_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='概念表';

CREATE TABLE IF NOT EXISTS concept_practice_records (
    id CHAR(36) PRIMARY KEY COMMENT '记录唯一标识 UUID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID',
    concept_id CHAR(36) NOT NULL COMMENT '概念 ID',
    user_answer TEXT COMMENT '用户答案',
    ai_evaluation TEXT COMMENT 'AI 评价内容',
    practiced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '练习时间',
    INDEX idx_concept_practice_user_id (user_id),
    INDEX idx_concept_practice_concept_id (concept_id),
    INDEX idx_concept_practice_at (practiced_at DESC),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='概念练习记录表';
