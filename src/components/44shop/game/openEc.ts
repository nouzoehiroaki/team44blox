/**
 * ECサイトを別タブで開く。
 * ポップアップブロック等で開けない環境（iOS/アプリ内ブラウザ）は同タブ遷移にフォールバック。
 */
export function openEcUrl(url: string) {
  const w = window.open(url, '_blank');
  if (w) {
    w.opener = null;
  } else {
    window.location.href = url;
  }
}
