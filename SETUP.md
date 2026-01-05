# BAR LINDEN - Supabase版セットアップガイド

このガイドでは、Supabaseを使用してBAR LINDENチャットサイトを稼働させる手順を説明します。

## 📋 必要なもの

- Supabaseアカウント（無料プランでOK）
- ウェブホスティング（Netlify、Vercel、GitHub Pagesなど）

## 🚀 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてログイン
2. 「New Project」をクリック
3. プロジェクト名を入力（例: bar-linden-chat）
4. データベースパスワードを設定
5. リージョンを選択（日本の場合は「Northeast Asia (Tokyo)」推奨）
6. 「Create new project」をクリック

### 2. データベースのセットアップ

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase-setup.sql`ファイルの内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック
4. テーブルが正常に作成されたことを確認

### 3. Supabase認証情報の取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をコピー：
   - **Project URL** (例: https://xxxxx.supabase.co)
   - **anon public key**

### 4. チャットサイトの設定

1. `js/supabase-client.js`を開く
2. 以下の部分を編集：

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // ← Project URLに置き換え
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ← anon public keyに置き換え
```

### 5. Realtimeの有効化

1. Supabaseダッシュボードで「Database」→「Replication」を開く
2. 以下のテーブルでRealtimeを有効化：
   - `chat_messages`
   - `online_users`

### 6. ローカルでテスト

```bash
cd live-site
python -m http.server 8000
```

ブラウザで `http://localhost:8000/live-index.html` を開いて動作確認

### 7. デプロイ

#### Netlifyの場合

1. [Netlify](https://www.netlify.com/)にログイン
2. 「Add new site」→「Deploy manually」
3. `live-site`フォルダをドラッグ&ドロップ
4. デプロイ完了！

#### Vercelの場合

1. [Vercel](https://vercel.com/)にログイン
2. 「New Project」をクリック
3. `live-site`フォルダをインポート
4. デプロイ完了！

#### GitHub Pagesの場合

1. GitHubリポジトリを作成
2. `live-site`フォルダの内容をプッシュ
3. Settings → Pages → Sourceで「main」ブランチを選択
4. デプロイ完了！

## 🔧 カスタマイズ

### サイトタイトル・説明の変更

Supabaseダッシュボードで「Table Editor」→「chat_config」テーブルを編集

### 色の変更

`live-index.html`のCSSセクションで以下を編集：
- `background-color`: 背景色
- `color`: 文字色

### 管理者パスワードの変更

Supabaseダッシュボードで「Table Editor」→「admins」テーブルを編集
（本番環境では必ずbcryptなどでハッシュ化してください）

## 📊 データベース構造

### chat_messages（チャットメッセージ）
- `id`: メッセージID
- `user_id`: ユーザーID
- `user_name`: ユーザー名
- `message`: メッセージ内容
- `color`: 文字色
- `is_pm`: プライベートメッセージか
- `created_at`: 投稿日時

### online_users（オンラインユーザー）
- `id`: レコードID
- `user_id`: ユーザーID
- `user_name`: ユーザー名
- `user_comment`: コメント
- `last_seen`: 最終アクティブ時刻
- `entered_at`: 入室時刻

### chat_config（チャット設定）
- `config_key`: 設定キー
- `config_value`: 設定値（JSON）

## ⚙️ 機能

### 実装済み
- ✅ リアルタイムチャット
- ✅ ユーザー入室/退室
- ✅ オンラインユーザー表示
- ✅ 文字色変更（23色）
- ✅ プライベートメッセージ（PM）
- ✅ 自動ハートビート（5秒ごと）
- ✅ 管理画面ログイン

### 今後の拡張可能機能
- アイコン機能
- ファイルアップロード（Supabase Storage使用）
- ユーザーバン機能
- メッセージ検索
- 通知機能

## 🔒 セキュリティ

### 本番環境での推奨設定

1. **Row Level Security (RLS)** を適切に設定
2. 管理者パスワードを**bcryptでハッシュ化**
3. **HTTPS**を使用（Netlify/Vercelは自動）
4. **環境変数**でSupabase認証情報を管理

### 環境変数の使用（推奨）

`js/supabase-client.js`を以下のように変更：

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## 🐛 トラブルシューティング

### メッセージが表示されない
- Realtimeが有効化されているか確認
- ブラウザのコンソールでエラーを確認
- Supabase認証情報が正しいか確認

### ユーザーが表示されない
- `online_users`テーブルのRLSポリシーを確認
- ハートビートが動作しているか確認

### 接続エラー
- Supabase URLが正しいか確認
- anon keyが正しいか確認
- ネットワーク接続を確認

## 📞 サポート

問題が発生した場合：
1. ブラウザのコンソールログを確認
2. Supabaseダッシュボードのログを確認
3. `supabase-setup.sql`が正しく実行されたか確認

## 📝 ライセンス

このプロジェクトは元のBAR LINDENチャットサイトのアーカイブをベースに、
Supabaseを使用して再構築したものです。
