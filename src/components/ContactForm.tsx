'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

type Status = 'loading' | 'ready' | 'sending' | 'done' | 'paused' | 'error';

type ContactFormProps = {
  /** 44SHOP内オーバーレイではドットフォントに */
  variant?: 'page' | 'shop';
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * アーティストへのメッセージフォーム（/contact と 44SHOP内で共用）
 * 送信内容はスタッフ承認後にLINEグループへ届く。
 */
export function ContactForm({ variant = 'page' }: ContactFormProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // ハニーポット
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileToken = useRef('');

  const fontFamily =
    variant === 'shop' ? '"DotGothic16", sans-serif' : 'inherit';

  // ワンタイムトークン取得
  const fetchToken = useCallback(async () => {
    try {
      const res = await fetch('/api/contact/token');
      if (res.status === 503) {
        setStatus('paused');
        return;
      }
      const data = (await res.json()) as { token: string };
      setToken(data.token);
      setStatus('ready');
    } catch {
      setStatus('error');
      setErrorMsg('読み込みに失敗しました。再読み込みしてください。');
    }
  }, []);

  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  // Turnstile埋め込み
  useEffect(() => {
    if (!SITE_KEY || !turnstileRef.current) return;
    const render = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => {
            turnstileToken.current = t;
          },
        });
      }
    };
    if (window.turnstile) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [status === 'ready']); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name,
          message,
          website,
          turnstileToken: turnstileToken.current,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (data.ok) {
        setStatus('done');
      } else {
        setStatus('error');
        setErrorMsg(data.message ?? '送信に失敗しました。');
        await fetchToken(); // トークンを取り直す
        window.turnstile?.reset();
      }
    } catch {
      setStatus('error');
      setErrorMsg('送信に失敗しました。通信環境をご確認ください。');
      await fetchToken();
    }
  };

  const boxStyle: React.CSSProperties = {
    maxWidth: 560,
    margin: '0 auto',
    padding: 24,
    background: '#111',
    border: '3px solid #fff',
    color: '#fff',
    fontFamily,
    textAlign: 'left',
  };
  const labelStyle: React.CSSProperties = { display: 'block', margin: '14px 0 6px', fontSize: 14, color: '#f5d442' };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: 10,
    background: '#000',
    color: '#fff',
    border: '2px solid #555',
    fontSize: 16,
    fontFamily,
  };

  if (status === 'paused') {
    return (
      <div style={boxStyle}>
        <p>ただいま おやすみちゅう……<br />メッセージの受付を一時停止しています。</p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div style={boxStyle}>
        <p>
          メッセージを うけつけました！<br />
          スタッフの確認後、アーティストに とどけられます。<br />
          ありがとうございました！
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={boxStyle}>
      <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
        アーティストへの応援メッセージを送れます（返信は行っていません）。
        内容はスタッフの確認後に届けられます。
      </p>

      <label style={labelStyle}>名前（ニックネーム・30文字まで）</label>
      <input
        required
        maxLength={30}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>メッセージ（500文字まで）</label>
      <textarea
        required
        maxLength={500}
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <div style={{ fontSize: 12, color: '#777', textAlign: 'right' }}>{message.length}/500</div>

      {/* ハニーポット（人間には見えない） */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      {SITE_KEY && <div ref={turnstileRef} style={{ margin: '14px 0' }} />}

      {status === 'error' && (
        <p style={{ color: '#ff7b6b', fontSize: 14 }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status !== 'ready' && status !== 'error'}
        style={{
          marginTop: 14,
          width: '100%',
          padding: '12px 0',
          background: '#1d5c33',
          color: '#fff',
          border: '3px solid #fff',
          fontSize: 17,
          letterSpacing: 2,
          cursor: 'pointer',
          fontFamily,
          opacity: status === 'sending' ? 0.6 : 1,
        }}
      >
        {status === 'sending' ? 'そうしんちゅう……' : 'メッセージを おくる'}
      </button>
    </form>
  );
}
