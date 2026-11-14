import { lazy, Suspense, useMemo } from 'react'

const EarthMoon3D = lazy(() => import('./EarthMoon3D'))

function StaticEarth() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2 aspect-square h-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #4DA3FF 0%, #12356b 45%, #070d1c 75%)',
        boxShadow: '0 0 80px rgba(77,163,255,0.25)',
      }}
    />
  )
}

export default function HeroScene() {
  const hasWebGL = useMemo(() => {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-50 md:w-[62%] md:opacity-100">
      {hasWebGL ? (
        <Suspense fallback={<StaticEarth />}>
          <EarthMoon3D />
        </Suspense>
      ) : (
        <StaticEarth />
      )}
    </div>
  )
}