function normalizeUrl(url: string) {
  if (!url.startsWith("http")) {
    return "https://" + url;
  }
  return url;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !!parsed.hostname.includes('.') // กันกรณี "http://a"
    );
  } catch {
    return false;
  }
}