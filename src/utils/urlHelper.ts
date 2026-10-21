export interface ExtractedUrl {
  url: string;
  domain: string;
}

export function extractUrls(text: string): ExtractedUrl[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  if (!matches) return [];

  const unique = Array.from(new Set(matches));
  return unique.map((url) => {
    let domain = url;
    try {
      const parsed = new URL(url);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch {
      domain = url;
    }
    return { url, domain };
  });
}

export function formatUrlForDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.length > 20 ? parsed.pathname.substring(0, 20) + '...' : parsed.pathname;
    return `${domain}${pathname === '/' ? '' : pathname}`;
  } catch {
    return url;
  }
}
