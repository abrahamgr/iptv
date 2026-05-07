import { useNavigation, useSearchParams } from 'react-router'
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
  loadedLimit: number
  searchQuery: string
  selectedCategories: string[]
}

const LOAD_MORE_INCREMENT = 30

export function ChannelsList({
  channels: initialChannels,
  playlistId,
  totalCount,
  hasMore: initialHasMore,
  loadedLimit,
}: ChannelsListProps) {
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()
  const hasMore = initialHasMore && initialChannels.length < totalCount

  const handleLoadMore = () => {
    const nextParams = new URLSearchParams(searchParams)
    const nextLimit = Math.min(loadedLimit + LOAD_MORE_INCREMENT, totalCount)
    nextParams.set('limit', nextLimit.toString())
    setSearchParams(nextParams)
  }

  const isLoading =
    navigation.state === 'loading' && navigation.formMethod === undefined

  return (
    <div>
      {initialChannels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">No channels found.</p>
        </div>
      ) : (
        <>
          <ChannelGrid channels={initialChannels} playlistId={playlistId} />
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
                  : `Load More (${totalCount - initialChannels.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
