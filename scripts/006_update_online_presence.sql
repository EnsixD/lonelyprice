-- Update online presence table to better handle unique sessions
-- Drop old table if exists
DROP TABLE IF EXISTS online_presence CASCADE;

-- Recreate table with better structure
CREATE TABLE IF NOT EXISTS online_presence (
  session_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска активных сессий
CREATE INDEX IF NOT EXISTS idx_online_presence_last_seen ON online_presence(last_seen);
CREATE INDEX IF NOT EXISTS idx_online_presence_user_id ON online_presence(user_id);

-- Функция для очистки старых сессий (неактивных более 2 минут)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM online_presence 
  WHERE last_seen < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS политики
ALTER TABLE online_presence ENABLE ROW LEVEL SECURITY;

-- Все могут читать количество онлайн пользователей
CREATE POLICY "Anyone can view online count"
  ON online_presence
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Все могут управлять своей сессией
CREATE POLICY "Anyone can manage presence"
  ON online_presence
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
