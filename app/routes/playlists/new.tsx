import { useState } from 'react'
import {
  data,
  Form,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import {
  createPlaylistFromFile,
  createPlaylistFromURL,
} from '~/lib/playlist-service.server'
import type { Route } from './+types/new'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const sourceType = formData.get('sourceType') as string

  if (!name?.trim()) {
    return data({ error: 'Playlist name is required' }, { status: 400 })
  }

  try {
    if (sourceType === 'url') {
      const url = formData.get('url') as string
      if (!url?.trim()) {
        return data({ error: 'URL is required' }, { status: 400 })
      }
      await createPlaylistFromURL(name.trim(), url.trim())
    } else {
      const file = formData.get('file') as File
      if (!file || file.size === 0) {
        return data({ error: 'File is required' }, { status: 400 })
      }
      const content = await file.text()
      createPlaylistFromFile(name.trim(), file.name, content)
    }
    return redirect('/')
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to add playlist'
    return data({ error: message }, { status: 400 })
  }
}

export default function NewPlaylist() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [sourceType, setSourceType] = useState<'url' | 'file'>('url')

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-12">Add Playlist</h1>

        {actionData?.error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 text-xl p-6 rounded-xl mb-8">
            {actionData.error}
          </div>
        )}

        <Form method="post" encType="multipart/form-data" className="space-y-8">
          <div>
            <label className="block text-2xl font-medium mb-3">
              Playlist Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-gray-800 border border-gray-600 text-xl p-5 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Playlist"
            />
          </div>

          <div>
            <label className="block text-2xl font-medium mb-4">Source</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`text-xl py-4 px-8 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 ${
                  sourceType === 'url'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`text-xl py-4 px-8 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-8 focus:ring-blue-500 ${
                  sourceType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                File Upload
              </button>
            </div>
            <input type="hidden" name="sourceType" value={sourceType} />
          </div>

          {sourceType === 'url' ? (
            <div>
              <label className="block text-2xl font-medium mb-3">
                Playlist URL
              </label>
              <input
                type="url"
                name="url"
                className="w-full bg-gray-800 border border-gray-600 text-xl p-5 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/playlist.m3u"
              />
            </div>
          ) : (
            <div>
              <label className="block text-2xl font-medium mb-3">
                M3U File
              </label>
              <input
                type="file"
                name="file"
                accept=".m3u,.m3u8"
                className="w-full bg-gray-800 border border-gray-600 text-xl p-5 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-500 focus:outline-none focus:ring-8 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-6 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white text-2xl font-semibold py-6 px-12 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900 transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Playlist'}
            </button>
            <a
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white text-2xl font-semibold py-6 px-12 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900 transition-colors"
            >
              Cancel
            </a>
          </div>
        </Form>
      </div>
    </div>
  )
}
