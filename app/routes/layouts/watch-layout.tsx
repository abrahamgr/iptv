import { Outlet } from 'react-router'

export default function WatchLayout() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Outlet />
    </main>
  )
}
