import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  consumeToken,
  savePending,
  hashIp,
  checkIpRate,
  checkGlobalRate,
  checkDuplicate,
  isPaused,
  PendingMessage,
} from '@/lib/contact/store';
import { pushMessages, textMessage, approvalTemplate } from '@/lib/contact/line';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_ELAPSED_MS = 3000; // 表示から3秒未満はbot判定
const NG_WORDS = ['死ね', '殺す', 'カジノ', 'casino', 'viagra'];

type Body = {
  token?: string;
  name?: string;
  message?: string;
  website?: string; // ハニーポット
  turnstileToken?: string;
};

function err(code: string, message: string, status = 400) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // 未設定環境（ローカル等）はスキップ
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return !!data.success;
}

export async function POST(req: NextRequest) {
  // キルスイッチ
  if (await isPaused()) {
    return err('paused', 'ただいま受付を一時停止しています。', 503);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return err('bad_request', '不正なリクエストです。');
  }

  // ハニーポット（botには成功を装う）
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  // ワンタイムトークン＋時間チェック
  const issuedAt = await consumeToken(body.token ?? '');
  if (issuedAt === null) {
    return err('token', 'フォームの有効期限が切れました。再読み込みしてください。');
  }
  if (Date.now() - issuedAt < MIN_ELAPSED_MS) {
    return err('too_fast', '送信が速すぎます。もう一度お試しください。');
  }

  // 入力検証
  const name = (body.name ?? '').trim();
  const message = (body.message ?? '').trim();
  if (!name || name.length > 30) return err('name', '名前は1〜30文字で入力してください。');
  if (!message || message.length > 500) return err('message', 'メッセージは1〜500文字で入力してください。');

  // 内容フィルタ（URL・メールアドレスは拒否）
  if (/https?:\/\/|www\.|[\w.+-]+@[\w-]+\.[\w.]+/i.test(message)) {
    return err('content', 'URL・メールアドレスは記載できません。');
  }

  // IP・国
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const country = req.headers.get('x-vercel-ip-country') ?? '??';

  // Turnstile
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return err('turnstile', '認証に失敗しました。再読み込みしてください。');
  }

  // レート制限
  if (!(await checkGlobalRate())) {
    return err('rate_global', '本日の受付上限に達しました。また明日お試しください。', 429);
  }
  if (!(await checkIpRate(hashIp(ip)))) {
    return err('rate_ip', '送信が多すぎます。しばらく時間をおいてください。', 429);
  }

  // 重複本文
  if (!(await checkDuplicate(message))) {
    return err('duplicate', '同じ内容のメッセージが送信済みです。');
  }

  // 要注意フラグ
  const flags: string[] = [];
  if (country !== 'JP') flags.push(`海外IP: ${country}`);
  if (!/[぀-ヿ一-鿿]/.test(message)) flags.push('非日本語');
  if (NG_WORDS.some((w) => message.toLowerCase().includes(w.toLowerCase()))) flags.push('NGワード');

  // 保存（TTL 7日）
  const pending: PendingMessage = {
    id: crypto.randomUUID(),
    name,
    message,
    country,
    flags,
    createdAt: Date.now(),
  };
  await savePending(pending);

  // 管理者へ承認依頼を通知
  const adminId = process.env.LINE_ADMIN_USER_ID;
  if (adminId) {
    const flagLine = flags.length ? `\n⚠ ${flags.join(' / ')}` : '';
    const summary =
      `📮 新着メッセージ（承認待ち）\n` +
      `名前: ${pending.name}\n` +
      `国: ${country}${flagLine}\n` +
      `──────\n${pending.message}`;
    try {
      await pushMessages(adminId, [textMessage(summary), approvalTemplate(pending.id)]);
    } catch (e) {
      console.error('[contact] admin notify failed:', e);
      return err('notify', '送信処理に失敗しました。時間をおいてお試しください。', 500);
    }
  } else {
    console.warn('[contact] LINE_ADMIN_USER_ID未設定のため通知をスキップ。pending id:', pending.id);
  }

  return NextResponse.json({ ok: true });
}
