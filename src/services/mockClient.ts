const DELAY_MS = 400

export async function respond<T>(data: T): Promise<T> {
  await new Promise((r) => setTimeout(r, DELAY_MS))
  const params = new URLSearchParams(window.location.search)
  if (params.get('error') === '1') throw new Error('Service unavailable (dev switch ?error=1)')
  if (params.get('empty') === '1' && Array.isArray(data)) return [] as unknown as T
  return data
}