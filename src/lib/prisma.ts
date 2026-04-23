import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Resolve the SQLite database file path
  // DATABASE_URL from .env is like "file:./dev.db"
  // We need to strip the "file:" prefix and resolve it relative to the project root
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db'
  }
  const rawUrl = process.env.DATABASE_URL
  const relativePath = rawUrl.replace(/^file:/, '')
  const absolutePath = path.resolve(process.cwd(), relativePath)

  const adapter = new PrismaBetterSqlite3({ url: absolutePath })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
