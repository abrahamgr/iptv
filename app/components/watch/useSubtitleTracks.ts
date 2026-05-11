import Hls from 'hls.js'
import { type RefObject, useCallback, useEffect, useState } from 'react'

export type SubtitleTrack = {
  id: number
  label: string
  lang?: string
}

type UseSubtitleTracksResult = {
  tracks: SubtitleTrack[]
  activeTrackId: number
  setActiveTrack: (id: number) => void
}

function describeTrack(
  index: number,
  label: string | undefined,
  lang: string | undefined,
): SubtitleTrack {
  const trimmedLabel = label?.trim()
  const trimmedLang = lang?.trim()
  return {
    id: index,
    label: trimmedLabel || trimmedLang || `Track ${index + 1}`,
    lang: trimmedLang || undefined,
  }
}

export function useSubtitleTracks(
  videoRef: RefObject<HTMLVideoElement | null>,
  hls: Hls | null,
): UseSubtitleTracksResult {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([])
  const [activeTrackId, setActiveTrackId] = useState<number>(-1)

  useEffect(() => {
    if (hls) {
      const sync = () => {
        setTracks(
          hls.subtitleTracks.map((t, i) =>
            describeTrack(i, t.name, t.lang ?? undefined),
          ),
        )
        setActiveTrackId(hls.subtitleTrack)
      }

      const handleSwitch = (_event: unknown, data: { id: number }) => {
        setActiveTrackId(data.id)
      }

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, sync)
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, handleSwitch)
      sync()

      return () => {
        hls.off(Hls.Events.SUBTITLE_TRACKS_UPDATED, sync)
        hls.off(Hls.Events.SUBTITLE_TRACK_SWITCH, handleSwitch)
      }
    }

    const video = videoRef.current
    if (!video) return

    const textTracks = video.textTracks

    const sync = () => {
      const next: SubtitleTrack[] = []
      let active = -1
      for (let i = 0; i < textTracks.length; i++) {
        const t = textTracks[i]
        if (t.kind !== 'subtitles' && t.kind !== 'captions') continue
        next.push(describeTrack(next.length, t.label, t.language))
        if (t.mode === 'showing') active = next.length - 1
      }
      setTracks(next)
      setActiveTrackId(active)
    }

    sync()
    textTracks.addEventListener('addtrack', sync)
    textTracks.addEventListener('removetrack', sync)
    textTracks.addEventListener('change', sync)

    return () => {
      textTracks.removeEventListener('addtrack', sync)
      textTracks.removeEventListener('removetrack', sync)
      textTracks.removeEventListener('change', sync)
    }
  }, [hls, videoRef])

  const setActiveTrack = useCallback(
    (id: number) => {
      if (hls) {
        hls.subtitleDisplay = id !== -1
        hls.subtitleTrack = id
        setActiveTrackId(id)
        return
      }
      const video = videoRef.current
      if (!video) return
      const textTracks = video.textTracks
      let cursor = 0
      for (let i = 0; i < textTracks.length; i++) {
        const t = textTracks[i]
        if (t.kind !== 'subtitles' && t.kind !== 'captions') continue
        t.mode = cursor === id ? 'showing' : 'disabled'
        cursor++
      }
      setActiveTrackId(id)
    },
    [hls, videoRef],
  )

  return { tracks, activeTrackId, setActiveTrack }
}
