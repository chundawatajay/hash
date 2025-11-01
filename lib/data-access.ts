import type { ExpiryOption } from "./hash"
import { generateHash, parseExpiry } from "./hash"
import { db } from "./db"
import { randomUUID } from "node:crypto"

type TokenRecord = {
  id: string
  cupId?: string
  hash?: string
  expiresAt: Date | null
  createdAt: Date
}

export async function createToken(expiry: ExpiryOption): Promise<TokenRecord | null> {
 try {
   const hash = generateHash(randomUUID())
   const expiresAt = parseExpiry(expiry)
   const createdAt = new Date()
 
   const created = await db.token.create({
     data: { cupId: "", hash, expiresAt, createdAt },
   })
   return created ?? null
 } catch (error) {
   console.log("error",error)
   return null
 }
}

export async function findByHash(hash: string): Promise<TokenRecord | null> {
  const found = await db.token.findUnique({ where: { hash } })
  return found ?? null
}

export async function listTokens(): Promise<TokenRecord[]> {
  try {
    const rows = await db.token.findMany({
      where: { cupId: { not : "" } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return rows ?? []
  } catch (error) {
    console.log("error",error)
    return []
  }
}

export function isExpired(rec: TokenRecord): boolean {
  if (!rec.expiresAt) return false
  return rec.expiresAt.getTime() <= Date.now()
}


export async function assignToken(hash: string, cupId: string): Promise<TokenRecord | null> {
  const rec = await findByHash(hash)
  if (!rec) {
    return null
  }

  const updated = await db.token.update({
    where: { hash },
    data: { cupId },
  })
  return updated ?? null
}