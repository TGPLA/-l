-- 数据库迁移脚本 v4.0
-- 新增概念存储功能

USE reading_reflection;

-- 创建 concepts 表
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

-- 创建 concept_practice_records 表
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
