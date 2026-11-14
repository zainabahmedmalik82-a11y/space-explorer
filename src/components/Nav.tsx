import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Orbit } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/lunar', label: 'Lunar Navigator' },
  { to: '/missions', label: 'Missions' },
  { to: '/time-machine', label: 'Time Machine' },
  { to: '/explorers/explorer-01/gallery', label: 'Gallery' },
  { to: '/compare', label: 'Compare' },
  { to: '/assistant', label: 'Assistant' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-[10px] px-3 py-1.5 text-sm transition-colors ${
    isActive ? 'bg-white/10 text-[var(--text-1)]' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
  }`

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-1)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-[15px] font-semibold">
          <Orbit size={20} className="text-[var(--earth)]" />
          Space Explorer
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--est)]">Mock data</span>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-2)]">Public</span>
        </div>

        <button
          className="rounded-[10px] p-2 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col gap-2 bg-[var(--bg-0)]/95 p-6 backdrop-blur-xl lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-[10px] px-4 py-3 text-lg ${isActive ? 'bg-white/10' : 'text-[var(--text-2)]'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}