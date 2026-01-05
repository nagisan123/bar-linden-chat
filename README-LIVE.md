# BAR LINDEN - Supabase版（実際に動作するチャットサイト）

このフォルダには、Supabaseを使用して実際に動作するチャットサイトが含まれています。

## 🎯 このフォルダについて

- **静的保存版**: `site/` フォルダ（保存されたチャットログを閲覧）
- **Supabase版**: `live-site/` フォルダ（実際に動作するチャット）← **このフォルダ**

## 📁 ファイル構成

```
live-site/
├── live-index.html          # メインチャットページ（Supabase版）
├── js/
│   └── supabase-client.js  # Supabaseクライアント
├── supabase-setup.sql      # データベーススキーマ
├── SETUP.md                # 詳細なセットアップガイド
├── chat_files/             # リソースファイル
├── adm/                    # 管理画面
└── README-LIVE.md          # このファイル
```

## 🚀 クイックスタート

### 1. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQL Editorで`supabase-setup.sql`を実行
3. Project URLとanon keyを取得

### 2. 設定ファイルを編集

`js/supabase-client.js`を開いて以下を編集：

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Realtimeを有効化

Supabaseダッシュボードで以下のテーブルのRealtimeを有効化：
- `chat_messages`
- `online_users`

### 4. デプロイ

Netlify、Vercel、GitHub Pagesなどにデプロイ

**詳細は `SETUP.md` を参照してください。**

## ✨ 実装済み機能

### チャット機能
- ✅ **リアルタイムメッセージ送受信**（Supabase Realtime）
- ✅ **ユーザー入室/退室**
- ✅ **オンラインユーザー表示**
- ✅ **文字色変更**（23色）
- ✅ **プライベートメッセージ（PM）**
- ✅ **自動ハートビート**（5秒ごと）

### データベース
- ✅ **chat_messages** - チャットメッセージ保存
- ✅ **online_users** - オンラインユーザー管理
- ✅ **chat_config** - サイト設定保存
- ✅ **admins** - 管理者認証

### セキュリティ
- ✅ **Row Level Security (RLS)** 設定済み
- ✅ 管理者認証（ID/パス: 184k）

## 🔧 使い方

### ローカルテスト

```bash
cd live-site
python -m http.server 8000
```

→ `http://localhost:8000` にアクセス（index.html → chat.htmlへ）

### 本番デプロイ

#### Netlify
```bash
# live-siteフォルダをドラッグ&ドロップ
```

#### Vercel
```bash
vercel --prod
```

#### GitHub Pages
```bash
git add .
git commit -m "Deploy BAR LINDEN"
git push origin main
```

## 📊 データベース構造

### chat_messages
| カラム | 型 | 説明 |
|--------|-----|------|
| id | BIGSERIAL | メッセージID |
| user_id | TEXT | ユーザーID |
| user_name | TEXT | ユーザー名 |
| message | TEXT | メッセージ内容 |
| color | TEXT | 文字色 |
| is_pm | BOOLEAN | PM判定 |
| created_at | TIMESTAMP | 投稿日時 |

### online_users
| カラム | 型 | 説明 |
|--------|-----|------|
| id | BIGSERIAL | レコードID |
| user_id | TEXT | ユーザーID |
| user_name | TEXT | ユーザー名 |
| user_comment | TEXT | コメント |
| last_seen | TIMESTAMP | 最終アクティブ |
| entered_at | TIMESTAMP | 入室時刻 |

## 🎨 カスタマイズ

### 色の変更

`live-index.html`のCSSセクション：

```css
body {
 background-color: #000000;  /* 背景色 */
 color: #9fc24d;             /* 文字色 */
}
```

### サイト情報の変更

Supabaseの`chat_config`テーブルを編集

## 🔐 管理画面

- **URL**: `adm/index.html`
- **ID**: `184k`
- **パスワード**: `184k`

## 📝 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Supabase (PostgreSQL)
- **リアルタイム**: Supabase Realtime
- **認証**: セッションベース
- **ホスティング**: Netlify/Vercel/GitHub Pages

## 🐛 トラブルシューティング

### メッセージが表示されない
1. Supabase認証情報を確認
2. Realtimeが有効か確認
3. ブラウザコンソールでエラーを確認

### ユーザーが表示されない
1. `online_users`テーブルのRLSポリシーを確認
2. ハートビートが動作しているか確認

### 接続エラー
1. SUPABASE_URLが正しいか確認
2. SUPABASE_ANON_KEYが正しいか確認

## 📚 ドキュメント

- **SETUP.md** - 詳細なセットアップガイド
- **supabase-setup.sql** - データベーススキーマ
- **js/supabase-client.js** - APIリファレンス（コメント付き）

## 🎯 今後の拡張可能機能

- [ ] アイコン機能
- [ ] ファイルアップロード（Supabase Storage）
- [ ] ユーザーバン機能
- [ ] メッセージ検索
- [ ] プッシュ通知
- [ ] ログエクスポート
- [ ] テーマ切り替え

## 📞 サポート

問題が発生した場合は、ブラウザのコンソールログとSupabaseダッシュボードのログを確認してください。

---

**元のサイト**: BAR LINDEN (501ichihashi.chatx2.whocares.jp)  
**再構築**: Supabase版 - 2026年1月5日
