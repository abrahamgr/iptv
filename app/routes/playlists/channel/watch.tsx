import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { VideoPlayer } from '~/components/VideoPlayer'
import { getChannel } from '~/lib/playlist-service.server'
import type { Route } from './+types/watch'

export function loader({ params }: Route.LoaderArgs) {
  const channel = getChannel(Number(params.channelId))
  if (!channel) {
    throw new Response('Channel not found', { status: 404 })
  }
  return { channel, playlistId: params.id }
}

export default function WatchChannel({ loaderData }: Route.ComponentProps) {
  const { channel, playlistId } = loaderData
  const location = useLocation()
  const navigation = useNavigate()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Split groupTitle by semicolon and process categories
  const categories = channel.groupTitle
    .split(';')
    .map((cat) => cat.trim())
    .filter((cat) => cat && cat !== 'Uncategorized')

  const handleBack = (e: MouseEvent<HTMLAnchorElement>) => {
    if (history.length > 1) {
      e.preventDefault()
      navigation(-1)
    }
  }

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleControlsHide = useCallback(() => {
    clearHideTimer()

    hideTimerRef.current = setTimeout(() => {
      if (overlayRef.current?.contains(document.activeElement)) return
      setAreControlsVisible(false)
    }, 2500)
  }, [clearHideTimer])

  const revealControls = useCallback(() => {
    setAreControlsVisible(true)
    scheduleControlsHide()
  }, [scheduleControlsHide])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await surfaceRef.current?.requestFullscreen()
      }
    } catch (_error) {
      // Browsers can reject fullscreen requests outside trusted interactions.
    }
  }, [])

  useEffect(() => {
    scheduleControlsHide()
    return clearHideTimer
  }, [clearHideTimer, scheduleControlsHide])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div
      ref={surfaceRef}
      aria-label="Channel player"
      className={`fixed inset-0 bg-black text-white ${
        areControlsVisible ? 'cursor-default' : 'cursor-none'
      }`}
      onFocusCapture={revealControls}
      onKeyDown={revealControls}
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      role="application"
    >
      <VideoPlayer url={channel.url} className="h-full w-full bg-black" />

      <div
        ref={overlayRef}
        className={`absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/90 via-black/55 to-transparent px-4 py-4 transition-opacity duration-300 sm:px-6 ${
          areControlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <Link
                to={`/playlists/${playlistId}${location.search}`}
                onClick={handleBack}
                aria-label="Back to channels"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500"
              >
                ←
              </Link>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500"
              >
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
            </div>
            <h1 className="truncate text-2xl font-bold sm:text-4xl">
              {channel.name}
            </h1>
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
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {areControlsVisible
          ? 'Player controls visible'
          : 'Player controls hidden'}
      </div>
    </div>
  )
}
