import { index, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('playlists/new', 'routes/playlists/new.tsx'),
  route('playlists/:id', 'routes/playlists/view.tsx'),
  route('playlists/:id/watch/:channelId', 'routes/playlists/channel/watch.tsx'),
] satisfies RouteConfig
