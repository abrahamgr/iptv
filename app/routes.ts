import {
  index,
  layout,
  type RouteConfig,
  route,
} from '@react-router/dev/routes'

export default [
  layout('routes/layouts/app-layout.tsx', [
    index('routes/home.tsx'),
    route('playlists/new', 'routes/playlists/new.tsx'),
    route('playlists/:id', 'routes/playlists/view.tsx'),
  ]),
  layout('routes/layouts/watch-layout.tsx', [
    route(
      'playlists/:id/watch/:channelId',
      'routes/playlists/channel/watch.tsx',
    ),
  ]),
] satisfies RouteConfig
