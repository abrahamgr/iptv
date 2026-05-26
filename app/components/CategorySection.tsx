import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { ChannelGrid } from './ChannelGrid'
import type { FullChannel } from './channel-types'

interface CategorySectionProps {
  title: string
  channels: FullChannel[]
  playlistId: number
  totalCount: number
  hasMore: boolean
  searchQuery: string
}

const LOAD_MORE_INCREMENT = 30

export function CategorySection({
  title,
  channels: initialChannels,
  playlistId,
  totalCount,
  hasMore: initialHasMore,
  searchQuery,
}: CategorySectionProps) {
  const fetcher = useFetcher<{
    channels: FullChannel[]
    totalCount: number
    hasMore: boolean
  }>()
  const [loadedChannels, setLoadedChannels] =
    useState<FullChannel[]>(initialChannels)
  const [currentOffset, setCurrentOffset] = useState(initialChannels.length)
  const [hasMore, setHasMore] = useState(initialHasMore)

  // Reset when initial channels change (e.g., filter change)
  useEffect(() => {
    setLoadedChannels(initialChannels)
    setCurrentOffset(initialChannels.length)
    setHasMore(initialHasMore)
  }, [initialChannels, initialHasMore]) // Reset when initial data changes

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      const newChannels = fetcher.data.channels
      if (newChannels.length > 0) {
        setLoadedChannels((prev) => [...prev, ...newChannels])
        setCurrentOffset((prev) => prev + newChannels.length)
        setHasMore(fetcher.data.hasMore)
      } else {
        setHasMore(false)
      }
    }
  }, [fetcher.data, fetcher.state])

  const handleLoadMore = () => {
    const formData = new FormData()
    formData.set('intent', 'loadMore')
    formData.set('category', title)
    formData.set('offset', currentOffset.toString())
    formData.set('limit', LOAD_MORE_INCREMENT.toString())
    if (searchQuery) {
      formData.set('searchQuery', searchQuery)
    }

    fetcher.submit(formData, { method: 'post' })
  }

  const isLoading =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-200">
        {title}
        <span className="text-lg text-gray-400 ml-2 font-normal">
          ({loadedChannels.length} of {totalCount})
        </span>
      </h2>
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
    </section>
  )
}
