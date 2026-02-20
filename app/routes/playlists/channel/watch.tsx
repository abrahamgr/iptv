import { Link, useNavigate } from 'react-router'
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
  const navigation = useNavigate()

  // Split groupTitle by semicolon and process categories
  const categories = channel.groupTitle
    .split(';')
    .map((cat) => cat.trim())
    .filter((cat) => cat && cat !== 'Uncategorized')

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (history.length > 1) {
      e.preventDefault()
      navigation(-1)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to={`/playlists/${playlistId}`}
          onClick={handleBack}
          className="inline-block text-2xl text-blue-400 hover:text-blue-300 mb-8 focus:outline-none focus:ring-8 focus:ring-blue-500 rounded-lg p-2"
        >
          &larr; Back to channels
        </Link>

        <h1 className="text-4xl font-bold mb-2">{channel.name}</h1>
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/playlists/${playlistId}?category=${encodeURIComponent(category)}`}
                className="inline-block px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        <VideoPlayer url={channel.url} />
      </div>
    </div>
  )
}
