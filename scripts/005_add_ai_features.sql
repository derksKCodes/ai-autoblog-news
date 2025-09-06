-- Add AI-related columns to content_queue table
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_title TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_content TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_meta_description TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_keywords TEXT[];
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_category TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_image_prompt TEXT;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT FALSE;
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;

-- Create article translations table for multi-language support
CREATE TABLE IF NOT EXISTS article_translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, language)
);

-- Add RLS policies for translations
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published article translations" ON article_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM articles 
            WHERE articles.id = article_translations.article_id 
            AND articles.status = 'published'
        )
    );

CREATE POLICY "Admins can manage article translations" ON article_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                SELECT email FROM admin_users WHERE is_active = true
            )
        )
    );

-- Update content_queue status enum to include AI processing states
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'ai_processed';
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'ai_failed';

-- Create index for AI processing queries
CREATE INDEX IF NOT EXISTS idx_content_queue_ai_processing 
ON content_queue(status, ai_processed) 
WHERE status IN ('pending', 'ai_processed', 'ai_failed');

-- Create index for translation lookups
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup 
ON article_translations(article_id, language);
