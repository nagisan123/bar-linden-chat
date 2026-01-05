// Supabase クライアント設定
// 使用前に SUPABASE_URL と SUPABASE_ANON_KEY を設定してください

const SUPABASE_URL = 'https://qdwzvpbaxvmlbwloelas.supabase.co'; // 例: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd3p2cGJheHZtbGJ3bG9lbGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjI1MjAsImV4cCI6MjA4MzE5ODUyMH0.MZqPOpNOZrWHQVDGomP5LAhwmtaj33ZaPviq1i2rM1k
';

// Supabaseクライアントの初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 現在のユーザー情報
let currentUser = {
    id: null,
    name: '',
    comment: '',
    url: '',
    color: '#7d7d7d',
    denyPm: false
};

// チャット機能クラス
class SupabaseChat {
    constructor() {
        this.messageSubscription = null;
        this.userSubscription = null;
        this.heartbeatInterval = null;
    }

    // 初期化
    async init() {
        console.log('Supabase Chat init() called');
        try {
            // 既存のメッセージを読み込み
            console.log('Loading messages...');
            await this.loadMessages();
            
            // オンラインユーザーを読み込み
            console.log('Loading online users...');
            await this.loadOnlineUsers();
            
            // リアルタイム購読を開始
            console.log('Subscribing to realtime...');
            this.subscribeToMessages();
            this.subscribeToUsers();
            
            // ハートビート開始（5秒ごと）
            this.startHeartbeat();
            
            console.log('Supabase Chat initialized successfully');
        } catch (error) {
            console.error('Supabase Chat init error:', error);
            throw error;
        }
    }

