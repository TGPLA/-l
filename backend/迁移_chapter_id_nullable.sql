-- 迁移：将 questions 表的 chapter_id 从 NOT NULL 改为允许 NULL
ALTER TABLE questions MODIFY COLUMN chapter_id CHAR(36) NULL COMMENT '所属章节 ID';