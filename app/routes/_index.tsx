import { Link } from "react-router";
import { getAllPlaylists } from "~/lib/playlist-service.server";
import { PlaylistCard } from "~/components/PlaylistCard";
import type { Route } from "./+types/_index";

export function loader() {
  const playlists = getAllPlaylists();
  return { playlists };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { playlists } = loaderData;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-5xl font-bold">IPTV Playlists</h1>
          <Link
            to="/playlists/new"
            className="bg-blue-600 hover:bg-blue-500 text-white text-2xl font-semibold py-6 px-12 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-500 focus:ring-offset-4 focus:ring-offset-gray-900 transition-colors"
          >
            Add Playlist
          </Link>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-3xl text-gray-400 mb-8">No playlists yet</p>
            <Link
              to="/playlists/new"
              className="text-2xl text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-8 focus:ring-blue-500 rounded-lg p-2"
            >
              Add your first playlist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
