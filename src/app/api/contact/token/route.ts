import { NextResponse } from 'next/server';
import { issueToken, isPaused } from '@/lib/contact/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** フォーム表示時に呼ぶワンタイムトークン発行（15分有効） */
export async function GET() {
  if (await isPaused()) {
    return NextResponse.json({ paused: true }, { status: 503 });
  }
  const token = await issueToken();
  return NextResponse.json({ token });
}
