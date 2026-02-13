import { eq } from "drizzle-orm";
import { getDb } from "~/db/client.server";
import { playlists, channels } from "~/db/schema.server";
import { parseM3U, type ParsedChannel } from "./m3u-parser.server";

function insertPlaylistWithChannels(
  playlistData: typeof playlists.$inferInsert,
  parsedChannels: ParsedChannel[]
) {
  const db = getDb();
  const result = db.insert(playlists).values(playlistData).returning().get();

  if (parsedChannels.length > 0) {
    // SQLite has a 999 variable limit; 8 columns per row = batches of 100
    const BATCH_SIZE = 100;
    const rows = parsedChannels.map((ch, index) => ({
      playlistId: result.id,
      name: ch.name,
      url: ch.url,
      logo: ch.logo,
      groupTitle: ch.groupTitle,
      tvgId: ch.tvgId,
      tvgName: ch.tvgName,
      sortOrder: index,
    }));

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      db.insert(channels).values(rows.slice(i, i + BATCH_SIZE)).run();
    }
  }

  return result;
}

export async function createPlaylistFromURL(name: string, url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.statusText}`);
  }
  const content = await response.text();
  const parsedChannels = parseM3U(content);

  return insertPlaylistWithChannels(
    { name, url, sourceType: "url" },
    parsedChannels
  );
}

export function createPlaylistFromFile(
  name: string,
  fileName: string,
  content: string
) {
  const parsedChannels = parseM3U(content);

  return insertPlaylistWithChannels(
    { name, fileName, sourceType: "file" },
    parsedChannels
  );
}

export function getAllPlaylists() {
  const db = getDb();
  return db.select().from(playlists).all();
}

export function getPlaylistWithChannels(id: number) {
  const db = getDb();
  const playlist = db.select().from(playlists).where(eq(playlists.id, id)).get();
  if (!playlist) return null;

  const channelList = db
    .select()
    .from(channels)
    .where(eq(channels.playlistId, id))
    .all();

  const grouped: Record<string, (typeof channelList)[number][]> = {};
  for (const channel of channelList) {
    const group = channel.groupTitle;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(channel);
  }

  return { playlist, channels: channelList, grouped };
}

export function getChannel(id: number) {
  const db = getDb();
  return db.select().from(channels).where(eq(channels.id, id)).get() ?? null;
}

export function deletePlaylist(id: number) {
  const db = getDb();
  db.delete(playlists).where(eq(playlists.id, id)).run();
}
