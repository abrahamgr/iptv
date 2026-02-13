import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("playlists/new", "routes/playlists.new.tsx"),
  route("playlists/:id", "routes/playlists.$id.tsx"),
  route("playlists/:id/watch/:channelId", "routes/playlists.$id.watch.$channelId.tsx"),
] satisfies RouteConfig;
