import { Link } from 'react-router-dom'
import { motion, MotionConfig, type Variants } from 'framer-motion'
import { ArrowRight, Bot, GitCompare, History, Images, Moon, Rocket } from 'lucide-react'
import HeroScene from '../../components/HeroScene'
import StatCard from '../../components/StatCard'
import GlassCard from '../../components/GlassCard'
import Skeleton from '../../components/Skeleton'
import ErrorState from '../../components/ErrorState'
import { getBodies, getDatasets } from '../../services'
import { useAsync } from '../../utils/useAsync'
import { formatDate } from '../../utils/format'
import { SITE_TAGLINE } from '../../config/site'

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const modules = [
  {
    to: '/lunar',
    title: 'Lunar Landing Navigator',
    text: 'Compare landing sites and dates by sunlight and Earth visibility.',
    icon: Moon,
    big: true,
  },
  { to: '/missions', title: 'Missions', text: 'Browse Mars and Moon missions.', icon: Rocket },
  { to: '/time-machine', title: 'Time Machine', text: 'Scrub through a mission timeline.', icon: History },
  { to: '/explorers/explorer-01/gallery', title: 'Image Gallery', text: 'Images from explorers.', icon: Images },
  { to: '/compare', title: 'Compare', text: 'Compare missions side by side.', icon: GitCompare },
  { to: '/assistant', title: 'AI Assistant', text: 'Ask questions with cited sources.', icon: Bot },
]

export default function HomePage() {
  const bodies = useAsync(getBodies, [])
  const datasets = useAsync(getDatasets, [])
  const loading = bodies.loading || datasets.loading
  const error = bodies.error ?? datasets.error
  const retry = () => {
    bodies.retry()
    datasets.retry()
  }

  const bodyCount = bodies.data?.length ? bodies.data.length : 'Unknown'
  const missionCount = bodies.data?.length ? bodies.data.reduce((s, b) => s + b.missionCount, 0) : 'Unknown'
  const dates = (datasets.data ?? []).map((d) => d.updated).sort().reverse()
  const newest = dates[0]

  return (
    <MotionConfig reducedMotion="user">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-8rem)] items-center">
        <HeroScene />
        <div className="relative z-10 max-w-xl">
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-2)]">
            NASA Space Apps 2026
          </span>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Lunar Landing Site Navigator
          </h1>
          <p className="mt-5 max-w-md text-base text-[var(--text-2)]">{SITE_TAGLINE}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/lunar"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--earth)] px-5 py-3 font-medium text-[#05070D] transition hover:brightness-110"
            >
              Start exploring <ArrowRight size={16} />
            </Link>
            <Link
              to="/missions"
              className="inline-flex items-center rounded-[10px] border border-[var(--border)] bg-white/5 px-5 py-3 transition hover:border-[var(--border-hover)]"
            >
              Browse missions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-16">
        {error ? (
          <ErrorState message={error.message} onRetry={retry} />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <motion.div variants={item}><StatCard label="Supported bodies" value={bodyCount} /></motion.div>
            <motion.div variants={item}><StatCard label="Missions" value={missionCount} /></motion.div>
            <motion.div variants={item}>
              <StatCard label="Datasets updated recently" value={datasets.data?.length ? datasets.data.length : 'Unknown'} />
            </motion.div>
            <motion.div variants={item}>
              <StatCard label="Data freshness" value={newest ? formatDate(newest) : 'Unknown'} note="Date of last import" />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Module cards */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl">Explore modules</h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 md:grid-cols-3"
        >
          {modules.map((m) => (
            <motion.div key={m.to} variants={item} className={m.big ? 'md:col-span-2 md:row-span-2' : ''}>
              <Link
                to={m.to}
                className={`glass block h-full p-6 ${m.big ? 'glass-glow flex flex-col justify-end md:min-h-[320px]' : ''}`}
              >
                <m.icon size={m.big ? 32 : 22} className="mb-4 text-[var(--earth)]" strokeWidth={1.5} />
                <h3 className={m.big ? 'text-2xl' : 'text-[15px]'}>{m.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-2)]">{m.text}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent datasets */}
      <section className="mt-16">
        <GlassCard title="Recently updated datasets">
          {loading ? (
            <Skeleton className="h-24" />
          ) : error ? (
            <p className="text-[var(--text-2)]">Data not available.</p>
          ) : !datasets.data?.length ? (
            <p className="text-[var(--text-2)]">No datasets yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {datasets.data.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm">{d.name}</p>
                    <p className="text-xs text-[var(--text-2)]">{d.source}</p>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-2)]">
                    {formatDate(d.updated)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </section>
    </MotionConfig>
  )
}