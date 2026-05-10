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
  const [hasCopiedPlaylistUrl, setHasCopiedPlaylistUrl] = useState(false)
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
  const canCopyPlaylistUrl = Boolean(playlist.url)

  const handleCopyPlaylistUrl = async () => {
    if (!playlist.url) return

    await navigator.clipboard.writeText(playlist.url)
    setHasCopiedPlaylistUrl(true)
    window.setTimeout(() => setHasCopiedPlaylistUrl(false), 2000)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-5xl font-bold">{playlist.name}</h1>
              {canCopyPlaylistUrl && (
                <button
                  type="button"
                  aria-label={
                    hasCopiedPlaylistUrl
                      ? 'Playlist URL copied'
                      : 'Copy playlist URL'
                  }
                  title={
                    hasCopiedPlaylistUrl
                      ? 'Playlist URL copied'
                      : 'Copy playlist URL'
                  }
                  className="shrink-0 rounded-xl bg-gray-800 p-3 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900"
                  onClick={handleCopyPlaylistUrl}
                >
                  {hasCopiedPlaylistUrl ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-xl bg-red-700 px-8 py-4 text-xl font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-8 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-900"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Playlist
            </button>
          </div>
          <p className="mb-8 text-2xl text-gray-400">
            {totalCount === totalChannels
              ? `${totalChannels} channels`
              : `${totalCount} of ${totalChannels} channels`}
          </p>

          <ChannelFilters
            categories={allCategories}
            selectedCategories={filteredCategories ?? []}
            searchQuery={searchQuery ?? ''}
          />
        </div>

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

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  )
}
