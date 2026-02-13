import { Form, Link, redirect } from 'react-router'
import { CategorySection } from '~/components/CategorySection'
import {
  deletePlaylist,
  getPlaylistWithChannels,
} from '~/lib/playlist-service.server'
import type { Route } from './+types/view'

export function loader({ params }: Route.LoaderArgs) {
  const result = getPlaylistWithChannels(Number(params.id))
  if (!result) {
    throw new Response('Playlist not found', { status: 404 })
  }
  return result
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()
  if (formData.get('intent') === 'delete') {
    deletePlaylist(Number(params.id))
    return redirect('/')
  }
  return null
}

export default function PlaylistDetail({ loaderData }: Route.ComponentProps) {
  const { playlist, channels, grouped } = loaderData
  const categories = Object.keys(grouped).sort()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="text-2xl text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-8 focus:ring-blue-500 rounded-lg p-2"
          >
            &larr; Back
          </Link>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-900 transition-colors"
              onClick={(e) => {
                if (!confirm('Delete this playlist?')) e.preventDefault()
              }}
            >
              Delete Playlist
            </button>
          </Form>
        </div>

        <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
        <p className="text-2xl text-gray-400 mb-12">
          {channels.length} channels &middot; {categories.length} categories
        </p>

        {categories.map((category) => (
          <CategorySection
            key={category}
            title={category}
            channels={grouped[category]}
            playlistId={playlist.id}
          />
        ))}
      </div>
    </div>
  )
}
