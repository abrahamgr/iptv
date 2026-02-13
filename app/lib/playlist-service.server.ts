import { and, eq, like, sql } from 'drizzle-orm'
import { getDb } from '~/db/client.server'
import { channels, playlists } from '~/db/schema.server'
import { type ParsedChannel, parseM3U } from './m3u-parser.server'

function insertPlaylistWithChannels(
  playlistData: typeof playlists.$inferInsert,
  parsedChannels: ParsedChannel[],
) {
  const db = getDb()
  const result = db.insert(playlists).values(playlistData).returning().get()

  if (parsedChannels.length > 0) {
    // SQLite has a 999 variable limit; 8 columns per row = batches of 100
    const BATCH_SIZE = 100
    const rows = parsedChannels.map((ch, index) => ({
      playlistId: result.id,
      name: ch.name,
      url: ch.url,
      logo: ch.logo,
      groupTitle: ch.groupTitle,
      tvgId: ch.tvgId,
      tvgName: ch.tvgName,
      sortOrder: index,
    }))

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      db.insert(channels)
        .values(rows.slice(i, i + BATCH_SIZE))
        .run()
    }
  }

  return result
}

export async function createPlaylistFromURL(name: string, url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.statusText}`)
  }
  const content = await response.text()
  const parsedChannels = parseM3U(content)

  return insertPlaylistWithChannels(
    { name, url, sourceType: 'url' },
    parsedChannels,
  )
}

export function createPlaylistFromFile(
  name: string,
  fileName: string,
  content: string,
) {
  const parsedChannels = parseM3U(content)

  return insertPlaylistWithChannels(
    { name, fileName, sourceType: 'file' },
    parsedChannels,
  )
}

export function getAllPlaylists() {
  const db = getDb()
  return db.select().from(playlists).all()
}

export function getPlaylistWithChannels(id: number) {
  const db = getDb()
  const playlist = db.select().from(playlists).where(eq(playlists.id, id)).get()
  if (!playlist) return null

  const channelList = db
    .select()
    .from(channels)
    .where(eq(channels.playlistId, id))
    .all()

  const grouped: Record<string, (typeof channelList)[number][]> = {}
  for (const channel of channelList) {
    const group = channel.groupTitle
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(channel)
  }

  return { playlist, channels: channelList, grouped }
}

export function getChannel(id: number) {
  const db = getDb()
  return db.select().from(channels).where(eq(channels.id, id)).get() ?? null
}

export function deletePlaylist(id: number) {
  const db = getDb()
  db.delete(playlists).where(eq(playlists.id, id)).run()
}

type ChannelFilters = {
  categories?: string[]
  searchQuery?: string
}

export function getChannelsByCategory(
  playlistId: number,
  category: string,
  limit: number,
  offset: number,
  searchQuery?: string,
) {
  const db = getDb()
  const conditions = [
    eq(channels.playlistId, playlistId),
    eq(channels.groupTitle, category),
  ]

  if (searchQuery) {
    conditions.push(like(channels.name, `%${searchQuery}%`))
  }

  const channelList = db
    .select()
    .from(channels)
    .where(and(...conditions))
    .orderBy(channels.sortOrder)
    .limit(limit)
    .offset(offset)
    .all()

  const totalCount = db
    .select({ count: sql<number>`count(*)` })
    .from(channels)
    .where(and(...conditions))
    .get()

  return {
    channels: channelList,
    totalCount: totalCount?.count ?? 0,
    hasMore: offset + limit < (totalCount?.count ?? 0),
  }
}

export function getPlaylistWithPaginatedChannels(
  id: number,
  limitPerCategory: number = 30,
  filters?: ChannelFilters,
) {
  const db = getDb()
  const playlist = db.select().from(playlists).where(eq(playlists.id, id)).get()
  if (!playlist) return null

  // Get all categories (filtered if needed)
  const categoryConditions = [eq(channels.playlistId, id)]
  if (filters?.categories && filters.categories.length > 0) {
    const catConditions = filters.categories.map(
      (cat) =>
        sql`(${channels.groupTitle} = ${cat} OR ${channels.groupTitle} LIKE ${`${cat};%`} OR ${channels.groupTitle} LIKE ${`%;${cat}`} OR ${channels.groupTitle} LIKE ${`%;${cat};%`})`,
    )
    categoryConditions.push(sql`(${sql.join(catConditions, sql` OR `)})`)
  }

  const categoryResults = db
    .selectDistinct({ groupTitle: channels.groupTitle })
    .from(channels)
    .where(and(...categoryConditions))
    .all()

  const categories = categoryResults.map((c) => c.groupTitle)

  // Fetch paginated channels for each category
  const grouped: Record<string, (typeof channels.$inferSelect)[]> = {}
  const totalCounts: Record<string, number> = {}
  const hasMore: Record<string, boolean> = {}

  for (const category of categories) {
    const conditions = [
      eq(channels.playlistId, id),
      eq(channels.groupTitle, category),
    ]

    if (filters?.searchQuery) {
      conditions.push(like(channels.name, `%${filters.searchQuery}%`))
    }

    const channelList = db
      .select()
      .from(channels)
      .where(and(...conditions))
      .orderBy(channels.sortOrder)
      .limit(limitPerCategory)
      .all()

    const totalCountResult = db
      .select({ count: sql<number>`count(*)` })
      .from(channels)
      .where(and(...conditions))
      .get()

    const total = totalCountResult?.count ?? 0

    grouped[category] = channelList
    totalCounts[category] = total
    hasMore[category] = channelList.length < total
  }

  // Get total channel count for display
  const allChannelsCount = db
    .select({ count: sql<number>`count(*)` })
    .from(channels)
    .where(eq(channels.playlistId, id))
    .get()

  return {
    playlist,
    grouped,
    totalCounts,
    hasMore,
    totalChannels: allChannelsCount?.count ?? 0,
  }
}

export function getChannelsAlphabetically(
  playlistId: number,
  limit: number,
  offset: number,
  filters?: ChannelFilters,
) {
  const db = getDb()
  const conditions = [eq(channels.playlistId, playlistId)]

  if (filters?.categories && filters.categories.length > 0) {
    const categoryConditions = filters.categories.map(
      (cat) =>
        sql`(${channels.groupTitle} = ${cat} OR ${channels.groupTitle} LIKE ${`${cat};%`} OR ${channels.groupTitle} LIKE ${`%;${cat}`} OR ${channels.groupTitle} LIKE ${`%;${cat};%`})`,
    )
    conditions.push(sql`(${sql.join(categoryConditions, sql` OR `)})`)
  }

  if (filters?.searchQuery) {
    conditions.push(like(channels.name, `%${filters.searchQuery}%`))
  }

  const channelList = db
    .select()
    .from(channels)
    .where(and(...conditions))
    .orderBy(sql`${channels.name} COLLATE NOCASE`)
    .limit(limit)
    .offset(offset)
    .all()

  const totalCountResult = db
    .select({ count: sql<number>`count(*)` })
    .from(channels)
    .where(and(...conditions))
    .get()

  const totalCount = totalCountResult?.count ?? 0

  return {
    channels: channelList,
    totalCount,
    hasMore: offset + limit < totalCount,
  }
}

export function getChannelsCount(playlistId: number, filters?: ChannelFilters) {
  const db = getDb()
  const conditions = [eq(channels.playlistId, playlistId)]

  if (filters?.categories && filters.categories.length > 0) {
    const categoryConditions = filters.categories.map(
      (cat) =>
        sql`(${channels.groupTitle} = ${cat} OR ${channels.groupTitle} LIKE ${`${cat};%`} OR ${channels.groupTitle} LIKE ${`%;${cat}`} OR ${channels.groupTitle} LIKE ${`%;${cat};%`})`,
    )
    conditions.push(sql`(${sql.join(categoryConditions, sql` OR `)})`)
  }

  if (filters?.searchQuery) {
    conditions.push(like(channels.name, `%${filters.searchQuery}%`))
  }

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(channels)
    .where(and(...conditions))
    .get()

  return result?.count ?? 0
}

export function getPlaylistWithChannelsAlphabetically(
  id: number,
  limit: number = 30,
  filters?: ChannelFilters,
) {
  const db = getDb()
  const playlist = db.select().from(playlists).where(eq(playlists.id, id)).get()
  if (!playlist) return null

  // Get all categories for filter dropdown
  const allCategoriesResult = db
    .selectDistinct({ groupTitle: channels.groupTitle })
    .from(channels)
    .where(eq(channels.playlistId, id))
    .all()

  const allCategories = [
    ...new Set(
      allCategoriesResult.flatMap((c) =>
        c.groupTitle
          .split(';')
          .map((cat) => cat.trim())
          .filter(Boolean),
      ),
    ),
  ].sort()

  // Get initial batch of channels alphabetically
  const channelsResult = getChannelsAlphabetically(id, limit, 0, filters)

  // Get total count (unfiltered) for display
  const totalChannelsCount = db
    .select({ count: sql<number>`count(*)` })
    .from(channels)
    .where(eq(channels.playlistId, id))
    .get()

  return {
    playlist,
    channels: channelsResult.channels,
    totalCount: channelsResult.totalCount,
    hasMore: channelsResult.hasMore,
    totalChannels: totalChannelsCount?.count ?? 0,
    allCategories,
  }
}
