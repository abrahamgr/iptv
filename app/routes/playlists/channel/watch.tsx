import type { MouseEvent } from 'react'
import { useFetcher, useLocation, useNavigate } from 'react-router'
import { WatchPlayer } from '~/components/watch/WatchPlayer'
import { getChannel, setChannelFavorite } from '~/lib/playlist-service.server'
import type { Route } from './+types/watch'

export function loader({ params }: Route.LoaderArgs) {
  const channel = getChannel(Number(params.channelId))
  if (!channel) {
    throw new Response('Channel not found', { status: 404 })
  }
  return { channel, playlistId: params.id }
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'favorite') {
    setChannelFavorite(
      Number(params.channelId),
      formData.get('isFavorite') === 'true',
    )
    return null
  }

  return null
}

export default function WatchChannel({ loaderData }: Route.ComponentProps) {
  const { channel, playlistId } = loaderData
  const favoriteFetcher = useFetcher()
  const location = useLocation()
  const navigation = useNavigate()
  const optimisticFavorite = favoriteFetcher.formData?.get('isFavorite')
  const isFavorite =
    optimisticFavorite === 'true' ||
    (optimisticFavorite === undefined && channel.isFavorite)
  const backTo = `/playlists/${playlistId}${location.search}`

  const handleBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (history.length > 1) {
      event.preventDefault()
      navigation(-1)
    }
  }

  return (
    <WatchPlayer
      backTo={backTo}
      channel={channel}
      favoriteControl={
        <favoriteFetcher.Form method="post">
          <input type="hidden" name="intent" value="favorite" />
          <input
            type="hidden"
            name="isFavorite"
            value={isFavorite ? 'false' : 'true'}
          />
          <button
            type="submit"
            aria-label={
              isFavorite
                ? 'Remove channel from favorites'
                : 'Add channel to favorites'
            }
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-3xl leading-none transition-colors hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500 ${
              isFavorite ? 'text-yellow-300' : 'text-white'
            }`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </favoriteFetcher.Form>
      }
      onBack={handleBack}
      playlistId={playlistId}
    />
  )
}
