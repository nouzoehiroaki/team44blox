/**
 * メッセージフォームのレート制限・重複チェックをリセットする開発用スクリプト
 * 使い方: npm run contact:reset
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from 'redis';

function loadUrl() {
  if (process.env.KV_REDIS_URL) return process.env.KV_REDIS_URL;
  if (existsSync('.env.local')) {
    const env = readFileSync('.env.local', 'utf8');
    const m = env.match(/^KV_REDIS_URL\s*=\s*"?([^"\r\n]+)"?/m);
    if (m) return m[1];
  }
  throw new Error('KV_REDIS_URL が見つかりません（.env.local を確認してください）');
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
