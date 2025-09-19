// ...existing code...
export function extractQrToken(data: string | null | undefined): string | null {
  if (!data) return null
  const raw = data.trim()
  // Try parse as URL
  try {
    const url = new URL(raw)
    // look for /l/{token} in pathname
    const parts = url.pathname.split("/").filter(Boolean)
    const lIndex = parts.indexOf("l")
    if (lIndex !== -1 && parts.length > lIndex + 1) {
      return parts.slice(lIndex + 1).join("/")
    }
    // fallback: last path segment
    if (parts.length > 0) return parts[parts.length - 1]
    // fallback: query param token
    const tokenParam = url.searchParams.get("token")
    if (tokenParam) return tokenParam
  } catch {
    // not a URL
  }
  // If contains /l/{token} as substring
  const m = raw.match(/\/l\/([^\/?#]+)/)
  if (m && m[1]) return m[1]
  // If it's just a long token (alphanumeric) or already token-like — return it
  return raw || null
}
// ...existing code...
