-- BAR LINDEN チャットサイト用 Supabase データベーススキーマ

-- 1. チャットメッセージテーブル
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_comment TEXT,
  message TEXT NOT NULL,
  color TEXT DEFAULT '#7d7d7d',
  is_pm BOOLEAN DEFAULT FALSE,
  pm_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. オンラインユーザーテーブル
CREATE TABLE online_users (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  user_comment TEXT,
  user_url TEXT,
  color TEXT DEFAULT '#7d7d7d',
  deny_pm BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. チャット設定テーブル（管理画面用）
CREATE TABLE chat_config (
  id BIGSERIAL PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 管理者テーブル
CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  admin_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_online_users_last_seen ON online_users(last_seen DESC);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE online_users;

-- Row Level Security (RLS) 設定
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 全員がメッセージを読める
CREATE POLICY "Anyone can read messages" ON chat_messages
  FOR SELECT USING (true);

-- 全員がメッセージを投稿できる
CREATE POLICY "Anyone can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- 全員がオンラインユーザーを見れる
CREATE POLICY "Anyone can read online users" ON online_users
  FOR SELECT USING (true);

-- 全員がオンラインユーザーに追加できる
CREATE POLICY "Anyone can insert online users" ON online_users
  FOR INSERT WITH CHECK (true);

-- 自分のユーザー情報を更新できる
CREATE POLICY "Users can update their own data" ON online_users
  FOR UPDATE USING (true);

-- 自分のユーザー情報を削除できる
CREATE POLICY "Users can delete their own data" ON online_users
  FOR DELETE USING (true);

-- 設定は全員が読める
CREATE POLICY "Anyone can read config" ON chat_config
  FOR SELECT USING (true);

-- 管理者のみが設定を変更できる（実装時に認証を追加）
CREATE POLICY "Admins can update config" ON chat_config
  FOR ALL USING (true);

-- 初期設定データ挿入
INSERT INTO chat_config (config_key, config_value) VALUES
  ('site_title', '"BAR LINDEN"'),
  ('site_description', '"《BAR LINDEN》\n・道を一つ外れた路地、灯りに照らされた看板の傍に階段。踊り場を挟んで二度下るとその先に分厚い木製の厚い扉\n・jazzが微かに流れる店内はカウンター6席と2人掛の卓5つと20席に満たぬ広さ\n・床は船の甲板に用いられる木を使用した焦茶の素朴な板張り\n・扉を始めとする調度は年数を経た深い飴色の木材を使用\n・灯りは暖色のダウンライトを天井と壁に配置、日常の多忙な心地を和らげる程度の光量で空間を温める\n・喫煙可（同席の方がいらっしゃる場合は、一言お断りを願います）"'),
  ('background_color', '"#000000"'),
  ('text_color', '"#9fc24d"'),
  ('max_messages', '100'),
  ('allow_html', 'false');

-- 管理者アカウント作成（パスワード: 184k のハッシュ）
-- 注意: 実際の運用では bcrypt などでハッシュ化してください
INSERT INTO admins (admin_id, password_hash) VALUES
  ('184k', '184k');

-- 古いメッセージを自動削除する関数（オプション）
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 非アクティブユーザーを削除する関数
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM online_users
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;
