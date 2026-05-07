import { Form, redirect } from 'react-router'
import { ChannelFilters } from '~/components/ChannelFilters'
import { ChannelsList } from '~/components/ChannelsList'
import {
  deletePlaylist,
  getChannelsAlphabetically,
  getPlaylistWithChannelsAlphabetically,
} from '~/lib/playlist-service.server'
import type { Route } from './+types/view'

const INITIAL_LIMIT = 30

export function loader({ params, request }: Route.LoaderArgs) {
  const playlistId = Number(params.id)
  const url = new URL(request.url)
  const searchQuery = url.searchParams.get('search') || undefined
  const categoryParams = url.searchParams.getAll('category')
  const categories =
    categoryParams.length > 0
      ? categoryParams.flatMap((c) => c.split(',')).filter(Boolean)
      : undefined

  const filters = {
    categories,
    searchQuery,
  }

  const result = getPlaylistWithChannelsAlphabetically(
    playlistId,
    INITIAL_LIMIT,
    filters,
  )

  if (!result) {
    throw new Response('Playlist not found', { status: 404 })
  }

  return {
    ...result,
    filteredCategories: categories,
    searchQuery,
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'delete') {
    deletePlaylist(Number(params.id))
    return redirect('/')
  }

  if (intent === 'loadMore') {
    const playlistId = Number(params.id)
    const offset = Number(formData.get('offset'))
    const limit = Number(formData.get('limit'))
    const searchQuery = formData.get('searchQuery') as string | null
    const categoryParam = formData.get('categories') as string | null
    const categories = categoryParam
      ? categoryParam.split(',').filter(Boolean)
      : undefined

    const filters = {
      categories,
      searchQuery: searchQuery || undefined,
    }

    const result = getChannelsAlphabetically(playlistId, limit, offset, filters)

    return Response.json(result)
  }

  return null
}

export default function PlaylistDetail({ loaderData }: Route.ComponentProps) {
  const {
    playlist,
    channels,
    totalCount,
    hasMore,
    totalChannels,
    allCategories,
    filteredCategories,
    searchQuery,
  } = loaderData

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold">{playlist.name}</h1>
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
        <p className="text-2xl text-gray-400 mb-8">
          {totalCount === totalChannels
            ? `${totalChannels} channels`
            : `${totalCount} of ${totalChannels} channels`}
        </p>

        <ChannelFilters
          categories={allCategories}
          selectedCategories={filteredCategories ?? []}
          searchQuery={searchQuery ?? ''}
        />

        <ChannelsList
          channels={channels}
          playlistId={playlist.id}
          totalCount={totalCount}
          hasMore={hasMore}
          searchQuery={searchQuery ?? ''}
          selectedCategories={filteredCategories ?? []}
        />
      </div>
    </div>
  )
}
