import { useEffect, useRef, useState } from 'react'
import { PlayerControlButton } from './PlayerControlButton'
import type { SubtitleTrack } from './useSubtitleTracks'
import { CcIcon } from './watch-icons'

type SubtitleMenuProps = {
  activeTrackId: number
  onSelect: (id: number) => void
  tracks: SubtitleTrack[]
}

export function SubtitleMenu({
  activeTrackId,
  onSelect,
  tracks,
}: SubtitleMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const handleSelect = (id: number) => {
    onSelect(id)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <PlayerControlButton
        label="Captions"
        onClick={() => setIsOpen((open) => !open)}
      >
        <CcIcon />
      </PlayerControlButton>
      {isOpen && (
        <div
          role="menu"
          className="absolute bottom-full right-0 mb-2 min-w-44 rounded-xl bg-black/85 p-1 text-sm shadow-2xl ring-1 ring-white/10 backdrop-blur"
        >
          <SubtitleMenuItem
            isActive={activeTrackId === -1}
            label="Off"
            onClick={() => handleSelect(-1)}
          />
          {tracks.map((track) => (
            <SubtitleMenuItem
              key={track.id}
              isActive={activeTrackId === track.id}
              label={track.label}
              onClick={() => handleSelect(track.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type SubtitleMenuItemProps = {
  isActive: boolean
  label: string
  onClick: () => void
}

function SubtitleMenuItem({ isActive, label, onClick }: SubtitleMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={isActive}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isActive ? 'bg-white/10 font-semibold' : ''
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
      )}
    </button>
  )
}
