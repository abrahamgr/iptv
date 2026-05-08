import { type RefObject, useCallback, useEffect, useState } from 'react'

export function useVideoControls(videoRef: RefObject<HTMLVideoElement | null>) {
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  const markLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const markReady = useCallback(() => {
    setHasLoadedOnce(true)
    setIsLoading(false)
  }, [])

  const markError = useCallback(() => {
    setIsLoading(false)
  }, [])

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

    video.addEventListener('loadstart', markLoading)
    video.addEventListener('stalled', markLoading)
    video.addEventListener('waiting', markLoading)
    video.addEventListener('canplay', markReady)
    video.addEventListener('canplaythrough', markReady)
    video.addEventListener('error', markError)
    video.addEventListener('loadedmetadata', syncVideoState)
    video.addEventListener('loadedmetadata', markReady)
    video.addEventListener('pause', syncVideoState)
    video.addEventListener('play', syncVideoState)
    video.addEventListener('playing', markReady)
    video.addEventListener('volumechange', syncVideoState)
    syncVideoState()

    return () => {
      video.removeEventListener('loadstart', markLoading)
      video.removeEventListener('stalled', markLoading)
      video.removeEventListener('waiting', markLoading)
      video.removeEventListener('canplay', markReady)
      video.removeEventListener('canplaythrough', markReady)
      video.removeEventListener('error', markError)
      video.removeEventListener('loadedmetadata', syncVideoState)
      video.removeEventListener('loadedmetadata', markReady)
      video.removeEventListener('pause', syncVideoState)
      video.removeEventListener('play', syncVideoState)
      video.removeEventListener('playing', markReady)
      video.removeEventListener('volumechange', syncVideoState)
    }
  }, [markError, markLoading, markReady, syncVideoState, videoRef])

  return {
    adjustVolume,
    hasLoadedOnce,
    isLoading,
    isMuted,
    isPlaying,
    toggleMute,
    togglePlay,
    volume,
  }
}
