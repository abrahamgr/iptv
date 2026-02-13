import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from './schema.server'

const DB_PATH = resolve('data/iptv.db')
const MIGRATIONS_FOLDER = resolve('app/db/migrations')

let db: ReturnType<typeof createDb>

function createDb() {
  const dataDir = dirname(DB_PATH)
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  const sqlite = new Database(DB_PATH)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  // run only on prod, for dev migrations are run manually with `npm run db:migrate`
  if (import.meta.env.PROD) {
    console.log('MIGRATIONS_FOLDER', MIGRATIONS_FOLDER)
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
  }
  return db
}

export function getDb() {
  if (!db) {
    db = createDb()
  }
  return db
}
