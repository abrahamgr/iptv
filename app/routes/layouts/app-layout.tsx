import { NavLink, Outlet } from 'react-router'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="border-b border-gray-700 bg-gray-800/80">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex min-h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-xl px-6 py-3 text-lg font-semibold transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`
                }
              >
                Playlists
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `rounded-xl px-6 py-3 text-lg font-semibold transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`
                }
              >
                Favorites
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
