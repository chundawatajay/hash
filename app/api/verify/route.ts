import { NextResponse } from "next/server"
import { findByHash, isExpired } from "@/lib/data-access"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hash = searchParams.get("hash")?.trim() || ""
  if (!hash) {
    return NextResponse.json({ error: "hash is required" }, { status: 400 })
  }

  const rec = await findByHash(hash)
  if (!rec) {
    return NextResponse.json({ found: false, expired: null }, { status: 200 })
  }

  const expired = isExpired(rec)
  return NextResponse.json({
    found: true,
    expired,
    token: {
      value: rec.cupId,
      hash: rec.hash,
      expiresAt: rec.expiresAt,
      createdAt: rec.createdAt,
    },
  })
}
