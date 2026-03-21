-- 阅读回响应用数据库迁移脚本
-- 版本：v3.0（答题逻辑重构）
-- 变更：新增段落表、提示词模板表，修改题目表

USE reading_reflection;

-- 1. 新增段落表
CREATE TABLE IF NOT EXISTS paragraphs (
    id CHAR(36) PRIMARY KEY COMMENT '段落唯一标识 UUID',
    chapter_id CHAR(36) NOT NULL COMMENT '所属章节 ID',
    user_id CHAR(36) NOT NULL COMMENT '所属用户 ID（冗余字段，便于查询）',
    content TEXT NOT NULL COMMENT '段落文本内容',
    order_index INT DEFAULT 0 COMMENT '排序序号（从小到大）',
    question_count INT DEFAULT 0 COMMENT '该段落的题目数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_paragraphs_chapter_id (chapter_id),
    INDEX idx_paragraphs_user_id (user_id),
    INDEX idx_paragraphs_order (chapter_id, order_index),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='段落表';

-- 2. 新增提示词模板表
CREATE TABLE IF NOT EXISTS prompt_templates (
    id CHAR(36) PRIMARY KEY COMMENT '模板唯一标识 UUID',
    user_id CHAR(36) COMMENT '所属用户 ID（NULL 表示系统预设模板）',
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    question_type VARCHAR(50) NOT NULL COMMENT '题型：名词解释/意图理解/生活应用',
    content TEXT NOT NULL COMMENT '提示词内容',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否为默认模板：0-否，1-是',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否为系统模板：0-用户创建，1-系统预设',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_prompt_templates_user_id (user_id),
    INDEX idx_prompt_templates_question_type (question_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提示词模板表';

-- 3. 修改题目表：添加段落关联
ALTER TABLE questions 
ADD COLUMN paragraph_id CHAR(36) COMMENT '所属段落 ID' AFTER chapter_id,
ADD INDEX idx_questions_paragraph_id (paragraph_id),
ADD CONSTRAINT fk_questions_paragraph FOREIGN KEY (paragraph_id) REFERENCES paragraphs(id) ON DELETE CASCADE;

-- 4. 修改题目表：调整题型字段
ALTER TABLE questions 
MODIFY COLUMN question_type VARCHAR(50) NOT NULL COMMENT '题目类型：名词解释/意图理解/生活应用';

-- 5. 删除不再需要的字段
ALTER TABLE questions 
DROP COLUMN category,
DROP COLUMN options,
DROP COLUMN correct_index,
DROP COLUMN explanation;

-- 6. 插入系统预设提示词模板
INSERT INTO prompt_templates (id, user_id, name, question_type, content, is_default, is_system) VALUES
(UUID(), NULL, '名词解释-标准模板', '名词解释', 
'你是一位专业的知识讲解老师。请根据以下段落内容，生成一道名词解释题。

【段落内容】
{{content}}

【要求】
1. 选择段落中的一个重要概念或术语
2. 题目格式：请解释"XXX"的含义
3. 答案应包含：定义、特点、应用场景
4. 答案长度：100-200字

请以JSON格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}', 1, 1),

(UUID(), NULL, '意图理解-标准模板', '意图理解',
'你是一位专业的阅读理解老师。请根据以下段落内容，生成一道意图理解题。

【段落内容】
{{content}}

【要求】
1. 针对段落的核心思想或作者意图提问
2. 题目格式：作者在这里想要表达什么？/这段话的核心观点是什么？
3. 答案应包含：核心观点、论证逻辑、深层含义
4. 答案长度：100-200字

请以JSON格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}', 1, 1),

(UUID(), NULL, '生活应用-标准模板', '生活应用',
'你是一位专业的应用指导老师。请根据以下段落内容，生成一道生活应用题。

【段落内容】
{{content}}

【要求】
1. 将段落知识与实际生活场景结合
2. 题目格式：在生活中，如何应用XXX？/请举一个XXX的实际应用例子
3. 答案应包含：应用场景、具体步骤、注意事项
4. 答案长度：100-200字

请以JSON格式返回：
{
  "question": "题目内容",
  "answer": "答案内容"
}', 1, 1);

-- 7. 更新章节表：添加段落统计字段
ALTER TABLE chapters
ADD COLUMN paragraph_count INT DEFAULT 0 COMMENT '段落数量' AFTER question_count;
