import { useEffect, useRef } from 'react'

type Star = { x: number; y: number; r: number; a: number; vx: number; vy: number; ph: number }

export default function BackgroundParticles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = window.innerWidth < 768 ? 40 : 90
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let w = 0, h = 0, raf = 0
    let last = performance.now()
    let mx = 0, my = 0, tx = 0, ty = 0
    let stars: Star[] = []

    const init = () => {
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.3,
        a: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        ph: Math.random() * Math.PI * 2,
      }))
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      init()
      draw(performance.now(), 0)
    }

    const draw = (now: number, dt: number) => {
      ctx.clearRect(0, 0, w, h)
      mx += (tx - mx) * 0.05
      my += (ty - my) * 0.05
      for (const s of stars) {
        if (!reduce) {
          s.x += s.vx * dt
          s.y += s.vy * dt
          if (s.x < -5) s.x = w + 5
          if (s.x > w + 5) s.x = -5
          if (s.y < -5) s.y = h + 5
          if (s.y > h + 5) s.y = -5
        }
        const twinkle = reduce ? 1 : 0.7 + 0.3 * Math.sin(now / 1000 + s.ph)
        const depth = s.r / 1.8
        ctx.globalAlpha = s.a * twinkle
        ctx.fillStyle = '#E8ECF4'
        ctx.beginPath()
        ctx.arc(s.x + mx * 12 * depth, s.y + my * 12 * depth, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      draw(now, dt)
      raf = requestAnimationFrame(loop)
    }

    const onMouse = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }

    const onVisibility = () => {
      if (reduce) return
      if (document.hidden) cancelAnimationFrame(raf)
      else { last = performance.now(); raf = requestAnimationFrame(loop) }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    if (!reduce) {
      window.addEventListener('mousemove', onMouse)
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}