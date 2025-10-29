import { NextResponse } from "next/server"
import { listTokens, isExpired } from "@/lib/data-access"

export async function GET() {
  const tokens = await listTokens()
  return NextResponse.json(
    tokens.map((t) => ({
      cupId: t.cupId,
      hash: t.hash,
      expiresAt: t.expiresAt,
      createdAt: t.createdAt,
      expired: isExpired(t),
    })),
  )
}
