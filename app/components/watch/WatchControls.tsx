import type { ReactNode } from 'react'
import {
  MaximizeIcon,
  MinimizeIcon,
  MutedIcon,
  PauseIcon,
  PlayIcon,
  VolumeDownIcon,
  VolumeIcon,
  VolumeUpIcon,
} from './watch-icons'

type WatchControlsProps = {
  adjustVolume: (delta: number) => void
  isFullscreen: boolean
  isLoading: boolean
  isMuted: boolean
  isPlaying: boolean
  toggleFullscreen: () => void
  toggleMute: () => void
  togglePlay: () => void
  volume: number
}

export function WatchControls({
  adjustVolume,
  isFullscreen,
  isLoading,
  isMuted,
  isPlaying,
  toggleFullscreen,
  toggleMute,
  togglePlay,
  volume,
}: WatchControlsProps) {
  const effectiveVolume = isMuted ? 0 : volume
  const volumePercentage = Math.round(effectiveVolume * 100)

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="inline-flex h-10 items-center rounded-full bg-red-600 px-4 text-sm font-bold text-white">
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-black/35 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <PlayerControlButton
            label={isPlaying ? 'Pause channel' : 'Play channel'}
            onClick={togglePlay}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </PlayerControlButton>
          <PlayerControlButton
            label={isMuted ? 'Unmute channel' : 'Mute channel'}
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? <MutedIcon /> : <VolumeIcon />}
          </PlayerControlButton>
          <div className="flex items-center gap-2 px-1">
            <span className="sr-only">Volume {volumePercentage}%</span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20 sm:w-24">
              <div
                className="h-full rounded-full bg-blue-400 transition-[width] duration-150"
                style={{ width: `${volumePercentage}%` }}
              />
            </div>
            <span className="hidden min-w-9 text-right text-xs font-semibold text-gray-200 sm:inline">
              {volumePercentage}%
            </span>
          </div>
          <PlayerControlButton
            label="Volume down"
            onClick={() => adjustVolume(-0.1)}
          >
            <VolumeDownIcon />
          </PlayerControlButton>
          <PlayerControlButton
            label="Volume up"
            onClick={() => adjustVolume(0.1)}
          >
            <VolumeUpIcon />
          </PlayerControlButton>
          <PlayerControlButton
            label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </PlayerControlButton>
        </div>
      </div>
    </div>
  )
}

type PlayerControlButtonProps = {
  children: ReactNode
  label: string
  onClick: () => void
}

function PlayerControlButton({
  children,
  label,
  onClick,
}: PlayerControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-blue-500"
    >
      {children}
    </button>
  )
}
