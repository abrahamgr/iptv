import Hls from 'hls.js'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

type VideoPlayerProps = {
  url: string
  className?: string
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer({ url, className }, ref) {
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
      }

      return () => {
        hls?.destroy()
      }
    }, [url])

    return (
      <video
        ref={videoRef}
        playsInline
        className={className ?? 'w-full max-h-[80vh] bg-black rounded-xl'}
      />
    )
  },
)
