import { type RefObject, useCallback, useEffect, useState } from 'react'

export function useVideoControls(videoRef: RefObject<HTMLVideoElement | null>) {
  const [isMuted, setIsMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)

  const syncVideoState = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    setIsPlaying(!video.paused)
    setIsMuted(video.muted)
    setVolume(video.volume)
  }, [videoRef])

  const togglePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      await video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [videoRef])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    syncVideoState()
  }, [syncVideoState, videoRef])

  const adjustVolume = useCallback(
    (delta: number) => {
      const video = videoRef.current
      if (!video) return

      const nextVolume = Math.max(
        0,
        Math.min(1, Math.round((video.volume + delta) * 10) / 10),
      )

      video.volume = nextVolume
      video.muted = nextVolume === 0
      syncVideoState()
    },
    [syncVideoState, videoRef],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.addEventListener('loadedmetadata', syncVideoState)
    video.addEventListener('pause', syncVideoState)
    video.addEventListener('play', syncVideoState)
    video.addEventListener('volumechange', syncVideoState)
    syncVideoState()

    return () => {
      video.removeEventListener('loadedmetadata', syncVideoState)
      video.removeEventListener('pause', syncVideoState)
      video.removeEventListener('play', syncVideoState)
      video.removeEventListener('volumechange', syncVideoState)
    }
  }, [syncVideoState, videoRef])

  return {
    adjustVolume,
    isMuted,
    isPlaying,
    toggleMute,
    togglePlay,
    volume,
  }
}
