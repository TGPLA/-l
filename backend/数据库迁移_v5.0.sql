-- 数据库迁移 v5.0
-- 为 books 表添加 epub_file_path 字段，用于存储 EPUB 文件路径

ALTER TABLE books ADD COLUMN epub_file_path VARCHAR(512) DEFAULT NULL COMMENT 'EPUB 文件存储路径';
