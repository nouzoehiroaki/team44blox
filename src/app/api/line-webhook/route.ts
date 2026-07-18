import { NextRequest, NextResponse } from 'next/server';
import {
  verifyLineSignature,
  pushMessages,
  replyMessages,
  textMessage,
} from '@/lib/contact/line';
import { takePending, rememberDebugSource } from '@/lib/contact/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { type: string; userId?: string; groupId?: string };
  postback?: { data: string };
};

/**
 * LINE Webhook
 * - follow / join / message: userId・groupId をログ出力（M0のID取得支援）
 * - postback approve:<id> / reject:<id>: 承認フロー
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature');
  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { events } = JSON.parse(rawBody) as { events: LineEvent[] };

  for (const event of events ?? []) {
    const src = event.source;

    // --- ID取得支援：Vercelのログで確認できる ---
    if (src?.userId) {
      console.log(`[line-webhook] userId: ${src.userId} (event: ${event.type})`);
      await rememberDebugSource('user', src.userId);
    }
    if (src?.groupId) {
      console.log(`[line-webhook] groupId: ${src.groupId} (event: ${event.type})`);
      await rememberDebugSource('group', src.groupId);
    }

    // --- 承認／却下 ---
    if (event.type === 'postback' && event.postback) {
      const adminId = process.env.LINE_ADMIN_USER_ID;
      // 管理者以外からのpostbackは無視
      if (adminId && src?.userId !== adminId) continue;

      const m = event.postback.data.match(/^(approve|reject):([0-9a-f-]{36})$/);
      if (!m) continue;
      const [, action, id] = m;

      const pending = await takePending(id);
      if (!pending) {
        if (event.replyToken) {
          await replyMessages(event.replyToken, [
            textMessage('このメッセージは処理済みか、期限切れです。'),
          ]);
        }
        continue;
      }

      if (action === 'approve') {
        const groupId = process.env.LINE_GROUP_ID;
        if (!groupId) {
          if (event.replyToken) {
            await replyMessages(event.replyToken, [
              textMessage('LINE_GROUP_ID が未設定のため送信できません。'),
            ]);
          }
          continue;
        }
        const text =
          `📮 44SHOP ファンメッセージ\n` +
          `名前: ${pending.name}\n` +
          `──────\n${pending.message}`;
        try {
          await pushMessages(groupId, [textMessage(text)]);
          if (event.replyToken) {
            await replyMessages(event.replyToken, [textMessage('✅ グループに送信しました。')]);
          }
        } catch (e) {
          console.error('[line-webhook] group push failed:', e);
          if (event.replyToken) {
            await replyMessages(event.replyToken, [textMessage('送信に失敗しました。ログを確認してください。')]);
          }
        }
      } else {
        // 却下（takePendingで既に削除済み）
        if (event.replyToken) {
          await replyMessages(event.replyToken, [textMessage('🗑 却下しました。グループには送信されません。')]);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
