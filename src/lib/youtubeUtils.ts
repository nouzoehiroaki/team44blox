export function extractYouTubeEmbedUrl(content: string): string | null {
  if (!content) return null;

  const iframeMatch = content.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch?.[1]) {
    const url = iframeMatch[1];
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      try {
        const { hostname } = new URL(url);
        if (hostname === 'www.youtube.com' || hostname === 'youtube.com' || hostname === 'www.youtube-nocookie.com') {
          return url;
        }
      } catch {
        return null;
      }
    }
  }

  const youtubeMatch = content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  return null;
}
