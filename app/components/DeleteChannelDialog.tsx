import { useEffect, useRef } from 'react'
import { useFetcher } from 'react-router'
import type { Channel } from './channel-types'

type DeleteChannelDialogProps = {
  channel: Channel
  onClose: () => void
}

export function DeleteChannelDialog({
  channel,
  onClose,
}: DeleteChannelDialogProps) {
  const fetcher = useFetcher()
  const hasSubmittedRef = useRef(false)
  const isDeleting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      hasSubmittedRef.current = true
      return
    }

    if (hasSubmittedRef.current) {
      onClose()
    }
  }, [fetcher.state, onClose])

  return (
    <div
      aria-labelledby="delete-channel-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
        <h2 id="delete-channel-title" className="text-3xl font-bold">
          Delete channel?
        </h2>
        <p className="mt-4 text-xl text-gray-300">
          This will permanently delete "{channel.name}".
        </p>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="deleteChannel" />
            <input type="hidden" name="channelId" value={channel.id} />
            <button
              type="submit"
              disabled={isDeleting}
              className="bg-red-700 hover:bg-red-600 disabled:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-red-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  )
}
