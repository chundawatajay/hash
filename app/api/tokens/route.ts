import { NextResponse } from "next/server"
import { listTokens, isExpired } from "@/lib/data-access"

export async function GET() {
  const tokens = await listTokens()
  const mappedTokens = tokens.map((t) => ({
    cupId: t.cupId,
    hash: t.hash,
    expiresAt: t.expiresAt,
    createdAt: t.createdAt,
    expired: isExpired(t),
  }))
  
  const totalKeys = mappedTokens.length
  const totalActive = mappedTokens.filter(t => !t.expired).length
  
  return NextResponse.json({
    tokens: mappedTokens,
    stats: {
      totalKeys,
      totalActive,
    }
  })
}
