import Hls from 'hls.js'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

type VideoPlayerProps = {
  url: string
  className?: string
  onHlsReady?: (hls: Hls | null) => void
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer({ url, className, onHlsReady }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, [])

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      let hls: Hls | null = null

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
        })

        hls.loadSource(url)
        hls.attachMedia(video)
        onHlsReady?.(hls)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {})
        })

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError()
                break
              default:
                hls?.destroy()
                break
            }
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari / native HLS
        video.src = url
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {})
        })
        onHlsReady?.(null)
      }

      return () => {
        hls?.destroy()
        onHlsReady?.(null)
      }
    }, [url, onHlsReady])

    return (
      <video
        ref={videoRef}
        playsInline
        className={className ?? 'w-full max-h-[80vh] bg-black rounded-xl'}
      />
    )
  },
)