    // メッセージ読み込み
    async loadMessages(limit = 100) {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // メッセージを表示（降順なので逆順にする）
            data.reverse().forEach(msg => this.displayMessage(msg));
        } catch (error) {
            console.error('メッセージ読み込みエラー:', error);
        }
    }

    // オンラインユーザー読み込み
    async loadOnlineUsers() {
        try {
            const { data, error } = await supabase
                .from('online_users')
                .select('*')
                .order('entered_at', { ascending: true });

            if (error) throw error;

            this.updateUserList(data);
        } catch (error) {
            console.error('ユーザー読み込みエラー:', error);
        }
    }

    // メッセージのリアルタイム購読
    subscribeToMessages() {
        this.messageSubscription = supabase
            .channel('chat_messages')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    this.displayMessage(payload.new);
                }
            )
            .subscribe();
    }

    // ユーザーのリアルタイム購読
    subscribeToUsers() {
        this.userSubscription = supabase
            .channel('online_users')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'online_users' },
                async () => {
                    await this.loadOnlineUsers();
                }
            )
            .subscribe();
    }

    // 入室
    async enter(name, comment = '', url = '', denyPm = false) {
        console.log('Enter called:', { name, comment, url, denyPm });
        try {
            // ユーザーIDを生成（セッションベース）
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            console.log('Generated user ID:', userId);
            
            currentUser = {
                id: userId,
                name: name,
                comment: comment,
                url: url,
                color: '#7d7d7d',
                denyPm: denyPm
            };

            // オンラインユーザーに追加
            console.log('Inserting user to online_users...');
            const { error } = await supabase
                .from('online_users')
                .insert([{
                    user_id: userId,
                    user_name: name,
                    user_comment: comment,
                    user_url: url,
                    color: currentUser.color,
                    deny_pm: denyPm
                }]);

            if (error) {
                console.error('Insert user error:', error);
                throw error;
            }
            
            console.log('User inserted successfully');

            // 入室メッセージを投稿
            console.log('Sending system message...');
            await this.sendSystemMessage(`${name}さんがご来店しました`);

            console.log('Enter completed successfully');
            return true;
        } catch (error) {
            console.error('入室エラー:', error);
            alert('入室に失敗しました: ' + error.message);
            return false;
        }
    }

    // 退室
    async exit() {
        if (!currentUser.id) return;

        try {
            // 退室メッセージを投稿
            await this.sendSystemMessage(`${currentUser.name}さんがご帰宅されました`);

            // オンラインユーザーから削除
            await supabase
                .from('online_users')
                .delete()
                .eq('user_id', currentUser.id);

            // ハートビート停止
            this.stopHeartbeat();

            currentUser.id = null;
        } catch (error) {
            console.error('退室エラー:', error);
        }
    }

    // メッセージ送信
    async sendMessage(message, color = null, pmTo = null) {
        console.log('Send message called:', { message, color, pmTo, currentUser });
        if (!currentUser.id || !message.trim()) {
            console.warn('Cannot send message: no user or empty message');
            return false;
        }

        try {
            console.log('Inserting message to chat_messages...');
            const { error } = await supabase
                .from('chat_messages')
                .insert([{
                    user_id: currentUser.id,
                    user_name: currentUser.name,
                    user_comment: currentUser.comment,
                    message: message,
                    color: color || currentUser.color,
                    is_pm: !!pmTo,
                    pm_to: pmTo
                }]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('メッセージ送信エラー:', error);
            return false;
        }
    }

    // システムメッセージ送信
    async sendSystemMessage(message) {
        try {
            await supabase
                .from('chat_messages')
                .insert([{
                    user_id: 'system',
                    user_name: 'システム',
                    user_comment: '',
                    message: message,
                    color: '#9fc24d',
                    is_pm: false
                }]);
        } catch (error) {
            console.error('システムメッセージエラー:', error);
        }
    }

    // メッセージ表示
    displayMessage(msg) {
        const contentDiv = document.getElementById('content');
        if (!contentDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'log1 clog';
        
        const timestamp = new Date(msg.created_at);
        const timeStr = `${String(timestamp.getMonth() + 1).padStart(2, '0')}/${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}`;

        messageDiv.style.color = msg.color;
        
        if (msg.user_id === 'system') {
            messageDiv.className += ' logInfo';
            messageDiv.innerHTML = `<span class="logContent">${this.escapeHtml(msg.message)}</span>`;
        } else {
            messageDiv.innerHTML = `
                <span class="logUser">${this.escapeHtml(msg.user_name)}：</span>
                <span class="logContent">
                    <span class="logMsg">${this.escapeHtml(msg.message)}</span>
                    <span class="logInfo">(<span class="logTs">${timeStr}</span>)</span>
                </span>
            `;
        }

        contentDiv.appendChild(messageDiv);
        
        // 自動スクロール
        const contentWrap = document.getElementById('contentWrap');
        if (contentWrap) {
            contentWrap.scrollTop = contentWrap.scrollHeight;
        }
    }

    // ユーザーリスト更新
    updateUserList(users) {
        const condUser = document.getElementById('in');
        const usersSpan = document.getElementById('users');
        
        if (condUser) {
            condUser.textContent = users.length;
        }

        if (usersSpan) {
            const userLinks = users.map(u => 
                `<a href="javascript:void(0)">${this.escapeHtml(u.user_name)}</a>`
            ).join(', ');
            usersSpan.innerHTML = `&nbsp;(${userLinks})&nbsp;`;
        }

        // PMセレクトボックス更新
        this.updatePmSelect(users);
    }

    // PMセレクトボックス更新
    updatePmSelect(users) {
        const pmSelect = document.getElementById('pmDmy');
        if (!pmSelect) return;

        pmSelect.innerHTML = '<option value="" selected></option>';
        
        users.forEach(u => {
            if (u.user_id !== currentUser.id) {
                const option = document.createElement('option');
                option.value = u.user_id;
                option.textContent = u.user_name;
                pmSelect.appendChild(option);
            }
        });

        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '来店者全員';
        pmSelect.appendChild(allOption);
    }

    // ハートビート開始
    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            if (currentUser.id) {
                await supabase
                    .from('online_users')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('user_id', currentUser.id);
            }
        }, 5000);
    }

    // ハートビート停止
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // HTMLエスケープ
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // クリーンアップ
    destroy() {
        if (this.messageSubscription) {
            supabase.removeChannel(this.messageSubscription);
        }
        if (this.userSubscription) {
            supabase.removeChannel(this.userSubscription);
        }
        this.stopHeartbeat();
    }
}

// グローバルインスタンス
const supabaseChat = new SupabaseChat();

// デバッグ用：接続確認
console.log('Supabase Client initialized');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Chat instance:', supabaseChat);
