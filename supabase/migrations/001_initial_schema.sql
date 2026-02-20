-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建书籍表
CREATE TABLE books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  mastered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建题目表
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('选择题', '主观题')),
  category TEXT NOT NULL CHECK (category IN ('standard', 'concept')),
  answer TEXT NOT NULL,
  options TEXT[],
  correct_index INTEGER,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT '中等' CHECK (difficulty IN ('基础', '中等', '进阶', '挑战')),
  knowledge_point TEXT,
  mastery_level TEXT NOT NULL DEFAULT '未掌握' CHECK (mastery_level IN ('未掌握', '学习中', '已掌握')),
  practice_count INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户设置表
CREATE TABLE user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_book_id ON questions(book_id);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_mastery_level ON questions(mastery_level);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为books表添加更新时间戳触发器
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为questions表添加更新时间戳触发器
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为user_settings表添加更新时间戳触发器
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的数据
CREATE POLICY "Users can view their own books" ON books
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books" ON books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON books
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON books
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own questions" ON questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON questions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" ON questions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);
