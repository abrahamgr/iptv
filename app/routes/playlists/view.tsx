import { useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import { ChannelFilters } from '~/components/ChannelFilters'
import { ChannelsList } from '~/components/ChannelsList'
import {
  deleteChannel,
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
  const requestedLimit = Number(url.searchParams.get('limit'))
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > INITIAL_LIMIT
      ? requestedLimit
      : INITIAL_LIMIT

  const filters = {
    categories,
    searchQuery,
  }

  const result = getPlaylistWithChannelsAlphabetically(
    playlistId,
    limit,
    filters,
  )

  if (!result) {
    throw new Response('Playlist not found', { status: 404 })
  }

  return {
    ...result,
    filteredCategories: categories,
    loadedLimit: limit,
    searchQuery,
  }
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.playlist.name ?? 'Playlist' }]
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'deletePlaylist') {
    deletePlaylist(Number(params.id))
    return redirect('/')
  }

  if (intent === 'deleteChannel') {
    deleteChannel(Number(formData.get('channelId')))
    return null
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
  const navigation = useNavigation()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const {
    playlist,
    channels,
    totalCount,
    hasMore,
    totalChannels,
    allCategories,
    filteredCategories,
    loadedLimit,
    searchQuery,
  } = loaderData
  const isDeleting = navigation.state === 'submitting'

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold">{playlist.name}</h1>
          <button
            type="button"
            className="bg-red-700 hover:bg-red-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-900 transition-colors"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Playlist
          </button>
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
          loadedLimit={loadedLimit}
          searchQuery={searchQuery ?? ''}
          selectedCategories={filteredCategories ?? []}
        />
      </div>

      {isDeleteDialogOpen && (
        <DeletePlaylistDialog
          isDeleting={isDeleting}
          playlistName={playlist.name}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </div>
  )
}

function DeletePlaylistDialog({
  isDeleting,
  playlistName,
  onClose,
}: {
  isDeleting: boolean
  playlistName: string
  onClose: () => void
}) {
  return (
    <div
      aria-labelledby="delete-playlist-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
        <h2 id="delete-playlist-title" className="text-3xl font-bold">
          Delete playlist?
        </h2>
        <p className="mt-4 text-xl text-gray-300">
          This will permanently delete "{playlistName}" and all of its channels.
        </p>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <Form method="post">
            <input type="hidden" name="intent" value="deletePlaylist" />
            <button
              type="submit"
              disabled={isDeleting}
              className="bg-red-700 hover:bg-red-600 disabled:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  )
}
