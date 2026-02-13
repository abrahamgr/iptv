import { Link } from 'react-router'

interface PlaylistCardProps {
  playlist: {
    id: number
    name: string
    sourceType: string
    createdAt: string
  }
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      to={`/playlists/${playlist.id}`}
      className="block bg-gray-800 hover:bg-gray-700 rounded-2xl p-8 transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900"
    >
      <h2 className="text-3xl font-semibold mb-3">{playlist.name}</h2>
      <p className="text-xl text-gray-400">
        {playlist.sourceType === 'url' ? 'URL' : 'File'} &middot; Added{' '}
        {new Date(playlist.createdAt).toLocaleDateString()}
      </p>
    </Link>
  )
}
