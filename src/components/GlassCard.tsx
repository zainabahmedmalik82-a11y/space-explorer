import type { ReactNode } from 'react'

type Props = { title?: string; glow?: boolean; className?: string; children: ReactNode }

export default function GlassCard({ title, glow, className = '', children }: Props) {
  return (
    <section className={`glass p-6 ${glow ? 'glass-glow' : ''} ${className}`}>
      {title && <h3 className="mb-4 text-[15px] text-[var(--text-1)]">{title}</h3>}
      {children}
    </section>
  )
}