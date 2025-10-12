import type { ExpiryOption } from "./hash"
import { generateHash, parseExpiry } from "./hash"

type TokenRecord = {
  id: string
  value: string
  hash: string
  expiresAt: Date | null
  createdAt: Date
}

// In-memory fallback store (ephemeral)
const memoryStore = new Map<string, TokenRecord>()

let prismaClientPromise: Promise<any> | null = null
async function getPrismaClient() {
  if (prismaClientPromise) return prismaClientPromise
  prismaClientPromise = (async () => {
    try {
      // Dynamic import to avoid build-time failures if Prisma Client isn't generated
      const { PrismaClient } = await import("@prisma/client")
      const prisma = new PrismaClient()
      return prisma
    } catch (err) {
      return null
    }
  })()
  return prismaClientPromise
}

export async function createToken(value: string, expiry: ExpiryOption): Promise<TokenRecord> {
  const hash = generateHash(value)
  const expiresAt = parseExpiry(expiry)
  const createdAt = new Date()

  const prisma = await getPrismaClient()
  if (prisma) {
    // Prisma path (requires DATABASE_URL and a migrated schema)
    const created = await prisma.token.create({
      data: { value, hash, expiresAt, createdAt },
    })
    return created
  }

  // In-memory fallback
  const id = crypto.randomUUID()
  const rec: TokenRecord = { id, value, hash, expiresAt, createdAt }
  memoryStore.set(hash, rec)
  return rec
}

export async function findByHash(hash: string): Promise<TokenRecord | null> {
  const prisma = await getPrismaClient()
  if (prisma) {
    const found = await prisma.token.findUnique({ where: { hash } })
    return found
  }
  return memoryStore.get(hash) ?? null
}

export async function listTokens(): Promise<TokenRecord[]> {
  const prisma = await getPrismaClient()
  if (prisma) {
    const rows = await prisma.token.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return rows
  }
  return Array.from(memoryStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function isExpired(rec: TokenRecord): boolean {
  if (!rec.expiresAt) return false
  return rec.expiresAt.getTime() <= Date.now()
}
