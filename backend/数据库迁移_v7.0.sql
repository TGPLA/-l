-- 数据库迁移 v7.0
-- 功能：在 questions 表中添加 annotation_id 字段，关联到 annotations 表
-- 日期：2026-04-12

USE reading_reflection;

-- 添加 annotation_id 列到 questions 表
ALTER TABLE questions 
ADD COLUMN annotation_id CHAR(36) NULL COMMENT '关联的划线ID' AFTER paragraph_id,
ADD INDEX idx_annotation_id (annotation_id);

-- 注释说明：
-- annotation_id 用于记录题目是从哪个划线生成的
-- 这样用户可以从题目回溯到原文中的划线位置
