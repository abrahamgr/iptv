import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import type { EditChannelErrors } from '~/lib/channel-schemas'
import type { FullChannel, PlaylistOption } from './channel-types'

type EditChannelDialogProps = {
  channel: FullChannel
  allPlaylists: PlaylistOption[]
  onClose: () => void
}

type EditActionData = {
  intent: 'editChannel'
  errors: EditChannelErrors
} | null

function isValidHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export function EditChannelDialog({
  channel,
  allPlaylists,
  onClose,
}: EditChannelDialogProps) {
  const fetcher = useFetcher<EditActionData>()
  const hasSubmittedRef = useRef(false)
  const isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading'
  const errors = fetcher.data?.errors

  const [logoUrl, setLogoUrl] = useState(channel.logo ?? '')
  const [logoImgError, setLogoImgError] = useState(false)
  const isValidLogoUrl = isValidHttpUrl(logoUrl)
  const showLogoPreview = isValidLogoUrl && !logoImgError

  useEffect(() => {
    if (fetcher.state !== 'idle') {
      hasSubmittedRef.current = true
      return
    }

    if (hasSubmittedRef.current && !errors) {
      onClose()
    }
  }, [fetcher.state, errors, onClose])

  return (
    <div
      aria-labelledby="edit-channel-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-xl border border-gray-700 bg-gray-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 id="edit-channel-title" className="text-3xl font-bold">
          Edit Channel
        </h2>

        <fetcher.Form
          method="post"
          action="/channels/edit"
          className="mt-6 space-y-5"
        >
          <input type="hidden" name="intent" value="editChannel" />
          <input type="hidden" name="channelId" value={channel.id} />

          {/* Name */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-lg font-medium mb-2"
            >
              Name
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              defaultValue={channel.name}
              className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            />
            {errors?.name?._errors[0] && (
              <p className="mt-1 text-red-400 text-base">
                {errors.name._errors[0]}
              </p>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="edit-url"
              className="block text-lg font-medium mb-2"
            >
              Stream URL
            </label>
            <input
              id="edit-url"
              name="url"
              type="text"
              defaultValue={channel.url}
              className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            />
            {errors?.url?._errors[0] && (
              <p className="mt-1 text-red-400 text-base">
                {errors.url._errors[0]}
              </p>
            )}
          </div>

          {/* Logo */}
          <div>
            <label
              htmlFor="edit-logo"
              className="block text-lg font-medium mb-2"
            >
              Logo URL{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-3">
              {showLogoPreview && (
                <div className="shrink-0 h-16 w-16 rounded-lg bg-gray-700 flex items-center justify-center p-2 border border-gray-600">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                    onError={() => setLogoImgError(true)}
                  />
                </div>
              )}
              <input
                id="edit-logo"
                name="logo"
                type="text"
                value={logoUrl}
                onChange={(e) => {
                  setLogoUrl(e.target.value)
                  setLogoImgError(false)
                }}
                className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              />
            </div>
          </div>

          {/* Group / Category */}
          <div>
            <label
              htmlFor="edit-group"
              className="block text-lg font-medium mb-2"
            >
              Category
            </label>
            <input
              id="edit-group"
              name="groupTitle"
              type="text"
              defaultValue={channel.groupTitle}
              className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            />
            {errors?.groupTitle?._errors[0] && (
              <p className="mt-1 text-red-400 text-base">
                {errors.groupTitle._errors[0]}
              </p>
            )}
          </div>

          {/* TVG Name */}
          <div>
            <label
              htmlFor="edit-tvg"
              className="block text-lg font-medium mb-2"
            >
              TVG Name{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="edit-tvg"
              name="tvgName"
              type="text"
              defaultValue={channel.tvgName ?? ''}
              className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            />
          </div>

          {/* Playlist dropdown */}
          <div>
            <label
              htmlFor="edit-playlist"
              className="block text-lg font-medium mb-2"
            >
              Playlist
            </label>
            <select
              id="edit-playlist"
              name="playlistId"
              defaultValue={channel.playlistId}
              className="w-full bg-gray-700 border border-gray-600 text-lg p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
            >
              {allPlaylists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors?.playlistId?._errors[0] && (
              <p className="mt-1 text-red-400 text-base">
                {errors.playlistId._errors[0]}
              </p>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 text-white text-xl font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-800 transition-colors"
            >
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  )
}
