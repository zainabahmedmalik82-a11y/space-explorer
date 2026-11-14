import GlassCard from './GlassCard'

export default function Placeholder({ title }: { title: string }) {
  return (
    <GlassCard title={title} glow>
      <p className="text-[var(--text-2)]">This page is a placeholder. It will be built in a later phase.</p>
    </GlassCard>
  )
}