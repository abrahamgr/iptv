import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url'),
  sourceType: text('source_type', { enum: ['url', 'file'] }).notNull(),
  fileName: text('file_name'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const channels = sqliteTable('channels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id')
    .notNull()
    .references(() => playlists.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  logo: text('logo'),
  groupTitle: text('group_title').notNull().default('Uncategorized'),
  tvgId: text('tvg_id'),
  tvgName: text('tvg_name'),
  sortOrder: integer('sort_order').notNull().default(0),
})
