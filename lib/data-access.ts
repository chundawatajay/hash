import type { ExpiryOption } from "./hash"
import { generateHash, parseExpiry } from "./hash"
import { db } from "./db"

type TokenRecord = {
  id: string
  cupId?: string
  hash?: string
  expiresAt: Date | null
  createdAt: Date
}

export async function createToken(cupId: string, expiry: ExpiryOption): Promise<TokenRecord> {
  const hash = generateHash(cupId)
  const expiresAt = parseExpiry(expiry)
  const createdAt = new Date()

  const created = await db.token.create({
    data: { cupId, hash, expiresAt, createdAt },
  })
  return created ?? null
}

export async function findByHash(hash: string): Promise<TokenRecord | null> {
  const found = await db.token.findUnique({ where: { hash } })
  return found ?? null
}

export async function listTokens(): Promise<TokenRecord[]> {
  const rows = await db.token.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return rows
}

export function isExpired(rec: TokenRecord): boolean {
  if (!rec.expiresAt) return false
  return rec.expiresAt.getTime() <= Date.now()
}
