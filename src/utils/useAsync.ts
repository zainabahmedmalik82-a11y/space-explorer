import { useEffect, useState } from 'react'

type State<T> = { data: T | null; loading: boolean; error: Error | null }

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e) =>
        alive && setState({ data: null, loading: false, error: e instanceof Error ? e : new Error(String(e)) }),
      )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, retry: () => setTick((t) => t + 1) }
}