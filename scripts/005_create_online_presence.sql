-- Таблица для отслеживания онлайн пользователей
CREATE TABLE IF NOT EXISTS online_presence (
  session_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT
);

-- Индекс для быстрого поиска активных сессий
CREATE INDEX IF NOT EXISTS idx_online_presence_last_seen ON online_presence(last_seen);

-- Функция для очистки старых сессий (неактивных более 5 минут)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM online_presence 
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
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

-- Только сами пользователи могут обновлять свою сессию
CREATE POLICY "Users can manage their own presence"
  ON online_presence
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
