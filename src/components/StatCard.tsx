import { useEffect, useState } from 'react'

function useCountUp(target: number, ms = 600) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setV(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / ms, 1)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

type Props = { label: string; value: number | string; note?: string }

export default function StatCard({ label, value, note }: Props) {
  const n = useCountUp(typeof value === 'number' ? value : 0)
  return (
    <div className="glass p-5">
      <p className="text-xs text-[var(--text-2)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl font-semibold">
        {typeof value === 'number' ? n : value}
      </p>
      {note && <p className="mt-1 text-xs text-[var(--text-2)]">{note}</p>}
    </div>
  )
}