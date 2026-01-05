# GitHub Pagesデプロイ手順

## 前提条件
- GitHubアカウントがあること
- Gitがインストールされていること
- Supabase接続情報が設定済みであること

## 手順

### 1. GitHubリポジトリを作成

1. https://github.com にアクセス
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `bar-linden-chat`）
4. Public または Private を選択
5. 「Create repository」をクリック

### 2. ローカルでGitリポジトリを初期化

PowerShellまたはコマンドプロンプトで以下を実行：

```powershell
cd c:\Users\owlta\Downloads\whocares_chatx2\live-site

# Gitリポジトリを初期化
git init

# .gitignoreファイルを作成（任意）
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: BAR LINDEN Supabase版"
```

### 3. GitHubリポジトリにプッシュ

GitHubで作成したリポジトリのURLを使用：

```powershell
# リモートリポジトリを追加（YOUR_USERNAMEとYOUR_REPOを実際の値に変更）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 4. GitHub Pagesを有効化

1. GitHubのリポジトリページにアクセス
2. 「Settings」タブをクリック
3. 左サイドバーの「Pages」をクリック
4. 「Source」で「Deploy from a branch」を選択
5. 「Branch」で「main」を選択
6. フォルダは「/ (root)」を選択
7. 「Save」をクリック

### 5. デプロイ完了を待つ

- 数分後、ページ上部に「Your site is live at https://YOUR_USERNAME.github.io/YOUR_REPO/」と表示されます
- このURLにアクセスしてサイトを確認

## 注意事項

### リソースパスの確認

GitHub Pagesでは、リポジトリ名がパスに含まれます。
もし画像やCSSが読み込まれない場合は、以下を確認：

- `index.html`と`chat.html`のリソースパスが相対パス（`./chat_files/`など）になっているか確認
- 絶対パス（`/chat_files/`）の場合は相対パスに変更

### カスタムドメインの設定（任意）

独自ドメインを使用する場合：

1. Settings → Pages → Custom domain に独自ドメインを入力
2. DNSプロバイダーでCNAMEレコードを設定
3. 詳細: https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site

## 更新方法

ファイルを変更した後、以下のコマンドで更新をプッシュ：

```powershell
cd c:\Users\owlta\Downloads\whocares_chatx2\live-site

git add .
git commit -m "更新内容の説明"
git push
```

数分後、GitHub Pagesに反映されます。

## トラブルシューティング

### サイトが表示されない
- GitHub Pagesの設定で正しいブランチとフォルダが選択されているか確認
- リポジトリがPublicになっているか確認（Privateの場合はGitHub Pro必要）

### 画像やCSSが読み込まれない
- ブラウザの開発者ツール（F12）でエラーを確認
- リソースパスが相対パスになっているか確認

### Supabaseに接続できない
- `js/supabase-client.js`の接続情報が正しいか確認
- Supabaseのプロジェクトが有効か確認
- ブラウザのコンソールでエラーメッセージを確認

## 完了

デプロイが完了すると、以下のURLでアクセスできます：

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

リアルタイムチャットが動作します！
