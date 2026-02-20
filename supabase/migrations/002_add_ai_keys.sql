-- 添加 AI API 配置字段到 user_settings 表
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS zhipu_api_key TEXT,
ADD COLUMN IF NOT EXISTS zhipu_model TEXT DEFAULT 'glm-4',
ADD COLUMN IF NOT EXISTS dify_api_key TEXT,
ADD COLUMN IF NOT EXISTS question_workflow_url TEXT,
ADD COLUMN IF NOT EXISTS correction_workflow_url TEXT;