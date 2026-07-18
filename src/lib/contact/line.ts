import crypto from 'crypto';

const LINE_API = 'https://api.line.me/v2/bot';

type LineMessage = Record<string, unknown>;

function accessToken(): string {
  const t = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!t) throw new Error('LINE_CHANNEL_ACCESS_TOKEN が未設定です');
  return t;
}

/** push送信（グループ / 1:1 共通）。最大5メッセージ */
export async function pushMessages(to: string, messages: LineMessage[]): Promise<void> {
  const res = await fetch(`${LINE_API}/message/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify({ to, messages }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE push failed (${res.status}): ${body}`);
  }
}

/** reply送信（無料枠を消費しない。承認操作への応答に使用） */
export async function replyMessages(replyToken: string, messages: LineMessage[]): Promise<void> {
  const res = await fetch(`${LINE_API}/message/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken()}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`LINE reply failed (${res.status}): ${body}`);
  }
}

/** Webhook署名検証（X-Line-Signature） */
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function textMessage(text: string): LineMessage {
  return { type: 'text', text };
}

/** 承認／却下ボタン付きconfirmテンプレート */
export function approvalTemplate(id: string): LineMessage {
  return {
    type: 'template',
    altText: 'メッセージの承認確認',
    template: {
      type: 'confirm',
      text: 'このメッセージを グループに送りますか？',
      actions: [
        { type: 'postback', label: '承認', data: `approve:${id}`, displayText: '承認' },
        { type: 'postback', label: '却下', data: `reject:${id}`, displayText: '却下' },
      ],
    },
  };
}
