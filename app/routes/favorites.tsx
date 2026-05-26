import { Link } from 'react-router'
import { ChannelGrid } from '~/components/ChannelGrid'
import {
  getAllPlaylists,
  getFavoriteChannels,
} from '~/lib/playlist-service.server'
import type { Route } from './+types/favorites'

export function loader() {
  const channels = getFavoriteChannels()
  const allPlaylists = getAllPlaylists()
  return { channels, allPlaylists }
}

export function meta() {
  return [{ title: 'Favorites' }]
}

export default function Favorites({ loaderData }: Route.ComponentProps) {
  const { channels, allPlaylists } = loaderData

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold">Favorites</h1>
          <p className="mt-4 text-2xl text-gray-400">
            {channels.length === 1
              ? '1 favorite channel'
              : `${channels.length} favorite channels`}
          </p>
        </div>

        {channels.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-8 text-3xl text-gray-400">
              No favorite channels yet
            </p>
            <Link
              to="/"
              className="rounded-lg p-2 text-2xl text-blue-400 underline hover:text-blue-300 focus:outline-none focus:ring-8 focus:ring-blue-500"
            >
              Browse playlists
            </Link>
          </div>
        ) : (
          <ChannelGrid channels={channels} allPlaylists={allPlaylists} />
        )}
      </div>
    </div>
  )
}
