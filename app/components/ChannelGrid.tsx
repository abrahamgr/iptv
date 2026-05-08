import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { ChannelCard } from './ChannelCard'
import type { Channel } from './channel-types'
import { DeleteChannelDialog } from './DeleteChannelDialog'

interface ChannelGridProps {
  canDelete?: boolean
  channels: Channel[]
  playlistId?: number
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

export function ChannelGrid({
  canDelete = false,
  channels,
  playlistId,
}: ChannelGridProps) {
  const location = useLocation()
  const parentRef = useRef<HTMLDivElement>(null)
  const [columnsCount, setColumnsCount] = useState(5)
  const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null)

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
      <>
        <div
          ref={parentRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              playlistId={playlistId}
              search={location.search}
              onDelete={
                canDelete ? () => setChannelToDelete(channel) : undefined
              }
            />
          ))}
        </div>
        {channelToDelete && (
          <DeleteChannelDialog
            channel={channelToDelete}
            onClose={() => setChannelToDelete(null)}
          />
        )}
      </>
    )
  }

  // For larger lists, use virtual scrolling with row-based rendering
  return (
    <>
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
                    search={location.search}
                    onDelete={
                      canDelete ? () => setChannelToDelete(channel) : undefined
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {channelToDelete && (
        <DeleteChannelDialog
          channel={channelToDelete}
          onClose={() => setChannelToDelete(null)}
        />
      )}
    </>
  )
}
