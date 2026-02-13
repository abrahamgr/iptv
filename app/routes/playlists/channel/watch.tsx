import { Link } from 'react-router'
import { VideoPlayer } from '~/components/VideoPlayer'
import { getChannel } from '~/lib/playlist-service.server'
import type { Route } from './+types/watch'

export function loader({ params }: Route.LoaderArgs) {
  const channel = getChannel(Number(params.channelId))
  if (!channel) {
    throw new Response('Channel not found', { status: 404 })
  }
  return { channel, playlistId: params.id }
}

export default function WatchChannel({ loaderData }: Route.ComponentProps) {
  const { channel, playlistId } = loaderData

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to={`/playlists/${playlistId}`}
          className="inline-block text-2xl text-blue-400 hover:text-blue-300 mb-8 focus:outline-none focus:ring-8 focus:ring-blue-500 rounded-lg p-2"
        >
          &larr; Back to channels
        </Link>

        <h1 className="text-4xl font-bold mb-2">{channel.name}</h1>
        {channel.groupTitle !== 'Uncategorized' && (
          <p className="text-xl text-gray-400 mb-6">{channel.groupTitle}</p>
        )}

        <VideoPlayer url={channel.url} />
      </div>
    </div>
  )
}
