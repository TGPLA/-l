-- 数据库迁移 v6.0 - 修复封面字段长度限制
-- 问题：cover_url 字段为 VARCHAR(512)，无法存储 base64 编码的封面图片
-- 解决：将 cover_url 字段类型改为 TEXT

USE reading_reflection;

-- 修改 books 表的 cover_url 字段类型
ALTER TABLE books MODIFY COLUMN cover_url TEXT COMMENT '封面图片 URL 或 base64 数据';

-- 验证修改
DESCRIBE books;
