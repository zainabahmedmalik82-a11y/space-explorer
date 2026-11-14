export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--border)] bg-[var(--bg-1)]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-[1280px] space-y-3 px-4 py-8 text-xs text-[var(--text-2)] md:px-6">
        <p>Planning support tool. Not a flight-safety certification system.</p>
        <p>
          Credits: imagery and data courtesy of NASA (Blue Marble, Lunar Reconnaissance Orbiter, SPICE). Built by team
          Astra Motion for NASA Space Apps 2026.
        </p>
      </div>
    </footer>
  )
}