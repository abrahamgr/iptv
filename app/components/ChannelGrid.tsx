import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'

interface Channel {
  id: number
  name: string
  logo: string | null
}

interface ChannelGridProps {
  channels: Channel[]
  playlistId: number
}

// Estimate item height for virtual scrolling
// aspect-video (16:9) + padding + text ≈ 200px
const ESTIMATED_ITEM_HEIGHT = 200
const GAP = 24 // gap-6

// Calculate columns based on container width
const getColumnsCount = (width: number) => {
  if (width >= 1024) return 5 // lg:grid-cols-5
  if (width >= 768) return 4 // md:grid-cols-4
  if (width >= 640) return 3 // sm:grid-cols-3
  return 2 // grid-cols-2
}

export function ChannelGrid({ channels, playlistId }: ChannelGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columnsCount, setColumnsCount] = useState(5)

  // Update columns count on resize
  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    const updateColumns = () => {
      const currentElement = parentRef.current
      if (currentElement && currentElement instanceof HTMLElement) {
        setColumnsCount(getColumnsCount(currentElement.offsetWidth))
      }
    }

    // Initial update
    updateColumns()

    // Use ResizeObserver if available, fallback to window resize
    if (typeof ResizeObserver !== 'undefined') {
      try {
        const resizeObserver = new ResizeObserver(updateColumns)
        resizeObserver.observe(element)
        return () => {
          resizeObserver.disconnect()
        }
      } catch (_error) {
        // Fallback to window resize if ResizeObserver fails
        window.addEventListener('resize', updateColumns)
        return () => {
          window.removeEventListener('resize', updateColumns)
        }
      }
    } else {
      // Fallback for browsers without ResizeObserver
      window.addEventListener('resize', updateColumns)
      return () => {
        window.removeEventListener('resize', updateColumns)
      }
    }
  }, [])

  // Group channels into rows for virtualization
  const rows = useMemo(() => {
    const result: Channel[][] = []
    for (let i = 0; i < channels.length; i += columnsCount) {
      result.push(channels.slice(i, i + columnsCount))
    }
    return result
  }, [channels, columnsCount])

  // Virtualize rows - use document.documentElement as scroll container
  // The "load more" button in CategorySection already limits renders effectively
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () =>
      typeof document !== 'undefined' ? document.documentElement : null,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT + GAP,
    overscan: 2,
  })

  const virtualRows = virtualizer.getVirtualItems()

  // For small lists, render all items normally (no virtualization overhead)
  if (channels.length <= 30) {
    return (
      <div
        ref={parentRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            playlistId={playlistId}
          />
        ))}
      </div>
    )
  }

  // For larger lists, use virtual scrolling with row-based rendering
  return (
    <div
      ref={parentRef}
      className="relative"
      style={{
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index]
        if (!row) return null

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {row.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  playlistId={playlistId}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ChannelCard({
  channel,
  playlistId,
}: {
  channel: Channel
  playlistId: number
}) {
  return (
    <Link
      to={`/playlists/${playlistId}/watch/${channel.id}`}
      className="bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900"
    >
      <div className="aspect-video bg-gray-700 flex items-center justify-center">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span className="text-4xl text-gray-500">TV</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-lg font-medium truncate">{channel.name}</p>
      </div>
    </Link>
  )
}
