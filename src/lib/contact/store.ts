import { createClient } from 'redis';
import crypto from 'crypto';

/** 承認待ちメッセージ */
export type PendingMessage = {
  id: string;
  name: string;
  message: string;
  country: string;
  flags: string[]; // 要注意フラグ（海外IP・非日本語・NGワード等）
  createdAt: number;
};

const TOKEN_TTL = 60 * 15; // 15分
const PENDING_TTL = 60 * 60 * 24 * 7; // 7日
const IP_LIMIT = 2; // 件/時
const GLOBAL_LIMIT = 20; // 件/日

/** Redis接続情報の有無（ローカル開発ではない場合がある） */
const kvAvailable = !!process.env.KV_REDIS_URL;
if (!kvAvailable) {
  console.warn('[contact] KV_REDIS_URL未設定のためフォールバックモードで動作します（レート制限等は無効）');
}

// サーバーレスのウォーム間で使い回すシングルトン接続
type RedisClient = ReturnType<typeof createClient>;
let clientPromise: Promise<RedisClient> | null = null;

function getRedis(): Promise<RedisClient> {
  if (!clientPromise) {
    const client = createClient({ url: process.env.KV_REDIS_URL });
    client.on('error', (e) => console.error('[contact] redis error:', e));
    clientPromise = client.connect().then(() => client) as Promise<RedisClient>;
  }
  return clientPromise;
}

// ---- ワンタイムトークン ----

export async function issueToken(): Promise<string> {
  if (!kvAvailable) return `dev.${Date.now()}`;
  const redis = await getRedis();
  const token = crypto.randomUUID();
  await redis.set(`contact:token:${token}`, String(Date.now()), { EX: TOKEN_TTL });
  return token;
}

/** トークンを消費して発行時刻を返す（無効ならnull） */
export async function consumeToken(token: string): Promise<number | null> {
  if (!token || token.length > 64) return null;
  if (!kvAvailable) {
    const m = token.match(/^dev\.(\d+)$/);
    return m ? Number(m[1]) : null;
  }
  const redis = await getRedis();
  const issuedAt = await redis.getDel(`contact:token:${token}`);
  return issuedAt ? Number(issuedAt) : null;
}

// ---- 承認待ち ----

export async function savePending(msg: PendingMessage): Promise<void> {
  if (!kvAvailable) {
    console.log('[contact] (fallback) pending message:', JSON.stringify(msg, null, 2));
    return;
  }
  const redis = await getRedis();
  await redis.set(`contact:msg:${msg.id}`, JSON.stringify(msg), { EX: PENDING_TTL });
}

/** 取得と同時に削除（二重承認防止） */
export async function takePending(id: string): Promise<PendingMessage | null> {
  if (!kvAvailable) return null;
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const redis = await getRedis();
  const raw = await redis.getDel(`contact:msg:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingMessage;
  } catch {
    return null;
  }
}

// ---- レート制限 ----

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`44blox:${ip}`).digest('hex').slice(0, 16);
}

/** 超過していたら false */
export async function checkIpRate(ipHash: string): Promise<boolean> {
  if (!kvAvailable) return true;
  const redis = await getRedis();
  const key = `contact:rl:ip:${ipHash}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 3600);
  return n <= IP_LIMIT;
}

export async function checkGlobalRate(): Promise<boolean> {
  if (!kvAvailable) return true;
  const redis = await getRedis();
  const day = new Date().toISOString().slice(0, 10);
  const key = `contact:rl:global:${day}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 86400 * 2);
  return n <= GLOBAL_LIMIT;
}

/** 同一本文の重複（24時間）。重複なら false */
export async function checkDuplicate(message: string): Promise<boolean> {
  if (!kvAvailable) return true;
  const redis = await getRedis();
  const hash = crypto.createHash('sha256').update(message).digest('hex').slice(0, 24);
  const ok = await redis.set(`contact:dup:${hash}`, '1', { NX: true, EX: 86400 });
  return ok === 'OK';
}

// ---- キルスイッチ ----

/** 受付停止中なら true（Redisに contact:paused = 1 を置くと停止） */
export async function isPaused(): Promise<boolean> {
  if (!kvAvailable) return false;
  const redis = await getRedis();
  const v = await redis.get('contact:paused');
  return v === '1';
}

// ---- ID取得支援（M0） ----

export async function rememberDebugSource(kind: 'user' | 'group', id: string): Promise<void> {
  if (!kvAvailable) return;
  const redis = await getRedis();
  await redis.set(`contact:debug:last${kind === 'user' ? 'UserId' : 'GroupId'}`, id, { EX: 86400 });
}
