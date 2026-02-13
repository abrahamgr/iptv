import { Link } from 'react-router'

interface Channel {
  id: number
  name: string
  logo: string | null
}

interface ChannelGridProps {
  channels: Channel[]
  playlistId: number
}

export function ChannelGrid({ channels, playlistId }: ChannelGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {channels.map((channel) => (
        <Link
          key={channel.id}
          to={`/playlists/${playlistId}/watch/${channel.id}`}
          className="bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900"
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
          <div className="p-4">
            <p className="text-lg font-medium truncate">{channel.name}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
