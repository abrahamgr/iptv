import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { VideoPlayer } from '~/components/VideoPlayer'
import { useVideoControls } from './useVideoControls'
import { WatchControls } from './WatchControls'
import { WatchTopOverlay } from './WatchTopOverlay'

type WatchChannel = {
  groupTitle: string
  name: string
  url: string
}

type WatchPlayerProps = {
  backTo: string
  channel: WatchChannel
  favoriteControl: ReactNode
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void
  playlistId: string
}

export function WatchPlayer({
  backTo,
  channel,
  favoriteControl,
  onBack,
  playlistId,
}: WatchPlayerProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [areControlsVisible, setAreControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { adjustVolume, isMuted, isPlaying, toggleMute, togglePlay, volume } =
    useVideoControls(videoRef)

  const categories = channel.groupTitle
    .split(';')
    .map((category) => category.trim())
    .filter((category) => category && category !== 'Uncategorized')

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
      <VideoPlayer
        ref={videoRef}
        url={channel.url}
        className="h-full w-full bg-black"
      />

      <div
        ref={overlayRef}
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ${
          areControlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <WatchTopOverlay
          backTo={backTo}
          categories={categories}
          favoriteControl={favoriteControl}
          onBack={onBack}
          playlistId={playlistId}
          title={channel.name}
        />
        <WatchControls
          adjustVolume={adjustVolume}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          isPlaying={isPlaying}
          toggleFullscreen={toggleFullscreen}
          toggleMute={toggleMute}
          togglePlay={togglePlay}
          volume={volume}
        />
      </div>

      <div className="sr-only" aria-live="polite">
        {areControlsVisible
          ? 'Player controls visible'
          : 'Player controls hidden'}
      </div>
    </div>
  )
}
