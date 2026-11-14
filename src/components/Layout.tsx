import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from './Nav'
import Footer from './Footer'
import BackgroundParticles from './BackgroundParticles'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(77,163,255,0.06), transparent 70%), var(--bg-0)',
      }}
    >
      <BackgroundParticles />
      <div className="relative z-10">
        <Nav />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-[1280px] px-4 py-10 md:px-6"
        >
          <Outlet />
        </motion.main>
      </div>
      <Footer />
    </div>
  )
}