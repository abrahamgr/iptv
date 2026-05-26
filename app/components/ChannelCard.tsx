import { Link } from 'react-router'
import type { Channel } from './channel-types'

type ChannelCardProps = {
  channel: Channel
  playlistId?: number
  search: string
  onDelete?: () => void
  onEdit?: () => void
}

export function ChannelCard({
  channel,
  playlistId,
  search,
  onDelete,
  onEdit,
}: ChannelCardProps) {
  const channelPlaylistId = playlistId ?? channel.playlistId

  if (!channelPlaylistId) return null

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-800 transition-colors hover:bg-gray-700 focus-within:bg-gray-700">
      <Link
        to={`/playlists/${channelPlaylistId}/watch/${channel.id}${search}`}
        className="block focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900"
      >
        <div className="aspect-video bg-gray-700 flex items-center justify-center">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <span className="text-4xl text-gray-500">TV</span>
          )}
        </div>
        <div className="p-4 pb-3">
          <p className="text-lg font-medium truncate" title={channel.name}>
            {channel.name}
          </p>
        </div>
      </Link>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${channel.name}`}
          className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-700/95 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-600 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${channel.name}`}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-700/95 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        </button>
      )}
    </div>
  )
}
