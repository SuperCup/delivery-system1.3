export async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: RequestInit & { timeout?: number } = {},
) {
  const { timeout = 3000, ...rest } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(resource, { ...rest, signal: controller.signal })
    return response
  } finally {
    clearTimeout(id)
  }
}