import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

const EARTH_R = 1.9
const MOON_R = 0.38
const MOON_ORBIT = 3.1
const LAND_RED_THRESHOLD = 30 // zyada = kam land dots, kam = zyada land dots
const mouse = { x: 0, y: 0 }

type Mask = { w: number; h: number; data: Uint8ClampedArray }
type Quality = 'high' | 'low'

/* ---------- Shaders ---------- */
const pointsVert = /* glsl */ `
uniform float uTime;
uniform float uScale;
attribute float aSize;
attribute float aPhase;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = color;
  vec3 n = normalize(normalMatrix * position);
  float facing = smoothstep(-0.15, 0.35, n.z);
  float twinkle = 0.8 + 0.2 * sin(uTime * 1.4 + aPhase);
  vAlpha = mix(0.18, 1.0, facing) * twinkle;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale / -mv.z;
  gl_Position = projectionMatrix * mv;
}`

const pointsFrag = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vColor, a);
}`

const glowVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const glowFrag = /* glsl */ `
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float outer = 1.0 - smoothstep(0.625, 1.0, d);
  float inner = smoothstep(0.5, 0.625, d);
  float body = (1.0 - smoothstep(0.6, 0.625, d)) * 0.06;
  float i = pow(outer, 2.6) * inner * 0.55 + body;
  gl_FragColor = vec4(0.30, 0.64, 1.0, 1.0) * i;
}`

function makeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: 20 } },
    vertexShader: pointsVert,
    fragmentShader: pointsFrag,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/* ---------- Earth land mask (dots ka rang/ghanapan chunne ke liye) ---------- */
function loadMask(): Promise<Mask | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const w = 512
      const h = 256
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return resolve(null)
      ctx.drawImage(img, 0, 0, w, h)
      resolve({ w, h, data: ctx.getImageData(0, 0, w, h).data })
    }
    img.onerror = () => resolve(null)
    img.src = '/textures/earth.jpg'
  })
}

/* ---------- Geometry builders ---------- */
function makeGeometry(
  pos: Float32Array, col: Float32Array, size: Float32Array, phase: Float32Array, n: number,
) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  g.setDrawRange(0, n)
  return g
}

function buildEarth(count: number, mask: Mask | null) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const phase = new Float32Array(count)
  const land = new THREE.Color('#4DA3FF')
  const ocean = new THREE.Color('#2F7BE0')
  const white = new THREE.Color('#E8ECF4')
  const tmp = new THREE.Color()
  let n = 0
  let guard = 0

  while (n < count && guard < count * 40) {
    guard++
    const lat = Math.asin(2 * Math.random() - 1)
    const lon = (Math.random() * 2 - 1) * Math.PI
    let isLand = true
    if (mask) {
      const u = (lon + Math.PI) / (2 * Math.PI)
      const v = (Math.PI / 2 - lat) / Math.PI
      const px = Math.min(mask.w - 1, Math.floor(u * mask.w))
      const py = Math.min(mask.h - 1, Math.floor(v * mask.h))
      isLand = mask.data[(py * mask.w + px) * 4] > LAND_RED_THRESHOLD
      if (!isLand && Math.random() > 0.55) continue
    }
    pos[n * 3] = EARTH_R * Math.cos(lat) * Math.cos(lon)
    pos[n * 3 + 1] = EARTH_R * Math.sin(lat)
    pos[n * 3 + 2] = -EARTH_R * Math.cos(lat) * Math.sin(lon)
    tmp.copy(isLand ? land : ocean)
    if (isLand && Math.random() < 0.15) tmp.lerp(white, 0.5)
    col[n * 3] = tmp.r
    col[n * 3 + 1] = tmp.g
    col[n * 3 + 2] = tmp.b
    size[n] = isLand ? 0.9 + Math.random() * 0.8 : 0.6 + Math.random() * 0.5
    phase[n] = Math.random() * Math.PI * 2
    n++
  }
  return { geometry: makeGeometry(pos, col, size, phase, n), count: n }
}

function buildMoon(count: number) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const size = new Float32Array(count)
  const phase = new Float32Array(count)
  const base = new THREE.Color('#C9D1E0')
  for (let i = 0; i < count; i++) {
    const lat = Math.asin(2 * Math.random() - 1)
    const lon = (Math.random() * 2 - 1) * Math.PI
    pos[i * 3] = MOON_R * Math.cos(lat) * Math.cos(lon)
    pos[i * 3 + 1] = MOON_R * Math.sin(lat)
    pos[i * 3 + 2] = -MOON_R * Math.cos(lat) * Math.sin(lon)
    const b = 0.6 + Math.random() * 0.4
    col[i * 3] = base.r * b
    col[i * 3 + 1] = base.g * b
    col[i * 3 + 2] = base.b * b
    size[i] = 0.8 + Math.random() * 0.6
    phase[i] = Math.random() * Math.PI * 2
  }
  return makeGeometry(pos, col, size, phase, count)
}

/* ---------- Scene ---------- */
function Scene({ reduce, mobile, quality }: { reduce: boolean; mobile: boolean; quality: Quality }) {
  const root = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  const material = useMemo(makeMaterial, [])
  const earthTex = useMemo(() => {
    const t = new THREE.TextureLoader().load('/textures/earth.jpg')
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const [mask, setMask] = useState<Mask | null | undefined>(undefined)

  useEffect(() => {
    let on = true
    loadMask().then((m) => on && setMask(m))
    return () => {
      on = false
    }
  }, [])

  useEffect(() => {
    if (reduce) return
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5
      mouse.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduce])

  const earth = useMemo(
    () => (mask === undefined ? null : buildEarth(mobile ? 14000 : 28000, mask)),
    [mask, mobile],
  )
  const moon = useMemo(() => buildMoon(mobile ? 1500 : 3500), [mobile])

  useEffect(() => {
    if (!earth) return
    earth.geometry.setDrawRange(0, quality === 'low' ? Math.floor(earth.count * 0.55) : earth.count)
    invalidate()
  }, [earth, quality, invalidate])

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uScale.value = state.viewport.dpr * 20
    if (reduce) return
    const dt = Math.min(delta, 0.1)
    if (spin.current) spin.current.rotation.y += dt * ((Math.PI * 2) / 90) // 90 sec mein ek chakkar
    if (orbit.current && !mobile) orbit.current.rotation.y += dt * ((Math.PI * 2) / 45)
    if (root.current) {
      root.current.rotation.y += (mouse.x * 0.18 - root.current.rotation.y) * 0.04
      root.current.rotation.x += (0.1 + mouse.y * 0.1 - root.current.rotation.x) * 0.04
    }
  })

  return (
    <>
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[EARTH_R * 3.2, EARTH_R * 3.2]} />
        <shaderMaterial
          vertexShader={glowVert}
          fragmentShader={glowFrag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={root}>
        <group rotation={[0, 0, 0.41]}>
          <group ref={spin}>
            <mesh>
              <sphereGeometry args={[EARTH_R * 0.985, 64, 64]} />
              <meshBasicMaterial map={earthTex} color="#c8d4e6" />
            </mesh>
            {earth && <points geometry={earth.geometry} material={material} frustumCulled={false} />}
          </group>
        </group>

        <group rotation={[0.35, 0, 0.1]}>
          <group ref={orbit} rotation={[0, mobile ? 0.8 : 0, 0]}>
            <points position={[MOON_ORBIT, 0, 0]} geometry={moon} material={material} frustumCulled={false} />
          </group>
        </group>
      </group>
    </>
  )
}

/* ---------- Canvas ---------- */
export default function EarthMoon3D() {
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const mobile = useMemo(() => window.innerWidth < 768, [])
  const [quality, setQuality] = useState<Quality>(mobile ? 'low' : 'high')

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 40 }}
      dpr={[1, quality === 'high' ? 2 : 1.25]}
      frameloop={reduce ? 'demand' : 'always'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <Scene reduce={reduce} mobile={mobile} quality={quality} />
    </Canvas>
  )
}