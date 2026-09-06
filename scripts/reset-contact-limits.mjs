/**
 * メッセージフォームのレート制限・重複チェックをリセットする開発用スクリプト
 * 使い方: npm run contact:reset
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from 'redis';

// store.ts と同じ優先順位（Upstash Integration → 旧構成）
const URL_KEYS = ['KV_REDIS_REDIS_URL', 'KV_REDIS_KV_URL', 'KV_REDIS_URL', 'REDIS_URL'];

function loadUrl() {
  for (const key of URL_KEYS) {
    if (process.env[key]) return process.env[key];
  }
  for (const file of ['.env.local', '.env.development.local']) {
    if (!existsSync(file)) continue;
    const env = readFileSync(file, 'utf8');
    for (const key of URL_KEYS) {
      const m = env.match(new RegExp(`^${key}\\s*=\\s*"?([^"\\r\\n]+)"?`, 'm'));
      if (m) return m[1];
    }
  }
  throw new Error(`Redis接続URLが見つかりません（${URL_KEYS.join(' / ')} のいずれかを .env.local に設定してください）`);
}

const client = createClient({ url: loadUrl() });
await client.connect();

const patterns = ['contact:rl:*', 'contact:dup:*'];
let total = 0;
for (const p of patterns) {
  const keys = await client.keys(p);
  for (const k of keys) {
    await client.del(k);
    total++;
  }
}
console.log(`リセット完了: ${total}件のキーを削除しました`);
await client.quit();
