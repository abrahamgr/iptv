import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("playlists/new", "routes/playlists/new.tsx"),
  route("playlists/:id", "routes/playlists/view.tsx"),
  route("playlists/:id/watch/:channelId", "routes/playlists/channel/watch.tsx"),
] satisfies RouteConfig;
