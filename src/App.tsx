import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Placeholder title="Home" />} />
        <Route path="/missions" element={<Placeholder title="Missions" />} />
        <Route path="/missions/:missionId" element={<Placeholder title="Mission profile" />} />
        <Route path="/explorers/:id/map" element={<Placeholder title="Location map" />} />
        <Route path="/explorers/:id/gallery" element={<Placeholder title="Image gallery" />} />
        <Route path="/time-machine" element={<Placeholder title="Time Machine" />} />
        <Route path="/compare" element={<Placeholder title="Mission comparison" />} />
        <Route path="/lunar" element={<Placeholder title="Lunar Landing Navigator" />} />
        <Route path="/lunar/compare" element={<Placeholder title="Site and date comparison" />} />
        <Route path="/assistant" element={<Placeholder title="AI Research Assistant" />} />
        <Route path="/admin" element={<Placeholder title="Admin" />} />
      </Route>
    </Routes>
  )
}