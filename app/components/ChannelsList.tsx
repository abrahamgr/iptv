import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import { ChannelGrid } from './ChannelGrid'

interface Channel {
  id: number
  name: string
  url: string
  logo: string | null
  groupTitle: string
}

interface ChannelsListProps {
  channels: Channel[]
  playlistId: number
  totalCount: number
  hasMore: boolean
  searchQuery: string
  selectedCategories: string[]
}

const LOAD_MORE_INCREMENT = 30

export function ChannelsList({
  channels: initialChannels,
  playlistId,
  totalCount,
  hasMore: initialHasMore,
  searchQuery,
  selectedCategories,
}: ChannelsListProps) {
  const fetcher = useFetcher<{
    channels: Channel[]
    totalCount: number
    hasMore: boolean
  }>()
  const [loadedChannels, setLoadedChannels] =
    useState<Channel[]>(initialChannels)
  const [currentOffset, setCurrentOffset] = useState(initialChannels.length)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const lastProcessedData = useRef<typeof fetcher.data | null>(null)

  const filterKey = `${playlistId}-${searchQuery}-${selectedCategories.join(',')}`
  const previousFilterKey = useRef(filterKey)

  // Reset when filters change (not on every loader revalidation)
  useEffect(() => {
    if (previousFilterKey.current === filterKey) return

    previousFilterKey.current = filterKey
    setLoadedChannels(initialChannels)
    setCurrentOffset(initialChannels.length)
    setHasMore(initialHasMore)
    lastProcessedData.current = null
  }, [filterKey, initialChannels, initialHasMore])

  // Handle fetcher response
  useEffect(() => {
    if (
      fetcher.data &&
      fetcher.state === 'idle' &&
      fetcher.data !== lastProcessedData.current
    ) {
      lastProcessedData.current = fetcher.data
      const newChannels = fetcher.data.channels
      if (newChannels.length > 0) {
        const nextOffset = currentOffset + newChannels.length
        setLoadedChannels((prev) => [...prev, ...newChannels])
        setCurrentOffset(nextOffset)
        setHasMore(fetcher.data.hasMore && nextOffset < fetcher.data.totalCount)
      } else {
        setHasMore(false)
      }
    }
  }, [currentOffset, fetcher.data, fetcher.state])

  const handleLoadMore = () => {
    const formData = new FormData()
    formData.set('intent', 'loadMore')
    formData.set('offset', currentOffset.toString())
    formData.set('limit', LOAD_MORE_INCREMENT.toString())
    if (searchQuery) {
      formData.set('searchQuery', searchQuery)
    }
    if (selectedCategories.length > 0) {
      formData.set('categories', selectedCategories.join(','))
    }

    fetcher.submit(formData, { method: 'post' })
  }

  const isLoading =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <div>
      {loadedChannels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">No channels found.</p>
        </div>
      ) : (
        <>
          <ChannelGrid channels={loadedChannels} playlistId={playlistId} />
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {isLoading
                  ? 'Loading...'
                  : `Load More (${totalCount - loadedChannels.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
