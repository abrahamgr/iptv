import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router'

type WatchTopOverlayProps = {
  backTo: string
  categories: string[]
  favoriteControl: ReactNode
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void
  playlistId: string
  title: string
}

export function WatchTopOverlay({
  backTo,
  categories,
  favoriteControl,
  onBack,
  playlistId,
  title,
}: WatchTopOverlayProps) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 bg-gradient-to-b from-black/90 via-black/55 to-transparent px-4 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Link
              to={backTo}
              onClick={onBack}
              aria-label="Back to channels"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500"
            >
              ←
            </Link>
          </div>
          <h1 className="truncate text-2xl font-bold sm:text-4xl">{title}</h1>
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/playlists/${playlistId}?category=${encodeURIComponent(category)}`}
                  className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm text-gray-200 transition-colors hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}
        </div>
        {favoriteControl}
      </div>
    </div>
  )
}
